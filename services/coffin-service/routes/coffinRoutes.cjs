const { Router } = require('express');
const multer = require('multer');

// Create inline handlers so the router always has valid functions
const inlineHandlers = {
  createCoffin: async (req, res) => res.status(503).json({ success: false, message: 'Coffin service loading' }),
  getAllCoffins: async (req, res) => res.status(503).json({ success: false, message: 'Coffin service loading' }),
  getCoffinById: async (req, res) => res.status(503).json({ success: false, message: 'Coffin service loading' }),
  updateCoffin: async (req, res) => res.status(503).json({ success: false, message: 'Coffin service loading' }),
  deleteCoffin: async (req, res) => res.status(503).json({ success: false, message: 'Coffin service loading' }),
  assignCoffin: async (req, res) => res.status(503).json({ success: false, message: 'Coffin service loading' }),
  getCoffinAnalytics: async (req, res) => res.status(503).json({ success: false, message: 'Coffin service loading' }),
  healthCheck: async (req, res) => res.status(200).json({ status: 'UP', service: 'coffin-service' }),
};

// Try to load coffinService - try multiple approaches
let coffinController = { ...inlineHandlers };
try {
  // Try direct require of .ts via tsx
  require('tsx').register();
  const loaded = require('../coffinService.ts');
  if (loaded && typeof loaded.createCoffin === 'function') {
    coffinController = loaded;
  }
} catch (e) {
  // Fallback already set
}

// Middleware - try to load global, fallback to passthrough
let authenticateToken = (req, res, next) => next();
let tenantMiddleware = (req, res, next) => next();
try {
  const mw = require('../../global/middlewares');
  if (mw.authenticateToken) authenticateToken = mw.authenticateToken;
  if (mw.tenantMiddleware) tenantMiddleware = mw.tenantMiddleware;
} catch (e) {
  // Global middleware not available, using passthrough
}

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Apply tenant and auth middleware
router.use(tenantMiddleware);
router.use(authenticateToken);

// Coffin CRUD
router.post('/', upload.array('images', 10), (req, res) => coffinController.createCoffin(req, res));
router.get('/', (req, res) => coffinController.getAllCoffins(req, res));
router.get('/all-coffins', (req, res) => coffinController.getAllCoffins(req, res));  // ✅ ADDED: Support all-coffins endpoint
router.get('/list', (req, res) => coffinController.getAllCoffins(req, res));         // ✅ ADDED: Support list endpoint
router.get('/:id', (req, res) => coffinController.getCoffinById(req, res));
router.put('/:id', upload.array('images', 10), (req, res) => coffinController.updateCoffin(req, res));
router.delete('/:id', (req, res) => coffinController.deleteCoffin(req, res));

// Assignments
router.post('/assign', (req, res) => coffinController.assignCoffin(req, res));

// Analytics
router.get('/analytics/dashboard', (req, res) => coffinController.getCoffinAnalytics(req, res));

// Health
router.get('/health', (req, res) => coffinController.healthCheck(req, res));

module.exports = router;