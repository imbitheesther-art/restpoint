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

// Load the JavaScript controller bridge (works with CommonJS)
let coffinController = { ...inlineHandlers };
try {
  const loaded = require('../controllers/coffinController.cjs');
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

// ============================================================
// COFFIN CRUD - match paths sent by API Gateway proxy
// ============================================================
// Gateway sends: POST /api/v1/restpoint/coffins → server mounts at /api/v1/restpoint/coffins → matches /
// Gateway sends: POST /api/v1/restpoint/coffins/register → matches /register
// Gateway sends: POST /api/v1/restpoint/coffins/create → matches /create
router.post('/', upload.array('images', 10), (req, res) => coffinController.createCoffin(req, res));
router.post('/register', upload.array('images', 10), (req, res) => coffinController.createCoffin(req, res));
router.post('/create', upload.array('images', 10), (req, res) => coffinController.createCoffin(req, res));

router.get('/', (req, res) => coffinController.getAllCoffins(req, res));
router.get('/all-coffins', (req, res) => coffinController.getAllCoffins(req, res));
router.get('/list', (req, res) => coffinController.getAllCoffins(req, res));
router.get('/coffins-list', (req, res) => coffinController.getAllCoffins(req, res));

router.get('/:id', (req, res) => coffinController.getCoffinById(req, res));
router.get('/detail/:id', (req, res) => coffinController.getCoffinById(req, res));

router.put('/:id', upload.array('images', 10), (req, res) => coffinController.updateCoffin(req, res));
router.put('/update/:id', upload.array('images', 10), (req, res) => coffinController.updateCoffin(req, res));

router.delete('/:id', (req, res) => coffinController.deleteCoffin(req, res));
router.delete('/delete/:id', (req, res) => coffinController.deleteCoffin(req, res));

// Assignments
router.post('/assign', (req, res) => coffinController.assignCoffin(req, res));

// Analytics
router.get('/analytics/dashboard', (req, res) => coffinController.getCoffinAnalytics(req, res));

// Health
router.get('/health', (req, res) => coffinController.healthCheck(req, res));

module.exports = router;