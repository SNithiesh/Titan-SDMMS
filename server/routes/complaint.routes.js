import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import {
  listComplaints,
  submitComplaint,
  assignTechnician,
  acceptJob,
  startRepair,
  completeRepair,
  verifyAndClose,
  getDashboardStats
} from '../controllers/complaint.controller.js';

const router = Router();

// All complaint routes require authentication
router.use(authenticate);

// GET /api/complaints — role-filtered list
router.get('/', listComplaints);

// POST /api/complaints — Operator submits a new breakdown report
router.post('/', authorize('Operator', 'Admin'), submitComplaint);

// PATCH /api/complaints/:id/assign — Supervisor assigns technician
router.patch('/:id/assign', authorize('Supervisor', 'Admin'), assignTechnician);

// PATCH /api/complaints/:id/accept — Technician accepts job
router.patch('/:id/accept', authorize('Technician', 'Admin'), acceptJob);

// PATCH /api/complaints/:id/start — Technician starts repair
router.patch('/:id/start', authorize('Technician', 'Admin'), startRepair);

// PATCH /api/complaints/:id/complete — Technician marks complete
router.patch('/:id/complete', authorize('Technician', 'Admin'), completeRepair);

// PATCH /api/complaints/:id/verify — Supervisor verifies and closes
router.patch('/:id/verify', authorize('Supervisor', 'Admin'), verifyAndClose);

// GET /api/complaints/stats — Dashboard KPIs
router.get('/stats', authorize('Supervisor', 'Admin'), getDashboardStats);

export default router;
