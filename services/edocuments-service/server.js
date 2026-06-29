const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Excel/CSV support for QuickBooks-style invoice imports
let xlsx, csvParser;
try { xlsx = require('xlsx'); } catch (e) { xlsx = null; console.warn('xlsx not available'); }
try { csvParser = require('csv-parse/sync'); } catch (e) { csvParser = null; console.warn('csv-parse not available'); }

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================================================
// FILE SYSTEM STORAGE (persistent, not in-memory)
// =============================================================================
const EDOCS_ROOT = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
const templatesDir = path.join(uploadsDir, '_templates');
const documentsDir = path.join(uploadsDir, '_documents');

// Ensure all directories exist
[EDOCS_ROOT, uploadsDir, templatesDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// =============================================================================
// PERSISTENT STORAGE HELPERS (replaces in-memory Maps)
// =============================================================================
function loadStore(name) {
  const filePath = path.join(EDOCS_ROOT, `${name}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) { console.error(`Failed to load ${name}:`, e.message); }
  return {};
}

function saveStore(name, data) {
  const filePath = path.join(EDOCS_ROOT, `${name}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) { console.error(`Failed to save ${name}:`, e.message); }
}

// Persistent stores
let documentsStore = loadStore('documents'); // { [tenantSlug-docId]: doc }
let templatesStore = loadStore('templates'); // { [tenantSlug-templateId]: template }
let documentHistory = loadStore('history'); // { [tenantSlug]: [historyEntry] }
let tenantSettings = loadStore('settings'); // { [tenantSlug]: { colors, fonts, etc } }

// Auto-save every 5 seconds
setInterval(() => {
  saveStore('documents', documentsStore);
  saveStore('templates', templatesStore);
  saveStore('history', documentHistory);
  saveStore('settings', tenantSettings);
}, 5000);

// =============================================================================
// DEFAULT TEMPLATES
// =============================================================================
function getDefaultTemplates() {
  return [
    {
      id: 'invoice-template',
      name: 'Invoice',
      type: 'invoice',
      description: 'Funeral service invoice template',
      fields: [
        { key: 'invoiceNumber', label: 'Invoice Number', placeholder: '{{invoiceNumber}}', type: 'text' },
        { key: 'clientName', label: 'Client Name', placeholder: '{{clientName}}', type: 'text' },
        { key: 'clientPhone', label: 'Client Phone', placeholder: '{{clientPhone}}', type: 'text' },
        { key: 'serviceDate', label: 'Service Date', placeholder: '{{serviceDate}}', type: 'date' },
        { key: 'totalAmount', label: 'Total Amount', placeholder: '{{totalAmount}}', type: 'number' },
        { key: 'deceasedName', label: 'Deceased Name', placeholder: '{{deceasedName}}', type: 'text' },
        { key: 'items', label: 'Items/Services', placeholder: '{{items}}', type: 'textarea' }
      ],
      isDefault: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'receipt-template',
      name: 'Receipt',
      type: 'receipt',
      description: 'Payment receipt document template',
      fields: [
        { key: 'receiptNumber', label: 'Receipt Number', placeholder: '{{receiptNumber}}', type: 'text' },
        { key: 'payerName', label: 'Payer Name', placeholder: '{{payerName}}', type: 'text' },
        { key: 'amount', label: 'Amount', placeholder: '{{amount}}', type: 'number' },
        { key: 'paymentDate', label: 'Payment Date', placeholder: '{{paymentDate}}', type: 'date' },
        { key: 'paymentMethod', label: 'Payment Method', placeholder: '{{paymentMethod}}', type: 'select', options: ['Cash', 'M-Pesa', 'Bank Transfer', 'Card'] },
        { key: 'transactionRef', label: 'Transaction Reference', placeholder: '{{transactionRef}}', type: 'text' }
      ],
      isDefault: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'agreement-template',
      name: 'Funeral Service Agreement',
      type: 'agreement',
      description: 'Service agreement form template',
      fields: [
        { key: 'agreementDate', label: 'Agreement Date', placeholder: '{{agreementDate}}', type: 'date' },
        { key: 'clientName', label: 'Client Name', placeholder: '{{clientName}}', type: 'text' },
        { key: 'clientIDNumber', label: 'Client ID Number', placeholder: '{{clientIDNumber}}', type: 'text' },
        { key: 'clientAddress', label: 'Client Address', placeholder: '{{clientAddress}}', type: 'textarea' },
        { key: 'clientPhone', label: 'Client Phone', placeholder: '{{clientPhone}}', type: 'text' },
        { key: 'deceasedName', label: 'Deceased Name', placeholder: '{{deceasedName}}', type: 'text' },
        { key: 'serviceType', label: 'Service Type', placeholder: '{{serviceType}}', type: 'select', options: ['Burial', 'Cremation', 'Memorial Service', 'Full Package'] },
        { key: 'serviceDate', label: 'Service Date', placeholder: '{{serviceDate}}', type: 'date' },
        { key: 'totalCost', label: 'Total Cost', placeholder: '{{totalCost}}', type: 'number' },
        { key: 'specialRequests', label: 'Special Requests', placeholder: '{{specialRequests}}', type: 'textarea' }
      ],
      isDefault: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'authorization-template',
      name: 'Authorization Form',
      type: 'form',
      description: 'Family authorization form template',
      fields: [
        { key: 'authorizationDate', label: 'Date', placeholder: '{{authorizationDate}}', type: 'date' },
        { key: 'authorizedName', label: 'Authorized Person Name', placeholder: '{{authorizedName}}', type: 'text' },
        { key: 'authorizedIDNumber', label: 'ID Number', placeholder: '{{authorizedIDNumber}}', type: 'text' },
        { key: 'authorizedAction', label: 'Authorized Action', placeholder: '{{authorizedAction}}', type: 'textarea' },
        { key: 'deceasedName', label: 'Deceased Name', placeholder: '{{deceasedName}}', type: 'text' },
        { key: 'relationship', label: 'Relationship to Deceased', placeholder: '{{relationship}}', type: 'select', options: ['Spouse', 'Child', 'Parent', 'Sibling', 'Other Relative', 'Legal Representative'] }
      ],
      isDefault: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'deceased-info-template',
      name: 'Deceased Information Form',
      type: 'form',
      description: 'Deceased details form template',
      fields: [
        { key: 'fullName', label: 'Full Name', placeholder: '{{fullName}}', type: 'text' },
        { key: 'dateOfBirth', label: 'Date of Birth', placeholder: '{{dateOfBirth}}', type: 'date' },
        { key: 'dateOfDeath', label: 'Date of Death', placeholder: '{{dateOfDeath}}', type: 'date' },
        { key: 'placeOfBirth', label: 'Place of Birth', placeholder: '{{placeOfBirth}}', type: 'text' },
        { key: 'placeOfDeath', label: 'Place of Death', placeholder: '{{placeOfDeath}}', type: 'text' },
        { key: 'occupation', label: 'Occupation', placeholder: '{{occupation}}', type: 'text' },
        { key: 'nextOfKin', label: 'Next of Kin', placeholder: '{{nextOfKin}}', type: 'text' },
        { key: 'nextOfKinPhone', label: 'Next of Kin Phone', placeholder: '{{nextOfKinPhone}}', type: 'text' },
        { key: 'causeOfDeath', label: 'Cause of Death', placeholder: '{{causeOfDeath}}', type: 'textarea' }
      ],
      isDefault: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'cremation-cert-template',
      name: 'Cremation Certificate',
      type: 'certificate',
      description: 'Cremation authorization template',
      fields: [
        { key: 'certificateNumber', label: 'Certificate Number', placeholder: '{{certificateNumber}}', type: 'text' },
        { key: 'deceasedName', label: 'Deceased Name', placeholder: '{{deceasedName}}', type: 'text' },
        { key: 'dateOfDeath', label: 'Date of Death', placeholder: '{{dateOfDeath}}', type: 'date' },
        { key: 'cremationDate', label: 'Cremation Date', placeholder: '{{cremationDate}}', type: 'date' },
        { key: 'crematorium', label: 'Crematorium', placeholder: '{{crematorium}}', type: 'text' },
        { key: 'authorizedBy', label: 'Authorized By', placeholder: '{{authorizedBy}}', type: 'text' },
        { key: 'witnessName', label: 'Witness Name', placeholder: '{{witnessName}}', type: 'text' }
      ],
      isDefault: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'burial-permit-template',
      name: 'Burial Permit',
      type: 'permit',
      description: 'Burial permit form template',
      fields: [
        { key: 'permitNumber', label: 'Permit Number', placeholder: '{{permitNumber}}', type: 'text' },
        { key: 'deceasedName', label: 'Deceased Name', placeholder: '{{deceasedName}}', type: 'text' },
        { key: 'dateOfDeath', label: 'Date of Death', placeholder: '{{dateOfDeath}}', type: 'date' },
        { key: 'burialDate', label: 'Burial Date', placeholder: '{{burialDate}}', type: 'date' },
        { key: 'cemeteryName', label: 'Cemetery Name', placeholder: '{{cemeteryName}}', type: 'text' },
        { key: 'plotNumber', label: 'Plot Number', placeholder: '{{plotNumber}}', type: 'text' },
        { key: 'graveDepth', label: 'Grave Depth (ft)', placeholder: '{{graveDepth}}', type: 'number' }
      ],
      isDefault: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'embalming-consent-template',
      name: 'Embalming Consent',
      type: 'consent',
      description: 'Embalming consent form template',
      fields: [
        { key: 'consentDate', label: 'Consent Date', placeholder: '{{consentDate}}', type: 'date' },
        { key: 'deceasedName', label: 'Deceased Name', placeholder: '{{deceasedName}}', type: 'text' },
        { key: 'nextOfKinName', label: 'Next of Kin Name', placeholder: '{{nextOfKinName}}', type: 'text' },
        { key: 'relationship', label: 'Relationship', placeholder: '{{relationship}}', type: 'select', options: ['Spouse', 'Child', 'Parent', 'Sibling', 'Other Relative'] },
        { key: 'embalmerName', label: 'Embalmer Name', placeholder: '{{embalmerName}}', type: 'text' },
        { key: 'consentGiven', label: 'Consent Given', placeholder: '{{consentGiven}}', type: 'select', options: ['Yes', 'No'] },
        { key: 'specialInstructions', label: 'Special Instructions', placeholder: '{{specialInstructions}}', type: 'textarea' }
      ],
      isDefault: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'death-certificate-template',
      name: 'Death Certificate Template',
      type: 'certificate',
      description: 'Official death certificate template',
      fields: [
        { key: 'certificateNumber', label: 'Certificate Number', placeholder: '{{certificateNumber}}', type: 'text' },
        { key: 'deceasedName', label: 'Full Name of Deceased', placeholder: '{{deceasedName}}', type: 'text' },
        { key: 'dateOfBirth', label: 'Date of Birth', placeholder: '{{dateOfBirth}}', type: 'date' },
        { key: 'dateOfDeath', label: 'Date of Death', placeholder: '{{dateOfDeath}}', type: 'date' },
        { key: 'placeOfDeath', label: 'Place of Death', placeholder: '{{placeOfDeath}}', type: 'text' },
        { key: 'causeOfDeath', label: 'Cause of Death', placeholder: '{{causeOfDeath}}', type: 'textarea' },
        { key: 'registeredBy', label: 'Registered By', placeholder: '{{registeredBy}}', type: 'text' },
        { key: 'registrationDate', label: 'Registration Date', placeholder: '{{registrationDate}}', type: 'date' }
      ],
      isDefault: true,
      createdAt: new Date().toISOString()
    },
    // Excel/CSV/Spreadsheet templates (QuickBooks replacement)
    {
      id: 'invoice-spreadsheet',
      name: 'Invoice Spreadsheet (Excel)',
      type: 'spreadsheet',
      description: 'Excel-style invoice with line items, taxes, and totals',
      fields: [
        { key: 'invoiceNumber', label: 'Invoice #', placeholder: 'INV-001', type: 'text' },
        { key: 'issueDate', label: 'Issue Date', placeholder: '{{issueDate}}', type: 'date' },
        { key: 'dueDate', label: 'Due Date', placeholder: '{{dueDate}}', type: 'date' },
        { key: 'billTo', label: 'Bill To', placeholder: '{{billTo}}', type: 'textarea' },
        { key: 'lineItems', label: 'Line Items (JSON array)', placeholder: '[{"description":"Service","qty":1,"rate":1000}]', type: 'textarea' },
        { key: 'subtotal', label: 'Subtotal', placeholder: '{{subtotal}}', type: 'number' },
        { key: 'taxRate', label: 'Tax Rate %', placeholder: '16', type: 'number' },
        { key: 'taxAmount', label: 'Tax Amount', placeholder: '{{taxAmount}}', type: 'number' },
        { key: 'totalAmount', label: 'Total Amount', placeholder: '{{totalAmount}}', type: 'number' },
        { key: 'notes', label: 'Notes', placeholder: '{{notes}}', type: 'textarea' }
      ],
      columnHeaders: ['#', 'Description', 'Quantity', 'Unit Price (KES)', 'Total (KES)'],
      isDefault: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'payment-ledger',
      name: 'Payment Ledger (Excel)',
      type: 'spreadsheet',
      description: 'Payment tracking spreadsheet with running balance',
      fields: [
        { key: 'ledgerName', label: 'Ledger Name', placeholder: '{{ledgerName}}', type: 'text' },
        { key: 'entries', label: 'Entries (JSON array)', placeholder: '[{"date":"2024-01-01","description":"Payment","amount":5000}]', type: 'textarea' }
      ],
      columnHeaders: ['Date', 'Description', 'Reference', 'Debit (KES)', 'Credit (KES)', 'Balance (KES)'],
      isDefault: true,
      createdAt: new Date().toISOString()
    }
  ];
}

// Initialize default templates if empty
if (Object.keys(templatesStore).length === 0) {
  getDefaultTemplates().forEach(t => {
    const key = `system-${t.id}`;
    if (!templatesStore[key]) {
      templatesStore[key] = t;
    }
  });
}

// =============================================================================
// MULTER CONFIG
// =============================================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tenantDir = path.join(documentsDir, req.tenantSlug);
    if (!fs.existsSync(tenantDir)) fs.mkdirSync(tenantDir, { recursive: true });
    cb(null, tenantDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_');
    cb(null, `${req.tenantSlug}-doc-${name}-${uniqueSuffix}${ext}`);
  }
});

const templateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tenantDir = path.join(templatesDir, req.tenantSlug);
    if (!fs.existsSync(tenantDir)) fs.mkdirSync(tenantDir, { recursive: true });
    cb(null, tenantDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_');
    cb(null, `${req.tenantSlug}-template-${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel', // xls
      'text/csv', 'text/plain',
      'image/jpeg', 'image/png', 'image/gif'
    ];
    if (allowedMimes.includes(file.mimetype)) return cb(null, true);
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: PDF, Word, Excel, CSV, JPEG, PNG, GIF`));
  }
});

const templateUpload = multer({
  storage: templateStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel', 'text/csv', 'text/plain',
      'image/jpeg', 'image/png', 'image/gif'
    ];
    if (allowedMimes.includes(file.mimetype)) return cb(null, true);
    cb(new Error(`Invalid template file type: ${file.mimetype}`));
  }
});

// =============================================================================
// MIDDLEWARE
// =============================================================================
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-csrf-token', 'x-tenant-slug', 'x-tenant-id', 'x-request-timestamp'],
}));

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(uploadsDir));

// Tenant Resolution Middleware
app.use((req, res, next) => {
  const tenantSlug = req.headers['x-tenant-slug'];
  if (!tenantSlug && req.path !== '/health' && !req.path.startsWith('/settings/public')) {
    return res.status(400).json({ success: false, message: 'Missing required header: x-tenant-slug' });
  }
  req.tenantSlug = tenantSlug || 'system';
  req.tenantId = req.headers['x-tenant-id'] || 'system';
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} | Tenant: ${req.tenantSlug}`);
  next();
});

// =============================================================================
// HEALTH CHECK
// =============================================================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'edocuments-service',
    version: '3.0.0',
    features: ['documents', 'templates', 'autofill', 'pdf-export', 'excel-import', 'canvas-editor', 'history', 'multi-tenant', 'e-signatures', 'barcodes', 'audit-trail'],
    storage: 'persistent',
    stats: {
      documents: Object.keys(documentsStore).length,
      templates: Object.keys(templatesStore).length,
      history: Object.keys(documentHistory).length,
      tenants: Object.keys(tenantSettings).length
    },
    timestamp: new Date().toISOString()
  });
});

// =============================================================================
// TENANT SETTINGS (colors, fonts, branding)
// =============================================================================
app.get('/settings', (req, res) => {
  const settings = tenantSettings[req.tenantSlug] || {
    primaryColor: '#1a237e',
    secondaryColor: '#0d47a1',
    fontFamily: 'Helvetica',
    fontSize: 12,
    logo: null,
    companyName: '',
    address: '',
    phone: '',
    email: '',
    currency: 'KES',
    taxRate: 16,
    invoicePrefix: 'INV-',
    receiptPrefix: 'RCT-'
  };
  res.json({ success: true, data: settings });
});

app.put('/settings', (req, res) => {
  const current = tenantSettings[req.tenantSlug] || {};
  tenantSettings[req.tenantSlug] = { ...current, ...req.body, updatedAt: new Date().toISOString() };
  saveStore('settings', tenantSettings);
  res.json({ success: true, data: tenantSettings[req.tenantSlug] });
});

// Public settings (no tenant slug needed)
app.get('/settings/public', (req, res) => {
  res.json({ success: true, data: { status: 'edocuments-service', version: '3.0.0' } });
});

// =============================================================================
// TEMPLATE MANAGEMENT
// =============================================================================
app.get('/templates', (req, res) => {
  try {
    const { search, type } = req.query;
    const systemTemplates = Object.entries(templatesStore)
      .filter(([key]) => key.startsWith('system-'))
      .map(([, t]) => t);
    const tenantTemplates = Object.entries(templatesStore)
      .filter(([key]) => key.startsWith(`${req.tenantSlug}-`))
      .map(([, t]) => t);
    let all = [...systemTemplates, ...tenantTemplates];
    if (search) {
      const s = search.toLowerCase();
      all = all.filter(t => t.name.toLowerCase().includes(s) || (t.description || '').toLowerCase().includes(s));
    }
    if (type && type !== 'all') all = all.filter(t => t.type === type);
    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: { templates: all, count: all.length }, tenant: req.tenantSlug });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/templates/:templateId', (req, res) => {
  try {
    let t = templatesStore[`${req.tenantSlug}-${req.params.templateId}`];
    if (!t) t = templatesStore[`system-${req.params.templateId}`];
    if (!t) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, data: { ...t, tenant: req.tenantSlug } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/templates', templateUpload.single('templateFile'), (req, res) => {
  try {
    const { name, description, type, fields, canvasState } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Name required' });
    if (!type || !type.trim()) return res.status(400).json({ success: false, message: 'Type required' });
    let parsedFields = [];
    if (fields) { try { parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields; } catch (e) { } }
    let parsedCanvas = null;
    if (canvasState) { try { parsedCanvas = typeof canvasState === 'string' ? JSON.parse(canvasState) : canvasState; } catch (e) { } }
    const templateId = `custom-${Date.now()}`;
    const template = {
      id: templateId, name: name.trim(), description: description ? description.trim() : '',
      type: type.trim(), fields: parsedFields, canvasState: parsedCanvas,
      fileName: req.file ? req.file.filename : null, originalName: req.file ? req.file.originalname : null,
      fileSize: req.file ? req.file.size : null, mimeType: req.file ? req.file.mimetype : null,
      url: req.file ? `/api/v1/restpoint/edocuments/templates/download/${req.file.filename}` : null,
      isDefault: false, tenant: req.tenantSlug, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    templatesStore[`${req.tenantSlug}-${templateId}`] = template;
    saveStore('templates', templatesStore);
    res.status(201).json({ success: true, message: 'Template created', data: template });
  } catch (e) {
    if (req.file) { try { fs.unlinkSync(req.file.path); } catch (ex) { } }
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put('/templates/:templateId', (req, res) => {
  try {
    const key = `${req.tenantSlug}-${req.params.templateId}`;
    const t = templatesStore[key];
    if (!t) return res.status(404).json({ success: false, message: 'Template not found' });
    if (t.isDefault) return res.status(403).json({ success: false, message: 'Cannot modify default templates' });
    const { name, description, type, fields, canvasState } = req.body;
    if (name !== undefined) t.name = name.trim();
    if (description !== undefined) t.description = description.trim();
    if (type !== undefined) t.type = type.trim();
    if (fields !== undefined) t.fields = typeof fields === 'string' ? JSON.parse(fields) : fields;
    if (canvasState !== undefined) t.canvasState = typeof canvasState === 'string' ? JSON.parse(canvasState) : canvasState;
    t.updatedAt = new Date().toISOString();
    templatesStore[key] = t;
    saveStore('templates', templatesStore);
    res.json({ success: true, message: 'Template updated', data: t });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/templates/:templateId', (req, res) => {
  try {
    const key = `${req.tenantSlug}-${req.params.templateId}`;
    const t = templatesStore[key];
    if (!t) return res.status(404).json({ success: false, message: 'Template not found' });
    if (t.isDefault) return res.status(403).json({ success: false, message: 'Cannot delete default templates' });
    if (t.fileName) {
      try { const fp = path.join(templatesDir, req.tenantSlug, t.fileName); if (fs.existsSync(fp)) fs.unlinkSync(fp); } catch (ex) { }
    }
    delete templatesStore[key];
    saveStore('templates', templatesStore);
    res.json({ success: true, message: 'Template deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/templates/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename.startsWith(req.tenantSlug)) return res.status(403).json({ success: false, message: 'Unauthorized' });
    let fp = path.join(templatesDir, req.tenantSlug, filename);
    if (!fs.existsSync(fp)) return res.status(404).json({ success: false, message: 'File not found' });
    res.download(fp);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// =============================================================================
// DOCUMENT GENERATION (AUTOFILL)
// =============================================================================
app.post('/generate', (req, res) => {
  try {
    const { templateId, fieldValues, title, description, format } = req.body;
    if (!templateId) return res.status(400).json({ success: false, message: 'templateId required' });
    if (!fieldValues) return res.status(400).json({ success: false, message: 'fieldValues required' });
    let t = templatesStore[`${req.tenantSlug}-${templateId}`];
    if (!t) t = templatesStore[`system-${templateId}`];
    if (!t) return res.status(404).json({ success: false, message: 'Template not found' });

    // Generate content
    let content = `${t.name}\n${'='.repeat(50)}\n\n`;
    const filled = [];
    if (t.fields) {
      t.fields.forEach(f => {
        const val = fieldValues[f.key] || f.placeholder || '';
        content += `${f.label}: ${val}\n`;
        filled.push({ key: f.key, label: f.label, value: val });
      });
    }
    content += `\n${'='.repeat(50)}\nGenerated: ${new Date().toISOString()}\n`;

    const docId = `gen-${Date.now()}`;
    const doc = {
      id: docId, title: title || `${t.name} - Auto-generated`,
      description: description || `Generated from ${t.name}`,
      documentType: t.type, category: 'generated', templateId: t.id, templateName: t.name,
      generatedContent: content, filledFields: filled, fieldValues: fieldValues || {},
      status: 'active', format: format || 'text',
      tenant: req.tenantSlug, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    documentsStore[`${req.tenantSlug}-${docId}`] = doc;
    saveStore('documents', documentsStore);
    trackHistory(req.tenantSlug, 'generate', docId, `${t.name} generated`);
    res.status(201).json({ success: true, message: 'Document generated', data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// =============================================================================
// EXCEL/CSV IMPORT (QuickBooks replacement)
// =============================================================================
app.post('/import-spreadsheet', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File required' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    let rows = [];
    let headers = [];

    if (ext === '.csv' && csvParser) {
      const raw = fs.readFileSync(req.file.path, 'utf8');
      const parsed = csvParser.parse(raw, { columns: true, skip_empty_lines: true });
      if (parsed.length > 0) headers = Object.keys(parsed[0]);
      rows = parsed;
    } else if (ext === '.xlsx' && xlsx) {
      const wb = xlsx.readFile(req.file.path);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(ws);
      if (data.length > 0) headers = Object.keys(data[0]);
      rows = data;
    } else if (ext === '.xls' && xlsx) {
      const wb = xlsx.readFile(req.file.path);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(ws);
      if (data.length > 0) headers = Object.keys(data[0]);
      rows = data;
    } else {
      // Plain text - try to parse as simple CSV
      const raw = fs.readFileSync(req.file.path, 'utf8');
      const lines = raw.split('\n').filter(l => l.trim());
      if (lines.length > 0) {
        headers = lines[0].split(',').map(h => h.trim());
        rows = lines.slice(1).map(line => {
          const vals = line.split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((h, i) => obj[h] = vals[i] || '');
          return obj;
        });
      }
    }

    const docId = `import-${Date.now()}`;
    documentsStore[`${req.tenantSlug}-${docId}`] = {
      id: docId, title: req.body.title || `Imported: ${req.file.originalname}`,
      description: `Imported from ${req.file.originalname}`,
      documentType: 'spreadsheet', category: 'imported',
      fileName: req.file.filename, originalName: req.file.originalname,
      fileSize: req.file.size, mimeType: req.file.mimetype,
      importedData: { headers, rows, rowCount: rows.length },
      url: `/api/v1/restpoint/edocuments/download/${req.file.filename}`,
      status: 'active', tenant: req.tenantSlug,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    saveStore('documents', documentsStore);
    trackHistory(req.tenantSlug, 'import', docId, `Imported ${req.file.originalname} (${rows.length} rows)`);
    res.json({ success: true, message: `Imported ${rows.length} rows from ${req.file.originalname}`, data: { docId, headers, rowCount: rows.length } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// =============================================================================
// EXPORT TO EXCEL
// =============================================================================
app.post('/:id/export-excel', (req, res) => {
  try {
    const doc = documentsStore[`${req.tenantSlug}-${req.params.id}`];
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (!xlsx) return res.status(400).json({ success: false, message: 'Excel export not available (xlsx module missing)' });

    const wb = xlsx.utils.book_new();
    let data = [];

    if (doc.importedData && doc.importedData.rows) {
      data = doc.importedData.rows;
    } else if (doc.fieldValues) {
      data = [doc.fieldValues];
    } else {
      data = [{ title: doc.title, description: doc.description, type: doc.documentType, created: doc.createdAt }];
    }

    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, 'Data');

    // Auto-size columns
    const colWidths = Object.keys(data[0] || {}).map(k => ({ wch: Math.max(k.length, 15) }));
    ws['!cols'] = colWidths;

    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.title || 'export'}.xlsx"`);
    res.send(buf);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// =============================================================================
