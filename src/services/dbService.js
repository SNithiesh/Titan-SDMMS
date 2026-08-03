import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_COMPLAINTS, DEMO_USERS } from '../mockData';

/**
 * Fetch all complaints from Supabase or fallback to mock data
 */
export async function fetchComplaints() {
  if (!isSupabaseConfigured()) {
    return { data: INITIAL_COMPLAINTS, isLive: false };
  }

  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_time', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error, falling back to local data:', error.message);
      return { data: INITIAL_COMPLAINTS, isLive: false };
    }

    // Map table column names to app camelCase properties if needed
    const mapped = data.map(item => ({
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
    }));

    return { data: mapped, isLive: true };
  } catch (err) {
    console.warn('Supabase connection failed:', err);
    return { data: INITIAL_COMPLAINTS, isLive: false };
  }
}

/**
 * Save a new complaint to Supabase
 */
export async function createComplaintInDb(newCmp) {
  if (!isSupabaseConfigured()) {
    return { success: true, isLive: false };
  }

  try {
    const dbPayload = {
      id: newCmp.id,
      machine_id: newCmp.machineId,
      machine_name: newCmp.machineName,
      operator_name: newCmp.operatorName,
      employee_id: newCmp.employeeId || 'EMP-1001',
      department: newCmp.department || 'Back Cover Dept',
      shift: newCmp.shift || 'Shift A',
      category_id: newCmp.categoryId || 'CAT-01',
      category_name: newCmp.categoryName || 'General',
      fault_name: newCmp.faultName,
      priority: newCmp.priority || 'High',
      description: newCmp.description || '',
      status: newCmp.status || 'New',
      assigned_technician: newCmp.assignedTechnician || 'Unassigned',
      created_time: newCmp.createdTime || new Date().toISOString()
    };

    const { error } = await supabase.from('complaints').insert([dbPayload]);
    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: error.message };
    }
    return { success: true, isLive: true };
  } catch (err) {
    console.error('Supabase save error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update an existing complaint in Supabase
 */
export async function updateComplaintInDb(complaintId, updates) {
  if (!isSupabaseConfigured()) {
    return { success: true, isLive: false };
  }

  try {
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

    if (error) {
      console.error('Supabase update error:', error);
      return { success: false, error: error.message };
    }
    return { success: true, isLive: true };
  } catch (err) {
    console.error('Supabase update error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Realtime listener for Live Timeline updates across phones/desktops
 */
export function subscribeToRealtimeComplaints(onChangeCallback) {
  if (!isSupabaseConfigured()) return () => {};

  const subscription = supabase
    .channel('public:complaints')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, (payload) => {
      onChangeCallback(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}
