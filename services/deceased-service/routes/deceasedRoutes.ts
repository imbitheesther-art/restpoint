import { Router } from 'express';
import {
    registerDeceased,
    getAllDeceased,
    getDeceasedById,
    updateDeceased,
    deleteDeceased,
    getDeceasedStats
} from '../controllers/deceasedControl';

const router = Router();

// ============================================
// ✅ ALL ROUTES - FULL PATH COMPATIBILITY
// ============================================

// POST - Register a new deceased
router.post('/register-deceased', registerDeceased);
router.post('/register', registerDeceased);
router.post('/', registerDeceased);

// GET - All deceased
router.get('/', getAllDeceased);
router.get('/all', getAllDeceased);
router.get('/deceased-all', getAllDeceased);

// GET - By ID - SUPPORT ALL PATTERN TYPES
router.get('/deceased-id/:id', getDeceasedById);  // /deceased/deceased-id/:id
router.get('/deceased/:id', getDeceasedById);     // /deceased/deceased/:id
router.get('/:id', getDeceasedById);              // /deceased/:id (fallback)
router.get('/id/:id', getDeceasedById);           // /deceased/id/:id

// PUT - Update
router.put('/:id', updateDeceased);
router.put('/update-deceased/:id', updateDeceased);

// DELETE - Delete
router.delete('/:id', deleteDeceased);
router.delete('/delete-deceased/:id', deleteDeceased);

// GET - Stats
router.get('/stats', getDeceasedStats);

export default router;