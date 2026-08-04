import {
  getAllComplaints,
  getComplaintsByOperator,
  getComplaintsByTechnician,
  createComplaint,
  updateComplaint,
  getComplaintStats
} from '../repositories/complaint.repository.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { writeAuditLog } from '../middleware/auditLogger.js';

/**
 * Complaint Controller — Handles all complaint lifecycle HTTP endpoints
 */

/**
 * GET /api/complaints
 * Operators see only their own. Supervisors/Admin see all. Technicians see assigned.
 */
export async function listComplaints(req, res, next) {
  try {
    const { role, employeeId } = req.user;
    let result;

    if (role === 'Operator') {
      result = await getComplaintsByOperator(employeeId);
    } else if (role === 'Technician') {
      result = await getAllComplaints(); // Technicians see all so they can view assigned ones
    } else {
      result = await getAllComplaints();
    }

    return successResponse(res, { complaints: result.data, isLive: result.isLive });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/complaints
 * Operator submits a new breakdown report
 */
export async function submitComplaint(req, res, next) {
  try {
    const { machineId, machineName, categoryId, categoryName, faultName, priority, shift, description } = req.body;

    if (!machineId || !faultName) {
      return errorResponse(res, 'Machine and fault type are required.', 400, 'MISSING_FIELDS');
    }

    const complaintId = `CMP-${Date.now().toString().slice(-6)}`;

    const newComplaint = {
      id: complaintId,
      machineId,
      machineName,
      operatorName: req.user.name,
      employeeId: req.user.employeeId,
      department: req.user.department || 'Back Cover Dept',
      shift: shift || 'Shift A',
      categoryId: categoryId || 'mechanical',
      categoryName: categoryName || 'Mechanical Maintenance',
      faultName,
      priority: priority || 'High',
      description: description || '',
      status: 'New'
    };

    const result = await createComplaint(newComplaint);

    await writeAuditLog({
      userEmployeeId: req.user.employeeId,
      action: 'COMPLAINT_SUBMITTED',
      entityType: 'complaint',
      entityId: complaintId,
      ipAddress: req.ip
    });

    return successResponse(res, { complaint: result.data || newComplaint }, 'Breakdown complaint submitted successfully', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/complaints/:id/assign
 * Supervisor assigns a technician [Supervisor, Admin only]
 */
export async function assignTechnician(req, res, next) {
  try {
    const { id } = req.params;
    const { technicianId, technicianName } = req.body;

    if (!technicianId && !technicianName) {
      return errorResponse(res, 'Technician information is required.', 400, 'MISSING_FIELDS');
    }

    await updateComplaint(id, {
      assignedTechnician: technicianId || technicianName,
      status: 'Assigned',
      assignedTime: new Date().toISOString()
    });

    await writeAuditLog({
      userEmployeeId: req.user.employeeId,
      action: 'TECHNICIAN_ASSIGNED',
      entityType: 'complaint',
      entityId: id,
      ipAddress: req.ip
    });

    return successResponse(res, { complaintId: id, assignedTo: technicianId || technicianName }, 'Technician assigned successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/complaints/:id/accept
 * Technician accepts a job [Technician, Admin only]
 */
export async function acceptJob(req, res, next) {
  try {
    const { id } = req.params;

    await updateComplaint(id, {
      status: 'Accepted',
      acceptedTime: new Date().toISOString()
    });

    await writeAuditLog({ userEmployeeId: req.user.employeeId, action: 'JOB_ACCEPTED', entityType: 'complaint', entityId: id, ipAddress: req.ip });
    return successResponse(res, { complaintId: id }, 'Job accepted');
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/complaints/:id/start
 * Technician starts repair [Technician, Admin only]
 */
export async function startRepair(req, res, next) {
  try {
    const { id } = req.params;

    await updateComplaint(id, {
      status: 'Repair Started',
      repairStartedTime: new Date().toISOString()
    });

    await writeAuditLog({ userEmployeeId: req.user.employeeId, action: 'REPAIR_STARTED', entityType: 'complaint', entityId: id, ipAddress: req.ip });
    return successResponse(res, { complaintId: id }, 'Repair started');
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/complaints/:id/complete
 * Technician marks repair complete with remarks [Technician, Admin only]
 */
export async function completeRepair(req, res, next) {
  try {
    const { id } = req.params;
    const { remarks, partsChanged } = req.body;

    await updateComplaint(id, {
      status: 'Completed',
      completedTime: new Date().toISOString(),
      remarks: remarks || '',
      partsChanged: partsChanged || ''
    });

    await writeAuditLog({ userEmployeeId: req.user.employeeId, action: 'REPAIR_COMPLETED', entityType: 'complaint', entityId: id, ipAddress: req.ip });
    return successResponse(res, { complaintId: id }, 'Repair marked as completed');
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/complaints/:id/verify
 * Supervisor verifies and closes a job [Supervisor, Admin only]
 */
export async function verifyAndClose(req, res, next) {
  try {
    const { id } = req.params;

    await updateComplaint(id, {
      status: 'Closed',
      verifiedTime: new Date().toISOString()
    });

    await writeAuditLog({ userEmployeeId: req.user.employeeId, action: 'JOB_VERIFIED_CLOSED', entityType: 'complaint', entityId: id, ipAddress: req.ip });
    return successResponse(res, { complaintId: id }, 'Job verified and closed');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/dashboard/stats
 * KPI summary for supervisor/admin dashboard
 */
export async function getDashboardStats(req, res, next) {
  try {
    const stats = await getComplaintStats();
    return successResponse(res, stats, 'Dashboard statistics');
  } catch (err) {
    next(err);
  }
}
