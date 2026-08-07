import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import {
  listComplaints, editComplaint, archiveComplaint, unarchiveComplaint,
  listMachines, addMachine, editMachine, removeMachine,
  listFaultCategories, addFaultCategory, editFaultCategory, removeFaultCategory,
  listFaultTypes, addFaultType, editFaultType, removeFaultType,
  listDepartments, addDepartment, editDepartment, removeDepartment,
  listSettings, saveSetting,
  listAuditLogs
} from '../controllers/erp.controller.js';

const router = Router();

// All ERP routes require authentication + Admin role
router.use(authenticate, authorize('Admin'));

// ── Complaint Management ──────────────────────────────────────────────────────
router.get('/complaints', listComplaints);
router.put('/complaints/:id', editComplaint);
router.delete('/complaints/:id', archiveComplaint);
router.put('/complaints/:id/restore', unarchiveComplaint);

// ── Machine Management ────────────────────────────────────────────────────────
router.get('/machines', listMachines);
router.post('/machines', addMachine);
router.put('/machines/:id', editMachine);
router.delete('/machines/:id', removeMachine);

// ── Fault Category Management ─────────────────────────────────────────────────
router.get('/fault-categories', listFaultCategories);
router.post('/fault-categories', addFaultCategory);
router.put('/fault-categories/:id', editFaultCategory);
router.delete('/fault-categories/:id', removeFaultCategory);

// ── Fault Type Management ─────────────────────────────────────────────────────
router.get('/fault-types', listFaultTypes);
router.post('/fault-types', addFaultType);
router.put('/fault-types/:id', editFaultType);
router.delete('/fault-types/:id', removeFaultType);

// ── Department Management ─────────────────────────────────────────────────────
router.get('/departments', listDepartments);
router.post('/departments', addDepartment);
router.put('/departments/:id', editDepartment);
router.delete('/departments/:id', removeDepartment);

// ── System Settings ───────────────────────────────────────────────────────────
router.get('/settings', listSettings);
router.post('/settings', saveSetting);

// ── Audit Logs ────────────────────────────────────────────────────────────────
router.get('/audit-logs', listAuditLogs);

export default router;
