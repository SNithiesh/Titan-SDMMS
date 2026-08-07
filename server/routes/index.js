import { Router } from 'express';
import authRoutes from './auth.routes.js';
import complaintRoutes from './complaint.routes.js';
import resourceRoutes from './resource.routes.js';

import notificationRoutes from './notification.routes.js';
import userRoutes from './user.routes.js';
import erpRoutes from './erp.routes.js';

const router = Router();

// Mount all route groups under /api
router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/resources', resourceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/erp', erpRoutes);

// Health check — no auth required
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'TITAN SDMMS API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;
