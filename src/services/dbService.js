import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_COMPLAINTS, MACHINES, DEMO_USERS } from '../mockData';

/**
 * Seed Users, Machines and initial complaints if Supabase tables are empty
 */
export async function seedInitialDataIfEmpty() {
  if (!isSupabaseConfigured()) return;

  try {
    // 1. Check & Seed Users
    const { data: existingUsers } = await supabase.from('users').select('id').limit(1);
    if (!existingUsers || existingUsers.length === 0) {
      console.log('Seeding initial user accounts to Supabase...');
      const userPayloads = DEMO_USERS.map(u => ({
        employee_id: u.employeeId,
        name: u.name,
        role: u.role,
        department: u.department,
        discipline: u.discipline || null,
        password: u.password || '123'
      }));
      await supabase.from('users').upsert(userPayloads, { onConflict: 'employee_id' });
    }

    // 2. Check & Seed Machines
    const { data: existingMachines } = await supabase.from('machines').select('id').limit(1);
    if (!existingMachines || existingMachines.length === 0) {
      console.log('Seeding 20 press machines to Supabase...');
      const machinePayloads = MACHINES.map(m => ({
        id: m.id,
        name: m.name,
        code: m.code,
        location: m.location,
        type: m.type,
        status: m.status,
        criticality: m.criticality
      }));
      await supabase.from('machines').upsert(machinePayloads);
    }

    // 3. Check & Seed Initial Complaints
    const { data: existingComplaints } = await supabase.from('complaints').select('id').limit(1);
    if (!existingComplaints || existingComplaints.length === 0) {
      console.log('Seeding initial complaints to Supabase...');
      const complaintPayloads = INITIAL_COMPLAINTS.map(c => ({
        id: c.id,
        machine_id: c.machineId,
        machine_name: c.machineName,
        operator_name: c.operatorName,
        employee_id: c.employeeId || 'EMP-1001',
        department: c.department || 'Back Cover Dept',
        shift: c.shift || 'Shift A',
        category_id: c.categoryId || 'mechanical',
        category_name: c.categoryName || 'Mechanical Maintenance',
        fault_name: c.faultName,
        priority: c.priority || 'High',
        description: c.description || '',
        status: c.status || 'New',
        assigned_technician: c.assignedTechnician || 'Unassigned',
        created_time: c.createdTime || new Date().toISOString(),
        assigned_time: c.assignedTime || null,
        accepted_time: c.acceptedTime || null,
        repair_started_time: c.repairStartedTime || null,
        completed_time: c.completedTime || null,
        verified_time: c.verifiedTime || null,
        remarks: c.remarks || '',
        parts_changed: c.partsChanged || ''
      }));
      await supabase.from('complaints').upsert(complaintPayloads);
    }
  } catch (err) {
    console.warn('Initial data seeding skipped:', err.message);
  }
}

/**
 * Authenticate User Credentials against Supabase database or local accounts
 */
export async function authenticateUser(employeeId, password) {
  const cleanEmpId = employeeId.trim().toUpperCase();

  if (isSupabaseConfigured()) {
    try {
      await seedInitialDataIfEmpty();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('employee_id', cleanEmpId)
        .single();

      if (data && !error) {
        if (data.password === password) {
          return {
            success: true,
            user: {
              id: data.id,
              employeeId: data.employee_id,
              name: data.name,
              role: data.role,
              department: data.department,
              discipline: data.discipline
            }
          };
        } else {
          return { success: false, error: 'Incorrect password entered.' };
        }
      }
    } catch (err) {
      console.warn('Supabase auth check failed, checking local users:', err.message);
    }
  }

  // Fallback to DEMO_USERS
  const found = DEMO_USERS.find(
    u => u.employeeId.toUpperCase() === cleanEmpId
  );

  if (found) {
    if (found.password === password) {
      return { success: true, user: found };
    } else {
      return { success: false, error: 'Incorrect password entered.' };
    }
  }

  return { success: false, error: 'Employee ID not found. Try EMP-7801, EMP-4402, or EMP-1001.' };
}

/**
 * Fetch all complaints from Supabase or fallback to mock data
 */
export async function fetchComplaints() {
  if (!isSupabaseConfigured()) {
    return { data: INITIAL_COMPLAINTS, isLive: false };
  }

  try {
    await seedInitialDataIfEmpty();

    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_time', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error, falling back to local data:', error.message);
      return { data: INITIAL_COMPLAINTS, isLive: false };
    }

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
 * Ensure foreign key machine exists before saving complaint
 */
async function ensureMachineExists(machineId, machineName) {
  if (!isSupabaseConfigured() || !machineId) return;
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
  } catch (e) {
    // ignore duplicate
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
    await ensureMachineExists(newCmp.machineId, newCmp.machineName);

    const dbPayload = {
      id: newCmp.id,
      machine_id: newCmp.machineId,
      machine_name: newCmp.machineName,
      operator_name: newCmp.operatorName,
      employee_id: newCmp.employeeId || 'EMP-1001',
      department: newCmp.department || 'Back Cover Dept',
      shift: newCmp.shift || 'Shift A',
      category_id: newCmp.categoryId || 'mechanical',
      category_name: newCmp.categoryName || 'General Maintenance',
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