// E-SIGNATURE SUPPORT
// =============================================================================
app.post('/:id/sign', (req, res) => {
  try {
    const doc = documentsStore[`${req.tenantSlug}-${req.params.id}`];
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const { signerName, signerId, signatureData, signatureType } = req.body;
    if (!signerName || !signatureData) {
      return res.status(400).json({ success: false, message: 'signerName and signatureData are required' });
    }

    const signature = {
      id: `sig-${Date.now()}`,
      signerName,
      signerId: signerId || 'unknown',
      signatureData, // Base64 encoded signature image or digital signature token
      signatureType: signatureType || 'drawn', // 'drawn', 'uploaded', 'digital'
      timestamp: new Date().toISOString(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };

    if (!doc.signatures) doc.signatures = [];
    doc.signatures.push(signature);
    doc.status = 'signed';
    doc.updatedAt = new Date().toISOString();

    documentsStore[`${req.tenantSlug}-${req.params.id}`] = doc;
    saveStore('documents', documentsStore);
    trackHistory(req.tenantSlug, 'sign', req.params.id, `Signed by ${signerName}`);

    res.json({ success: true, message: 'Document signed successfully', data: { signature, document: doc } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/:id/signatures', (req, res) => {
  try {
    const doc = documentsStore[`${req.tenantSlug}-${req.params.id}`];
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, data: { signatures: doc.signatures || [], count: (doc.signatures || []).length } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// =============================================================================
// BARCODE GENERATION
// =============================================================================
app.post('/:id/barcode', (req, res) => {
  try {
    const doc = documentsStore[`${req.tenantSlug}-${req.params.id}`];
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const { type, value, format } = req.body;
    if (!type || !value) {
      return res.status(400).json({ success: false, message: 'type and value are required for barcode' });
    }

    // Generate barcode metadata (actual barcode image generation would use a library like bwip-js)
    const barcode = {
      id: `bc-${Date.now()}`,
      type: type, // 'qrcode', 'code128', 'ean13', 'upca', 'pdf417'
      value,
      format: format || 'image/png',
      url: `/api/v1/restpoint/edocuments/barcode/${doc.id}/${type}/${encodeURIComponent(value)}`,
      createdAt: new Date().toISOString()
    };

    if (!doc.barcodes) doc.barcodes = [];
    doc.barcodes.push(barcode);
    doc.updatedAt = new Date().toISOString();

    documentsStore[`${req.tenantSlug}-${req.params.id}`] = doc;
    saveStore('documents', documentsStore);
    trackHistory(req.tenantSlug, 'barcode', req.params.id, `Barcode ${type} added`);

    res.status(201).json({ success: true, message: 'Barcode generated', data: barcode });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// =============================================================================
// DOCUMENTS CRUD
// =============================================================================
app.get('/', (req, res) => {
  try {
    const { type, status, templateId, search, limit = '10', offset = '0' } = req.query;
    const lim = Math.min(parseInt(limit) || 10, 100);
    const off = parseInt(offset) || 0;
    let all = Object.entries(documentsStore)
      .filter(([k]) => k.startsWith(req.tenantSlug))
      .map(([, d]) => d);
    if (type && type !== 'all') all = all.filter(d => d.documentType === type);
    if (status) all = all.filter(d => d.status === status);
    if (templateId && templateId !== 'all') all = all.filter(d => d.templateId === templateId);
    if (search) { const s = search.toLowerCase(); all = all.filter(d => (d.title || '').toLowerCase().includes(s) || (d.description || '').toLowerCase().includes(s)); }
    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = all.length;
    const docs = all.slice(off, off + lim);
    res.json({ success: true, data: { documents: docs, total, count: docs.length, pagination: { limit: lim, offset: off, hasMore: off + lim < total } }, tenant: req.tenantSlug });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/:id', (req, res) => {
  try {
    const doc = documentsStore[`${req.tenantSlug}-${req.params.id}`];
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/', upload.single('document'), (req, res) => {
  try {
    const { title, description, documentType, category, deceasedId, invoiceId, canvasState, fieldValues } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Title required' });
    if (!req.file) return res.status(400).json({ success: false, message: 'File required' });
    const docId = Date.now().toString();
    let ps = null, pf = {};
    if (canvasState) { try { ps = typeof canvasState === 'string' ? JSON.parse(canvasState) : canvasState; } catch (e) { } }
    if (fieldValues) { try { pf = typeof fieldValues === 'string' ? JSON.parse(fieldValues) : fieldValues; } catch (e) { } }
    const doc = {
      id: docId, title: title.trim(), description: description ? description.trim() : '',
      documentType: documentType || 'general', category: category || 'general',
      deceasedId: deceasedId || null, invoiceId: invoiceId || null,
      fileName: req.file.filename, originalName: req.file.originalname,
      fileSize: req.file.size, mimeType: req.file.mimetype,
      url: `/api/v1/restpoint/edocuments/download/${req.file.filename}`,
      status: 'active', tenant: req.tenantSlug,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      canvasState: ps, fieldValues: pf,
      auditTrail: [{
        action: 'create',
        timestamp: new Date().toISOString(),
        userId: req.headers['x-user-id'] || 'system',
        details: 'Document created'
      }]
    };
    documentsStore[`${req.tenantSlug}-${docId}`] = doc;
    saveStore('documents', documentsStore);
    trackHistory(req.tenantSlug, 'create', docId, `Created: ${title}`);
    res.status(201).json({ success: true, message: 'Document created', data: doc });
  } catch (e) {
    if (req.file) { try { fs.unlinkSync(req.file.path); } catch (ex) { } }
    if (e.message && e.message.includes('Invalid file type')) return res.status(400).json({ success: false, message: e.message });
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put('/:id', (req, res) => {
  try {
    const key = `${req.tenantSlug}-${req.params.id}`;
    const doc = documentsStore[key];
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    const { title, description, documentType, category, status, fieldValues, canvasState, image } = req.body;
    if (title !== undefined) doc.title = title.trim();
    if (description !== undefined) doc.description = description.trim();
    if (documentType !== undefined) doc.documentType = documentType;
    if (category !== undefined) doc.category = category;
    if (status !== undefined) doc.status = status;
    if (fieldValues !== undefined) doc.fieldValues = typeof fieldValues === 'string' ? JSON.parse(fieldValues) : fieldValues;
    if (canvasState !== undefined) doc.canvasState = typeof canvasState === 'string' ? JSON.parse(canvasState) : canvasState;

    // Handle canvas image update
    if (image) {
      try {
        const b64 = image.replace(/^data:image\/\w+;base64,/, '');
        const buf = Buffer.from(b64, 'base64');
        let fn = doc.fileName;
        if (!fn) { fn = `${req.tenantSlug}-doc-${req.params.id}-${Date.now()}.png`; doc.fileName = fn; }
        if (fn.toLowerCase().endsWith('.pdf')) {
          try { const op = path.join(documentsDir, req.tenantSlug, fn); if (fs.existsSync(op)) fs.unlinkSync(op); } catch (ex) { }
          fn = fn.replace(/\.pdf$/i, '.png'); doc.fileName = fn; doc.mimeType = 'image/png';
          doc.url = `/api/v1/restpoint/edocuments/download/${fn}`;
        }
        fs.writeFileSync(path.join(documentsDir, req.tenantSlug, fn), buf);
        doc.fileSize = buf.length;
      } catch (err) { console.error('Image write error:', err.message); }
    }

    // Add audit trail entry
    if (!doc.auditTrail) doc.auditTrail = [];
    doc.auditTrail.push({
      action: 'update',
      timestamp: new Date().toISOString(),
      userId: req.headers['x-user-id'] || 'system',
      details: 'Document updated',
      changes: { title, description, documentType, category, status }
    });

    doc.updatedAt = new Date().toISOString();
    documentsStore[key] = doc;
    saveStore('documents', documentsStore);
    trackHistory(req.tenantSlug, 'update', req.params.id, `Updated: ${doc.title}`);
    res.json({ success: true, message: 'Document updated', data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/:id', (req, res) => {
  try {
    const key = `${req.tenantSlug}-${req.params.id}`;
    const doc = documentsStore[key];
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (doc.fileName) {
      try { const fp = path.join(documentsDir, req.tenantSlug, doc.fileName); if (fs.existsSync(fp)) fs.unlinkSync(fp); } catch (ex) { }
    }
    delete documentsStore[key];
    saveStore('documents', documentsStore);
    trackHistory(req.tenantSlug, 'delete', req.params.id, `Deleted: ${doc.title}`);
    res.json({ success: true, message: 'Document deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// =============================================================================
// DOWNLOAD
// =============================================================================
app.get('/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename.startsWith(req.tenantSlug)) return res.status(403).json({ success: false, message: 'Unauthorized' });
    const fp = path.join(documentsDir, req.tenantSlug, filename);
    if (!fs.existsSync(fp)) return res.status(404).json({ success: false, message: 'File not found' });
    trackHistory(req.tenantSlug, 'download', filename, `Downloaded: ${filename}`);
    res.download(fp);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// =============================================================================
// SEARCH
// =============================================================================
app.post('/search', (req, res) => {
  try {
    const { query, type, status, templateId } = req.body;
    if (!query || !query.trim()) return res.status(400).json({ success: false, message: 'Query required' });
    const s = query.toLowerCase();
    let results = Object.entries(documentsStore)
      .filter(([k]) => k.startsWith(req.tenantSlug))
      .map(([, d]) => d)
      .filter(d => (d.title || '').toLowerCase().includes(s) || (d.description || '').toLowerCase().includes(s) || (d.generatedContent || '').toLowerCase().includes(s));
    if (type && type !== 'all') results = results.filter(d => d.documentType === type);
    if (status && status !== 'all') results = results.filter(d => d.status === status);
    if (templateId && templateId !== 'all') results = results.filter(d => d.templateId === templateId);
    res.json({ success: true, data: { results, count: results.length, query }, tenant: req.tenantSlug });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// =============================================================================
// DOCUMENT HISTORY
// =============================================================================
function trackHistory(tenantSlug, action, ref, description) {
  if (!documentHistory[tenantSlug]) documentHistory[tenantSlug] = [];
  documentHistory[tenantSlug].unshift({
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action, ref, description,
    timestamp: new Date().toISOString()
  });
  // Keep last 500 entries
  if (documentHistory[tenantSlug].length > 500) documentHistory[tenantSlug] = documentHistory[tenantSlug].slice(0, 500);
}

app.get('/history', (req, res) => {
  const history = documentHistory[req.tenantSlug] || [];
  res.json({ success: true, data: { history, count: history.length }, tenant: req.tenantSlug });
});

app.get('/history/:action', (req, res) => {
  const history = (documentHistory[req.tenantSlug] || []).filter(h => h.action === req.params.action);
  res.json({ success: true, data: { history, count: history.length }, tenant: req.tenantSlug });
});

// =============================================================================
// DEPRECATED / REMOVED SERVICES (now part of this unified service)
// =============================================================================
// - documents-service: Use /api/v1/restpoint/edocuments instead
// - invoice generation: Use template 'invoice-template' with POST /generate
// - QuickBooks replacement: Use POST /import-spreadsheet for Excel/CSV

// =============================================================================
// EXPORT PDF
// =============================================================================
app.post('/:id/export-pdf', async (req, res) => {
  try {
    const doc = documentsStore[`${req.tenantSlug}-${req.params.id}`];
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let y = 800;

    // Title
    page.drawText(doc.title || 'Document', { x: 50, y, size: 22, font: boldFont, color: rgb(0.1, 0.14, 0.49) });
    y -= 35;

    // Description
    if (doc.description) {
      page.drawText(doc.description, { x: 50, y, size: 11, font, color: rgb(0.4, 0.4, 0.4) });
      y -= 25;
    }

    // Separator
    y -= 10;
    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });
    y -= 20;

    // Filled fields
    if (doc.fieldValues) {
      for (const [key, value] of Object.entries(doc.fieldValues)) {
        if (y < 60) { page = pdfDoc.addPage([595.28, 841.89]); y = 800; }
        const label = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
        page.drawText(`${label}:`, { x: 50, y, size: 10, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
        page.drawText(String(value || ''), { x: 200, y, size: 10, font, color: rgb(0, 0, 0) });
        y -= 22;
      }
    }

    // Generated content
    if (doc.generatedContent) {
      if (y < 80) { page = pdfDoc.addPage([595.28, 841.89]); y = 800; }
      const lines = doc.generatedContent.split('\n');
      for (const line of lines) {
        if (y < 40) { page = pdfDoc.addPage([595.28, 841.89]); y = 800; }
        page.drawText(line, { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
        y -= 16;
      }
    }

    // Footer
    page.drawLine({ start: { x: 50, y: 30 }, end: { x: 545, y: 30 }, color: rgb(0.8, 0.8, 0.8), thickness: 0.5 });
    page.drawText(`Generated by RestPoint eDocuments v3.0.0 | ${new Date().toISOString()}`, { x: 50, y: 18, size: 7, font, color: rgb(0.6, 0.6, 0.6) });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${(doc.title || 'document').replace(/[^a-z0-9]/gi, '_')}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// =============================================================================
// DOCUMENT CONTENT
// =============================================================================
app.get('/:id/content', (req, res) => {
  try {
    const doc = documentsStore[`${req.tenantSlug}-${req.params.id}`];
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (!doc.generatedContent) return res.status(400).json({ success: false, message: 'No generated content' });
    res.type('text/plain').send(doc.generatedContent);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// =============================================================================
// DECEASED/INVOICE LOOKUP
// =============================================================================
app.get('/deceased/:deceasedId', (req, res) => {
  try {
    const docs = Object.entries(documentsStore)
      .filter(([k]) => k.startsWith(req.tenantSlug))
      .map(([, d]) => d)
      .filter(d => d.deceasedId === req.params.deceasedId);
    res.json({ success: true, data: { deceasedId: req.params.deceasedId, documents: docs, count: docs.length }, tenant: req.tenantSlug });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/invoice/:invoiceId', (req, res) => {
  try {
    const docs = Object.entries(documentsStore)
      .filter(([k]) => k.startsWith(req.tenantSlug))
      .map(([, d]) => d)
      .filter(d => d.invoiceId === req.params.invoiceId);
    res.json({ success: true, data: { invoiceId: req.params.invoiceId, documents: docs, count: docs.length }, tenant: req.tenantSlug });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// =============================================================================
// DASHBOARD / STATS
// =============================================================================
app.get('/dashboard/stats', (req, res) => {
  const docs = Object.entries(documentsStore).filter(([k]) => k.startsWith(req.tenantSlug)).map(([, d]) => d);
  const recent = docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
  const byType = {};
  docs.forEach(d => { byType[d.documentType] = (byType[d.documentType] || 0) + 1; });
  const byStatus = {};
  docs.forEach(d => { byStatus[d.status] = (byStatus[d.status] || 0) + 1; });
  const templates = Object.entries(templatesStore).filter(([k]) => k.startsWith(req.tenantSlug)).length;
  res.json({
    success: true, data: {
      totalDocuments: docs.length, totalTemplates: templates,
      recentDocuments: recent, byType, byStatus,
      storageUsed: docs.reduce((acc, d) => acc + (d.fileSize || 0), 0)
    }, tenant: req.tenantSlug
  });
});

// =============================================================================
// ERROR HANDLING MIDDLEWARE (catches all errors and returns JSON)
// =============================================================================
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Handle multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 50MB.',
      code: 'FILE_TOO_LARGE'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field. Use "document" or "templateFile".',
      code: 'UNEXPECTED_FILE'
    });
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body',
      code: 'INVALID_JSON'
    });
  }

  // Generic error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
});

// =============================================================================
// START SERVER
// =============================================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`eDocuments Service running on port ${PORT}`);
  console.log(`Features: PDF export, Excel import, templates, e-signatures, barcodes, audit trail`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('eDocuments Service shutting down...');
  saveStore('documents', documentsStore);
  saveStore('templates', templatesStore);
  saveStore('history', documentHistory);
  saveStore('settings', tenantSettings);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('eDocuments Service shutting down...');
  saveStore('documents', documentsStore);
  saveStore('templates', templatesStore);
  saveStore('history', documentHistory);
  saveStore('settings', tenantSettings);
  process.exit(0);
});

