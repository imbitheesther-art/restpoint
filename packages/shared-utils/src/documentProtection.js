"use strict";
/**
 * RestPoint Document Protection Utility
 *
 * Protects uploaded documents by:
 * - Storing files outside web root
 * - Generating temporary download links with expiration
 * - Restricting access by role
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeDocument = storeDocument;
exports.generateTempDownloadLink = generateTempDownloadLink;
exports.validateDownloadToken = validateDownloadToken;
exports.deleteDocument = deleteDocument;
exports.getDocumentBuffer = getDocumentBuffer;
exports.hasDocumentAccess = hasDocumentAccess;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const UPLOAD_BASE_DIR = process.env.UPLOAD_BASE_DIR || path.join(__dirname, '../../../secure_uploads');
const TEMP_LINK_EXPIRY_MS = parseInt(process.env.TEMP_LINK_EXPIRY || '3600000', 10); // 1 hour default
const SECRET = process.env.DOCUMENT_SECRET || 'restpoint-doc-secret-change-in-production';
/**
 * Allowed directories for document storage
 */
const ALLOWED_DIRECTORIES = [
    'death_certificates',
    'autopsy_reports',
    'invoices',
    'receipts',
    'coffins',
    'deceased_docs',
    'permits',
    'other',
];
/**
 * Ensure a storage directory exists
 */
function ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
/**
 * Store an uploaded file securely outside web root
 * @param deceasedId - The deceased record ID
 * @param category - Document category (must be in ALLOWED_DIRECTORIES)
 * @param originalName - Original file name
 * @param buffer - File buffer
 * @returns Object with stored path and metadata
 */
function storeDocument(deceasedId, category, originalName, buffer) {
    if (!ALLOWED_DIRECTORIES.includes(category)) {
        throw new Error(`Invalid document category: ${category}. Allowed: ${ALLOWED_DIRECTORIES.join(', ')}`);
    }
    // Generate unique stored name
    const ext = path.extname(originalName);
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const storedName = `${deceasedId}_${uniqueId}${ext}`;
    // Store outside web root
    const storageDir = path.join(UPLOAD_BASE_DIR, category, deceasedId);
    ensureDirectory(storageDir);
    const storedPath = path.join(storageDir, storedName);
    fs.writeFileSync(storedPath, buffer);
    // Determine MIME type
    const mimeTypes = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    return {
        storedPath,
        storedName,
        mimeType: mimeTypes[ext.toLowerCase()] || 'application/octet-stream',
    };
}
/**
 * Generate a temporary download link for a stored document
 * @param storedPath - Path to the stored file
 * @param expiresInMs - Expiry time in milliseconds
 * @returns Temporary URL with token
 */
function generateTempDownloadLink(storedPath, expiresInMs = TEMP_LINK_EXPIRY_MS) {
    const expiresAt = new Date(Date.now() + expiresInMs);
    const payload = `${storedPath}:${expiresAt.getTime()}`;
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(payload);
    const token = hmac.digest('hex');
    return {
        url: `/api/v1/restpoint/documents/download/${encodeURIComponent(storedPath)}?token=${token}&expires=${expiresAt.getTime()}`,
        token,
        expiresAt,
    };
}
/**
 * Validate a temporary download token
 * @param storedPath - Path to the stored file
 * @param token - The HMAC token
 * @param expiresAt - Expiry timestamp
 * @returns Whether the token is valid and not expired
 */
function validateDownloadToken(storedPath, token, expiresAt) {
    // Check expiry
    if (Date.now() > expiresAt) {
        return false;
    }
    // Validate HMAC
    const payload = `${storedPath}:${expiresAt}`;
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(payload);
    const expectedToken = hmac.digest('hex');
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
}
/**
 * Delete a stored document
 * @param storedPath - Full path to the stored file
 */
function deleteDocument(storedPath) {
    if (fs.existsSync(storedPath)) {
        fs.unlinkSync(storedPath);
    }
}
/**
 * Get a file's buffer for streaming/download
 * @param storedPath - Path to the stored file
 * @returns File buffer or null if not found
 */
function getDocumentBuffer(storedPath) {
    try {
        if (fs.existsSync(storedPath)) {
            return fs.readFileSync(storedPath);
        }
        return null;
    }
    catch {
        return null;
    }
}
/**
 * Check if a user role has access to a document category
 */
function hasDocumentAccess(role, category) {
    const accessMatrix = {
        admin: ['*'], // Wildcard: all access
        manager: ['death_certificates', 'autopsy_reports', 'invoices', 'receipts', 'deceased_docs', 'permits'],
        staff: ['deceased_docs', 'permits'],
        viewer: ['death_certificates'],
        portal: [], // No direct access - uses temp links
    };
    const allowed = accessMatrix[role];
    if (!allowed)
        return false;
    if (allowed.includes('*'))
        return true;
    return allowed.includes(category);
}
//# sourceMappingURL=documentProtection.js.map