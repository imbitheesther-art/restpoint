import { Router } from 'express';
import {
  registerNextOfKin,
  getNextOfKinByDeceasedId,
  updateNextOfKin,
  deleteNextOfKin,
  markAsNotified
} from '../controllers/nextOfKinController';
import { authenticate } from '../../../global/middlewares/AuthMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Next of Kin routes
router.post('/next-of-kin', registerNextOfKin);
router.get('/next-of-kin', getNextOfKinByDeceasedId);
router.put('/next-of-kin/:id', updateNextOfKin);
router.delete('/next-of-kin/:id', deleteNextOfKin);
router.patch('/next-of-kin/:id/notify', markAsNotified);

export default router;