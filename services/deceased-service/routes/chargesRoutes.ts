import { Router } from 'express';
import {
    getCharges,
    addCharge,
    updateCharge,
    deleteCharge,
    getPayments,
    recordPayment
} from '../controllers/chargesControl';

const router = Router();

// Import authentication middleware
const { protect } = require('../../../services/app-global/middlewares/authMiddleware');

// Payment routes (no auth required for mock implementation)
router.get('/payments/:deceased_id', getPayments);
router.post('/payments', recordPayment);

// Charges routes (no auth required for mock implementation)
router.get('/charges/:deceased_id', getCharges);
router.post('/charges', addCharge);
router.put('/charges/:id', updateCharge);
router.delete('/charges/:id', deleteCharge);

export default router;
