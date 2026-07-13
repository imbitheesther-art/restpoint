import { Router } from 'express';
import {
  protect,
  authorizeAny
} from '../../../services/app-global/middlewares/authMiddleware';

import {
  nextOfKinRegister,
  getNextOfKinByDeceasedId,
  updateNextOfKin,
  deleteNextOfKin,
  markAsNotified
} from '../controllers/nextOfKinController';

const router = Router();

// Apply authentication to all routes
router.use(protect);
router.use(authorizeAny);

// Next of Kin routes - Support multiple patterns
// Pattern 1: /deceased/:deceased_id/next-of-kin (frontend uses this)
router.post('/deceased/:deceased_id/next-of-kin', nextOfKinRegister);
router.get('/deceased/:deceased_id/next-of-kin', getNextOfKinByDeceasedId);

// Pattern 2: /:deceased_id/next-of-kin (without deceased prefix)
router.post('/:deceased_id/next-of-kin', nextOfKinRegister);
router.get('/:deceased_id/next-of-kin', getNextOfKinByDeceasedId);

// Pattern 3: /next-of-kin (with deceased_id in query params)
router.post('/next-of-kin', nextOfKinRegister);
router.get('/next-of-kin', getNextOfKinByDeceasedId);

// Pattern 3: Direct next-of-kin operations by ID
router.put('/next-of-kin/:id', updateNextOfKin);
router.delete('/next-of-kin/:id', deleteNextOfKin);
router.patch('/next-of-kin/:id/notify', markAsNotified);

export default router;
