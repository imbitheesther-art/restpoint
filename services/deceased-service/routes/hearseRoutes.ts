import { Router, Request, Response } from 'express';

const router = Router();

// Simple authentication middleware stub
const authenticate = (req: Request, res: Response, next: Function) => {
    // TODO: Implement proper authentication
    (req as any).user = { userId: 'system', role: 'admin' };
    next();
};

router.use(authenticate);

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
        data: { id: req.params.id }
    });
});

export default router;