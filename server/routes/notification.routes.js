import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import {
  listUnreadNotifications,
  markAsRead,
  markAllAsRead
} from '../controllers/notification.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorize('Supervisor', 'Admin')); // Only supervisors/admins handle these notifications

router.get('/unread', listUnreadNotifications);
router.patch('/mark-all-read', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
