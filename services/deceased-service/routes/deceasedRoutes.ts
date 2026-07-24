
import { Router } from 'express';
import { protect, authorizeAny } from '../../../services/app-global/middlewares/authMiddleware';
import {

    getAllDeceased,
    getDeceasedById,
    updateDeceased,
    deleteDeceased,


} from '../controllers/deceasedControl';

import { registerNewDeceased } from '../controllers/registerDeceased'
import { getAdmissionNumber } from '../utils/admissionNumberRoute'
import {
    requestPostmortem,
    savePostmortem,
    getPostmortemByDeceasedId,
    updatePostmortem,
    generatePostmortemPDF
} from '../controllers/autopsyControl';

import { updateDeceasedStatus } from '../controllers/deceasedControl';

const router = Router();

// Apply authentication to all routes
router.use(protect);
router.use(authorizeAny);

// GET - Pre-generate admission number based on gender
router.get('/admission-number/:gender', getAdmissionNumber);
router.get('/admission-number/', getAdmissionNumber);
router.get('/deceased/admission-number/:gender', getAdmissionNumber);   // Support nested path via gateway
router.get('/deceased/admission-number/', getAdmissionNumber);           // Support nested path via gateway

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

// POST - Postmortem/Autopsy routes
router.post('/postmortem/request', requestPostmortem);
router.post('/autopsy/request', requestPostmortem);
router.post('/deceased/postmortem/request', requestPostmortem);

router.post('/postmortem/save', savePostmortem);
router.post('/autopsy/save', savePostmortem);
router.post('/deceased/postmortem/save', savePostmortem);

// GET - Postmortem/Autopsy routes
router.get('/postmortem/:deceased_id', getPostmortemByDeceasedId);
router.get('/autopsy/:deceased_id', getPostmortemByDeceasedId);
router.get('/deceased/postmortem/:deceased_id', getPostmortemByDeceasedId);
router.get('/deceased/autopsy/:deceased_id', getPostmortemByDeceasedId);

// PUT - Update postmortem
router.put('/postmortem/:id', updatePostmortem);
router.put('/autopsy/:id', updatePostmortem);

// GET - Generate PDF report
router.get('/postmortem/:deceased_id/pdf', generatePostmortemPDF);
router.get('/autopsy/:deceased_id/pdf', generatePostmortemPDF);

// POST - Update status (for cross-service calls)
router.post('/update-status', updateDeceasedStatus);

// GET - Stats
// router.get('/stats', getDeceasedStats);

// GET - Export
// router.get('/export', exportDeceasedToExcel);

export default router;
