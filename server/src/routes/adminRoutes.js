import { Router } from 'express';
import { 
  getDashboardStats, 
  listAllUsers, 
  updateUserStatus, 
  updateUserRole, 
  deleteUser, 
  listSessions, 
  revokeSession, 
  listAuditLogs, 
  getSecurityEvents 
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// All admin routes strictly require ADMIN role
router.use(requireAuth, requireRole(['ADMIN']));

router.get('/dashboard', getDashboardStats);
router.get('/users', listAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/sessions', listSessions);
router.delete('/sessions/:id', revokeSession);

router.get('/audit-logs', listAuditLogs);
router.get('/security', getSecurityEvents);

export default router;
