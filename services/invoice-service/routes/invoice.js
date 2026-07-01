import { Router } from 'express';
import { getInvoicesByDeceased } from '../controllers/invoice';

const router = Router();

// GET invoices for a deceased person
router.get('/invoice/:deceasedId', getInvoicesByDeceased);

export default router;
