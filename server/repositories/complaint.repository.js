import { db } from '../config/database.js';

function mapComplaint(item) {
  return {
    id: item.id,
    machineId: item.machine_id,
    machineName: item.machine_name,
    operatorName: item.operator_name,
    employeeId: item.employee_id,
    department: item.department,
    shift: item.shift,
    categoryId: item.category_id,
    categoryName: item.category_name,
    faultName: item.fault_name,
    priority: item.priority,
    description: item.description,
    status: item.status,
    assignedTechnician: item.assigned_technician,
    createdTime: item.created_time,
    assignedTime: item.assigned_time,
    acceptedTime: item.accepted_time,
    repairStartedTime: item.repair_started_time,
    completedTime: item.completed_time,
    verifiedTime: item.verified_time,
    remarks: item.remarks,
    partsChanged: item.parts_changed
  };
}

export async function getAllComplaints() {
  const rows = db.prepare('SELECT * FROM complaints ORDER BY created_time DESC').all();
  return { data: rows.map(mapComplaint), isLive: true };
}

export async function getComplaintsByOperator(employeeId) {
  const rows = db.prepare('SELECT * FROM complaints WHERE employee_id = ? ORDER BY created_time DESC').all(employeeId);
  return { data: rows.map(mapComplaint), isLive: true };
}

export async function getComplaintsByTechnician(employeeId) {
  const rows = db.prepare('SELECT * FROM complaints WHERE assigned_technician = ? ORDER BY created_time DESC').all(employeeId);
  return { data: rows.map(mapComplaint), isLive: true };
}

export async function createComplaint(complaint) {
  await ensureMachineExists(complaint.machineId, complaint.machineName);

  db.prepare(`
    INSERT INTO complaints (
      id, machine_id, machine_name, operator_name, employee_id, department, shift,
      category_id, category_name, fault_name, priority, description, status, created_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    complaint.id,
    complaint.machineId,
    complaint.machineName,
    complaint.operatorName,
    complaint.employeeId,
    complaint.department || 'Back Cover Dept',
    complaint.shift || 'Shift A',
    complaint.categoryId || 'mechanical',
    complaint.categoryName || 'Mechanical Maintenance',
    complaint.faultName,
    complaint.priority || 'High',
    complaint.description || '',
    'New',
    new Date().toISOString()
  );

  const row = db.prepare('SELECT * FROM complaints WHERE id = ?').get(complaint.id);
  return { success: true, data: mapComplaint(row), isLive: true };
}

export async function updateComplaint(complaintId, updates) {
  const setClauses = [];
  const values = [];

  const map = {
    status: 'status',
    assignedTechnician: 'assigned_technician',
    assignedTime: 'assigned_time',
    acceptedTime: 'accepted_time',
    repairStartedTime: 'repair_started_time',
    completedTime: 'completed_time',
    verifiedTime: 'verified_time',
    remarks: 'remarks',
    partsChanged: 'parts_changed'
  };

  for (const [key, dbCol] of Object.entries(map)) {
    if (updates[key] !== undefined) {
      setClauses.push(`${dbCol} = ?`);
      values.push(updates[key]);
    }
  }

  if (setClauses.length > 0) {
    values.push(complaintId);
    db.prepare(`UPDATE complaints SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
  }

  return { success: true, isLive: true };
}

async function ensureMachineExists(machineId, machineName) {
  if (!machineId) return;
  const exists = db.prepare('SELECT id FROM machines WHERE id = ?').get(machineId);
  if (!exists) {
    db.prepare(`
      INSERT INTO machines (id, name, code, location, type, status, criticality)
      VALUES (?, ?, ?, 'Back Cover Line', 'Friction Press', 'Operational', 'High')
    `).run(machineId, machineName || machineId, machineId);
  }
}

export async function getComplaintStats() {
  const rows = db.prepare('SELECT status FROM complaints').all();
  
  return {
    total: rows.length,
    open: rows.filter(c => c.status === 'New').length,
    inProgress: rows.filter(c => ['Assigned', 'Accepted', 'Repair Started'].includes(c.status)).length,
    completed: rows.filter(c => c.status === 'Completed').length,
    closed: rows.filter(c => c.status === 'Closed').length,
    critical: rows.filter(c => c.status !== 'Closed').length
  };
}
