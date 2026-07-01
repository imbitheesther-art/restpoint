import { Router, Request, Response, NextFunction } from 'express';
import {
  nextOfKinRegister,
  getNextOfKinByDeceasedId,
  updateNextOfKin,
  deleteNextOfKin,
  markAsNotified
} from '../controllers/nextOfKinController';

const router = Router();

// Simple authentication middleware stub
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement proper authentication
  // For now, attach a mock user to the request
  (req as any).user = { userId: 'system', role: 'admin' };
  next();
};

// All routes use authentication middleware
router.use(authenticate);

// Next of Kin routes - Support both patterns
// Pattern 1: /deceased/:deceased_id/next-of-kin (frontend uses this)
router.post('/:deceased_id/next-of-kin', nextOfKinRegister);
router.get('/:deceased_id/next-of-kin', getNextOfKinByDeceasedId);

// Pattern 2: /next-of-kin (with deceased_id in query params)
router.post('/next-of-kin', nextOfKinRegister);
router.get('/next-of-kin', getNextOfKinByDeceasedId);

// Pattern 3: Direct next-of-kin operations by ID
router.put('/next-of-kin/:id', updateNextOfKin);
router.delete('/next-of-kin/:id', deleteNextOfKin);
router.patch('/next-of-kin/:id/notify', markAsNotified);

export default router;
