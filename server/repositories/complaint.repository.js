import { supabase } from '../config/database.js';
import { INITIAL_COMPLAINTS } from '../../src/mockData.js';

/**
 * Complaint Repository — All database queries for the complaints table
 */

// Map DB snake_case row → frontend camelCase object
function mapComplaint(item) {
  return {
    id: item.id,
    machineId: item.machine_id,
    machineName: item.machine_name,
    operatorName: item.operator_name,
    employeeId: item.operator_employee_id || item.employee_id,
    department: item.department,
    shift: item.shift,
    categoryId: item.category_id,
    categoryName: item.category_name,
    faultName: item.fault_name,
    priority: item.priority,
    description: item.description,
    status: item.status,
    assignedTechnician: item.assigned_technician || item.assigned_technician_id,
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

/**
 * Fetch all complaints (newest first)
 */
export async function getAllComplaints() {
  if (!supabase) return { data: INITIAL_COMPLAINTS, isLive: false };

  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .order('created_time', { ascending: false });

  if (error) {
    console.warn('[COMPLAINTS] Fetch error, using demo data:', error.message);
    return { data: INITIAL_COMPLAINTS, isLive: false };
  }

  return { data: data.map(mapComplaint), isLive: true };
}

/**
 * Fetch complaints for a specific operator (their own only)
 */
export async function getComplaintsByOperator(employeeId) {
  if (!supabase) {
    return { data: INITIAL_COMPLAINTS.filter(c => c.employeeId === employeeId), isLive: false };
  }

  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_time', { ascending: false });

  if (error) throw new Error(error.message);
  return { data: data.map(mapComplaint), isLive: true };
}

/**
 * Fetch complaints assigned to a specific technician
 */
export async function getComplaintsByTechnician(employeeId) {
  if (!supabase) {
    return { data: INITIAL_COMPLAINTS.filter(c => c.assignedTechnician === employeeId), isLive: false };
  }

  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('assigned_technician', employeeId)
    .order('created_time', { ascending: false });

  if (error) throw new Error(error.message);
  return { data: data.map(mapComplaint), isLive: true };
}

/**
 * Create a new complaint
 */
export async function createComplaint(complaint) {
  if (!supabase) return { success: true, isLive: false };

  // Ensure the referenced machine exists
  await ensureMachineExists(complaint.machineId, complaint.machineName);

  const { data, error } = await supabase
    .from('complaints')
    .insert([{
      id: complaint.id,
      machine_id: complaint.machineId,
      machine_name: complaint.machineName,
      operator_name: complaint.operatorName,
      employee_id: complaint.employeeId,
      department: complaint.department || 'Back Cover Dept',
      shift: complaint.shift || 'Shift A',
      category_id: complaint.categoryId || 'mechanical',
      category_name: complaint.categoryName || 'Mechanical Maintenance',
      fault_name: complaint.faultName,
      priority: complaint.priority || 'High',
      description: complaint.description || '',
      status: 'New',
      created_time: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, data: mapComplaint(data), isLive: true };
}

/**
 * Update complaint fields (status, technician, timestamps, remarks)
 */
export async function updateComplaint(complaintId, updates) {
  if (!supabase) return { success: true, isLive: false };

  const dbUpdates = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.assignedTechnician !== undefined) dbUpdates.assigned_technician = updates.assignedTechnician;
  if (updates.assignedTime !== undefined) dbUpdates.assigned_time = updates.assignedTime;
  if (updates.acceptedTime !== undefined) dbUpdates.accepted_time = updates.acceptedTime;
  if (updates.repairStartedTime !== undefined) dbUpdates.repair_started_time = updates.repairStartedTime;
  if (updates.completedTime !== undefined) dbUpdates.completed_time = updates.completedTime;
  if (updates.verifiedTime !== undefined) dbUpdates.verified_time = updates.verifiedTime;
  if (updates.remarks !== undefined) dbUpdates.remarks = updates.remarks;
  if (updates.partsChanged !== undefined) dbUpdates.parts_changed = updates.partsChanged;

  const { error } = await supabase
    .from('complaints')
    .update(dbUpdates)
    .eq('id', complaintId);

  if (error) throw new Error(error.message);
  return { success: true, isLive: true };
}

/**
 * Ensure a machine record exists before creating a complaint (FK constraint)
 */
async function ensureMachineExists(machineId, machineName) {
  if (!supabase || !machineId) return;
  try {
    const { data } = await supabase.from('machines').select('id').eq('id', machineId).single();
    if (!data) {
      await supabase.from('machines').insert([{
        id: machineId,
        name: machineName || machineId,
        code: machineId,
        location: 'Back Cover Line',
        type: 'Friction Press',
        status: 'Operational',
        criticality: 'High'
      }]);
    }
  } catch (_) { /* ignore */ }
}

/**
 * Get KPI statistics for dashboard
 */
export async function getComplaintStats() {
  if (!supabase) {
    return {
      total: INITIAL_COMPLAINTS.length,
      open: INITIAL_COMPLAINTS.filter(c => c.status === 'New').length,
      inProgress: INITIAL_COMPLAINTS.filter(c => ['Assigned','Accepted','Repair Started'].includes(c.status)).length,
      closed: INITIAL_COMPLAINTS.filter(c => c.status === 'Closed').length
    };
  }

  const { data } = await supabase.from('complaints').select('status');
  if (!data) return { total: 0, open: 0, inProgress: 0, closed: 0 };

  return {
    total: data.length,
    open: data.filter(c => c.status === 'New').length,
    inProgress: data.filter(c => ['Assigned','Accepted','Repair Started'].includes(c.status)).length,
    completed: data.filter(c => c.status === 'Completed').length,
    closed: data.filter(c => c.status === 'Closed').length,
    critical: data.filter(c => c.status !== 'Closed').length
  };
}
