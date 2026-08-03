import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { MACHINES, INITIAL_COMPLAINTS } from '../src/mockData.js';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function seedAll() {
  console.log('Seeding all 20 machines...');
  const machinePayloads = MACHINES.map(m => ({
    id: m.id,
    name: m.name,
    code: m.code,
    location: m.location,
    type: m.type,
    status: m.status,
    criticality: m.criticality
  }));

  const { data: mData, error: mErr } = await supabase.from('machines').upsert(machinePayloads).select();
  if (mErr) {
    console.error('MACHINE UPSERT ERROR:', mErr);
    return;
  }
  console.log('MACHINES UPSERTED:', mData.length);

  console.log('Seeding initial complaints...');
  const complaintPayloads = INITIAL_COMPLAINTS.map(c => ({
    id: c.id,
    machine_id: c.machineId,
    machine_name: c.machineName,
    operator_name: c.operatorName,
    employee_id: c.employeeId || 'EMP-1001',
    department: c.department || 'Back Cover Dept',
    shift: c.shift || 'Shift A',
    category_id: c.categoryId || 'CAT-01',
    category_name: c.categoryName || 'General',
    fault_name: c.faultName,
    priority: c.priority || 'High',
    description: c.description || '',
    status: c.status || 'New',
    assigned_technician: c.assignedTechnician || 'Unassigned',
    created_time: c.createdTime || new Date().toISOString()
  }));

  const { data: cData, error: cErr } = await supabase.from('complaints').upsert(complaintPayloads).select();
  if (cErr) {
    console.error('COMPLAINT UPSERT ERROR:', cErr);
    return;
  }
  console.log('INITIAL COMPLAINTS UPSERTED:', cData.length);

  console.log('Testing Verify & Close update on CMP-2026-101...');
  const { data: uData, error: uErr } = await supabase
    .from('complaints')
    .update({
      status: 'Closed',
      verified_time: new Date().toISOString()
    })
    .eq('id', 'CMP-2026-101')
    .select();


  if (uErr) {
    console.error('VERIFY UPDATE ERROR:', uErr);
  } else {
    console.log('VERIFY UPDATE SUCCESS:', uData);
  }
}

seedAll();
