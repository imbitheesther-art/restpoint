
import { Router } from 'express';
import { protect, authorizeAny } from '../../../services/app-global/middlewares/authMiddleware';
import {

    getAllDeceased,
    getDeceasedById,
    updateDeceased,
    deleteDeceased,


} from '../controllers/deceasedControl';

import { registerNewDeceased } from '../controllers/registerDeceased'

const router = Router();

// Apply authentication to all routes
router.use(protect);
router.use(authorizeAny);



// POST - Register a new deceased
router.post('/register-deceased', registerNewDeceased);
router.post('/deceased/register-deceased', registerNewDeceased);
router.post('/register', registerNewDeceased);
router.post('/', registerNewDeceased);

// GET - All deceased
router.get('/', getAllDeceased);
router.get('/all', getAllDeceased);
router.get('/deceased-all', getAllDeceased);
router.get('/deceased/deceased-all', getAllDeceased);  // Support nested path
router.get('/deceased/all', getAllDeceased);           // Support nested path

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
// router.get('/stats', getDeceasedStats);

// GET - Export
// router.get('/export', exportDeceasedToExcel);

export default router;