import { Router } from 'express';
import { submitReport, listReports, getReportDetails, resolveReport } from '../controllers/reportController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// Members can report messages
router.post('/', submitReport);

// Only Moderators & Admins can access reports queue
router.get('/admin', requireRole(['MODERATOR', 'ADMIN']), listReports);
router.get('/admin/:id', requireRole(['MODERATOR', 'ADMIN']), getReportDetails);
router.patch('/admin/:id', requireRole(['MODERATOR', 'ADMIN']), resolveReport);

export default router;
