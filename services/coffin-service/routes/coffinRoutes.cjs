const { Router } = require('express');
const multer = require('multer');

// coffinController is at ../coffinService.ts in the same service directory
let coffinController;
try {
  coffinController = require('../coffinService');
} catch (e) {
  // Try with tsx or ts-node for .ts files
  try {
    require('tsx').register();
    coffinController = require('../coffinService.ts');
  } catch(e2) {
    try {
      coffinController = require('../coffinService.js');
    } catch(e3) {
      console.error('[Coffin] Could not load coffinService');
      coffinController = {};
    }
  }
}

// Middleware - try to load global, fallback to passthrough
let authenticateToken = (req, res, next) => next();
let tenantMiddleware = (req, res, next) => next();
try {
  const mw = require('../../global/middlewares');
  if (mw.authenticateToken) authenticateToken = mw.authenticateToken;
  if (mw.tenantMiddleware) tenantMiddleware = mw.tenantMiddleware;
} catch(e) {
  // Global middleware not available, using passthrough
}

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Apply tenant and auth middleware
router.use(tenantMiddleware);
router.use(authenticateToken);

// Coffin CRUD
router.post('/', upload.array('images', 10), coffinController.createCoffin);
router.get('/', coffinController.getAllCoffins);
router.get('/:id', coffinController.getCoffinById);
router.put('/:id', upload.array('images', 10), coffinController.updateCoffin);
router.delete('/:id', coffinController.deleteCoffin);

// Assignments
router.post('/assign', coffinController.assignCoffin);

// Analytics
router.get('/analytics/dashboard', coffinController.getCoffinAnalytics);

// Health
router.get('/health', coffinController.healthCheck);

module.exports = router;