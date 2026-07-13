import { Router } from 'express';
import {
    savePostmortem,
    getPostmortemByDeceasedId,
    updatePostmortem,
    deletePostmortem,
    generatePostmortemPDF
} from '../controllers/autopsyControl';

const router = Router();

// Import authentication middleware
// @ts-ignore - authMiddleware is JavaScript, not TypeScript
const { protect, authorizeAny } = require('../../../services/app-global/middlewares/authMiddleware');

// All routes are protected with JWT authentication
router.use(protect);
router.use(authorizeAny as any);

// Postmortem/Autopsy routes - Full paths
router.post('/api/v1/restpoint/deceased/postmortem/save', savePostmortem);
router.get('/api/v1/restpoint/deceased/postmortem/:deceased_id', getPostmortemByDeceasedId);
router.put('/api/v1/restpoint/deceased/postmortem/:id', updatePostmortem);
router.delete('/api/v1/restpoint/deceased/postmortem/:id', deletePostmortem);
router.get('/api/v1/restpoint/deceased/postmortem/:deceased_id/pdf', generatePostmortemPDF);

// Short paths
router.post('/postmortem/save', savePostmortem);
router.get('/postmortem/:deceased_id', getPostmortemByDeceasedId);
router.put('/postmortem/:id', updatePostmortem);
router.delete('/postmortem/:id', deletePostmortem);
router.get('/postmortem/:deceased_id/pdf', generatePostmortemPDF);

export default router;