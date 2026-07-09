import { Router, Request, Response } from 'express';
import { protect, authorizeAny } from '../../../global/middlewares/authMiddleware';

const router = Router();

// Apply authentication to all routes
router.use(protect);
router.use(authorizeAny);

// Hearse routes
router.post('/hearse/create', (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: 'Hearse booking created successfully',
        data: { ...req.body, id: Date.now() }
    });
});

router.post('/hearse/dispatch', (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: 'Hearse dispatch created successfully',
        data: { ...req.body, id: Date.now() }
    });
});

router.get('/hearse/:id', (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: 'Hearse details fetched',
        data: { id: (req as any).params.id }
    });
});

export default router;