import { Router } from 'express';
// @ts-ignore - authMiddleware is JavaScript, not TypeScript
const { protect, authorizeAny } = require('../../../services/app-global/middlewares/authMiddleware');
import { getInvoicesByDeceased } from '../controllers/invoice';

const router = Router();

// Apply authentication to all routes
router.use(protect);
router.use(authorizeAny);

// GET invoices for a deceased person
router.get('/invoice/:deceasedId', getInvoicesByDeceased);

export default router;
