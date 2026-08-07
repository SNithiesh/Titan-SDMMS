import { db } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import * as repo from '../repositories/erp.repository.js';

const audit = (req, action, entityType, entityId) => {
  try {
    db.prepare('INSERT INTO audit_logs (user_employee_id, action, entity_type, entity_id, ip_address) VALUES (?,?,?,?,?)')
      .run(req.user?.employeeId || 'system', action, entityType, String(entityId), req.ip || '');
  } catch {}
};

// ─── COMPLAINTS ─────────────────────────────────────────────────────────────
export const listComplaints = (req, res) => {
  try {
    const result = repo.getAllComplaints({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      status: req.query.status,
      priority: req.query.priority,
      showDeleted: req.query.showDeleted === 'true'
    });
    res.json(successResponse('Complaints loaded', result));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const editComplaint = (req, res) => {
  try {
    const { id } = req.params;
    const existing = repo.getComplaintById(id);
    if (!existing) return res.status(404).json(errorResponse('Complaint not found'));
    repo.adminUpdateComplaint(id, req.body);
    audit(req, 'UPDATE', 'complaint', id);
    res.json(successResponse('Complaint updated'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const archiveComplaint = (req, res) => {
  try {
    repo.softDeleteComplaint(req.params.id);
    audit(req, 'ARCHIVE', 'complaint', req.params.id);
    res.json(successResponse('Complaint archived'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const unarchiveComplaint = (req, res) => {
  try {
    repo.restoreComplaint(req.params.id);
    audit(req, 'RESTORE', 'complaint', req.params.id);
    res.json(successResponse('Complaint restored'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

// ─── MACHINES ────────────────────────────────────────────────────────────────
export const listMachines = (req, res) => {
  try {
    const result = repo.getAllMachines({ page: req.query.page, limit: req.query.limit, search: req.query.search, type: req.query.type, status: req.query.status });
    res.json(successResponse('Machines loaded', result));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const addMachine = (req, res) => {
  try {
    const machine = repo.createMachine(req.body);
    audit(req, 'CREATE', 'machine', machine.id);
    res.status(201).json(successResponse('Machine created', { machine }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const editMachine = (req, res) => {
  try {
    repo.updateMachine(req.params.id, req.body);
    audit(req, 'UPDATE', 'machine', req.params.id);
    res.json(successResponse('Machine updated'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const removeMachine = (req, res) => {
  try {
    repo.deleteMachine(req.params.id);
    audit(req, 'DELETE', 'machine', req.params.id);
    res.json(successResponse('Machine archived'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

// ─── FAULT CATEGORIES ────────────────────────────────────────────────────────
export const listFaultCategories = (req, res) => {
  try {
    const cats = repo.getAllFaultCategories();
    res.json(successResponse('Categories loaded', { categories: cats }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const addFaultCategory = (req, res) => {
  try {
    const cat = repo.createFaultCategory(req.body);
    audit(req, 'CREATE', 'fault_category', cat.id);
    res.status(201).json(successResponse('Category created', { category: cat }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const editFaultCategory = (req, res) => {
  try {
    repo.updateFaultCategory(req.params.id, req.body);
    audit(req, 'UPDATE', 'fault_category', req.params.id);
    res.json(successResponse('Category updated'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const removeFaultCategory = (req, res) => {
  try {
    repo.deleteFaultCategory(req.params.id);
    audit(req, 'DELETE', 'fault_category', req.params.id);
    res.json(successResponse('Category removed'));
  } catch (err) {
    res.status(400).json(errorResponse(err.message));
  }
};

// ─── FAULT TYPES ─────────────────────────────────────────────────────────────
export const listFaultTypes = (req, res) => {
  try {
    const types = repo.getFaultTypesByCategory(req.query.categoryId || '');
    res.json(successResponse('Fault types loaded', { types }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const addFaultType = (req, res) => {
  try {
    const ft = repo.createFaultType(req.body);
    audit(req, 'CREATE', 'fault_type', ft.id);
    res.status(201).json(successResponse('Fault type created', { faultType: ft }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const editFaultType = (req, res) => {
  try {
    repo.updateFaultType(req.params.id, req.body);
    audit(req, 'UPDATE', 'fault_type', req.params.id);
    res.json(successResponse('Fault type updated'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const removeFaultType = (req, res) => {
  try {
    repo.deleteFaultType(req.params.id);
    audit(req, 'DELETE', 'fault_type', req.params.id);
    res.json(successResponse('Fault type removed'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
export const listDepartments = (req, res) => {
  try {
    const depts = repo.getAllDepartments();
    res.json(successResponse('Departments loaded', { departments: depts }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const addDepartment = (req, res) => {
  try {
    const dept = repo.createDepartment(req.body);
    audit(req, 'CREATE', 'department', dept.id);
    res.status(201).json(successResponse('Department created', { department: dept }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const editDepartment = (req, res) => {
  try {
    repo.updateDepartment(req.params.id, req.body);
    audit(req, 'UPDATE', 'department', req.params.id);
    res.json(successResponse('Department updated'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const removeDepartment = (req, res) => {
  try {
    repo.deleteDepartment(req.params.id);
    audit(req, 'DELETE', 'department', req.params.id);
    res.json(successResponse('Department removed'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

// ─── SYSTEM SETTINGS ─────────────────────────────────────────────────────────
export const listSettings = (req, res) => {
  try {
    const settings = repo.getAllSettings();
    res.json(successResponse('Settings loaded', { settings }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const saveSetting = (req, res) => {
  try {
    const { key, value, description } = req.body;
    if (!key || value === undefined) return res.status(400).json(errorResponse('key and value are required'));
    repo.upsertSetting(key, value, description);
    audit(req, 'UPSERT', 'system_setting', key);
    res.json(successResponse('Setting saved'));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

// ─── AUDIT LOGS ──────────────────────────────────────────────────────────────
export const listAuditLogs = (req, res) => {
  try {
    const result = repo.getAuditLogs({ page: req.query.page, limit: req.query.limit, search: req.query.search });
    res.json(successResponse('Audit logs loaded', result));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};
