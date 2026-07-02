import { Router } from 'express';
import {
    getChargeSettings,
    updateChargeSettings,
    getBillingSummary,
    recalculateBalance
} from '../controllers/chargeSettingsController';

const router = Router();

// Import authentication middleware
const { protect } = require('../../../global/middlewares/authMiddleware');

// All routes are protected with JWT authentication
router.use(protect);

// Charge Settings routes
router.get('/', getChargeSettings);
router.put('/:id', updateChargeSettings);
router.get('/billing-summary/:id', getBillingSummary);
router.post('/:id/recalculate', recalculateBalance);

export default router;
