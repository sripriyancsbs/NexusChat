import { Router } from 'express';
import { submitAccessRequest, listAccessRequests, reviewAccessRequest } from '../controllers/accessRequestController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public: Submit access request
router.post('/', submitAccessRequest);

// Admin: Manage access requests
router.get('/admin', requireAuth, requireRole(['ADMIN']), listAccessRequests);
router.patch('/admin/:id', requireAuth, requireRole(['ADMIN']), reviewAccessRequest);

export default router;
