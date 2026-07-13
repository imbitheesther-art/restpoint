import { Router } from 'express';
import {
    getChargeSettings,
    updateChargeSettings,
    getBillingSummary,
    recalculateBalance
} from '../controllers/chargeSettingsController';

const router = Router();

// Import authentication middleware
// @ts-ignore - authMiddleware is JavaScript, not TypeScript
const { protect, authorizeAny } = require('../../../services/app-global/middlewares/authMiddleware');

// All routes are protected with JWT authentication
router.use(protect);
router.use(authorizeAny as any);

// Charge Settings routes
router.get('/', getChargeSettings);
router.put('/:id', updateChargeSettings);
router.get('/billing-summary/:id', getBillingSummary);
router.post('/:id/recalculate', recalculateBalance);

export default router;
