import { Router, Request, Response } from 'express';

const router = Router();

// Simple authentication middleware stub
const authenticate = (req: Request, res: Response, next: Function) => {
    // TODO: Implement proper authentication
    (req as any).user = { userId: 'system', role: 'admin' };
    next();
};

router.use(authenticate);

// Documents routes
// GET /deceased/:deceased_id/documents - Get all documents for a deceased person
router.get('/:deceased_id/documents', (req: Request, res: Response) => {
    const { deceased_id } = req.params;

    return res.status(200).json({
        success: true,
        message: 'Documents fetched successfully',
        data: [],
        count: 0
    });
});

// POST /deceased/:deceased_id/documents - Upload a document for a deceased person
router.post('/:deceased_id/documents', (req: Request, res: Response) => {
    const { deceased_id } = req.params;
    const documentData = req.body;

    return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
            id: Date.now(),
            deceased_id,
            ...documentData
        }
    });
});

// DELETE /deceased/:deceased_id/documents/:document_id - Delete a document
router.delete('/:deceased_id/documents/:document_id', (req: Request, res: Response) => {
    const { deceased_id, document_id } = req.params;

    return res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
        data: { deceased_id, document_id }
    });
});

// GET /deceased/:deceased_id/documents/:document_id - Get a specific document
router.get('/:deceased_id/documents/:document_id', (req: Request, res: Response) => {
    const { deceased_id, document_id } = req.params;

    return res.status(200).json({
        success: true,
        message: 'Document fetched successfully',
        data: { id: document_id, deceased_id }
    });
});

export default router;