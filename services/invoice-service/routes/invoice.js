import { Router } from 'express';
import { getInvoice } from '../controllers/invoice';

const router = Router();

// GET invoice for a deceased person
router.get('/invoice/:deceasedId', getInvoice);

export default router;
