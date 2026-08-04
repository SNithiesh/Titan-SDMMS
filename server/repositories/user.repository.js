import { supabase } from '../config/database.js';
import { DEMO_USERS } from '../../src/mockData.js';

/**
 * User Repository — All database queries for the users table
 * Controllers never write SQL directly — they call these functions
 */

/**
 * Find a user by their employee ID (e.g. EMP-7801)
 * Returns the full user record including password_hash
 */
export async function findUserByEmployeeId(employeeId) {
  if (!supabase) {
    // Offline mode: search demo users
    const user = DEMO_USERS.find(u => u.employeeId?.toUpperCase() === employeeId.toUpperCase());
    return user || null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('employee_id', employeeId)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Get all users (Admin only)
 */
export async function getAllUsers() {
  if (!supabase) return DEMO_USERS;

  const { data, error } = await supabase
    .from('users')
    .select('id, employee_id, name, role, department, discipline, created_at, last_login, is_locked')
    .order('name');

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Get all technicians (for supervisor assignment dropdown)
 */
export async function getAllTechnicians() {
  if (!supabase) return DEMO_USERS.filter(u => u.role === 'Technician');

  const { data, error } = await supabase
    .from('users')
    .select('id, employee_id, name, department, discipline')
    .eq('role', 'Technician')
    .order('name');

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update failed login attempt counter
 * If attempts >= 5, lock the account for 30 minutes
 */
export async function incrementFailedAttempts(employeeId) {
  if (!supabase) return;

  const { data } = await supabase
    .from('users')
    .select('failed_attempts')
    .eq('employee_id', employeeId)
    .single();

  const attempts = (data?.failed_attempts || 0) + 1;
  const isLocked = attempts >= 5;
  const lockedUntil = isLocked
    ? new Date(Date.now() + 30 * 60 * 1000).toISOString()
    : null;

  await supabase
    .from('users')
    .update({
      failed_attempts: attempts,
      is_locked: isLocked,
      locked_until: lockedUntil
    })
    .eq('employee_id', employeeId);

  return { attempts, isLocked };
}

/**
 * Reset failed attempts after successful login
 */
export async function resetFailedAttempts(employeeId) {
  if (!supabase) return;

  await supabase
    .from('users')
    .update({
      failed_attempts: 0,
      is_locked: false,
      locked_until: null,
      last_login: new Date().toISOString()
    })
    .eq('employee_id', employeeId);
}

/**
 * Record a login attempt in login_history table
 */
export async function recordLoginHistory({ employeeId, success, ipAddress, userAgent, failureReason }) {
  if (!supabase) return;

  await supabase.from('login_history').insert([{
    employee_id: employeeId,
    success,
    ip_address: ipAddress,
    user_agent: userAgent,
    failure_reason: failureReason || null
  }]);
}

/**
 * Create a new user (Admin only)
 */
export async function createUser({ employeeId, name, role, department, discipline, passwordHash }) {
  if (!supabase) throw new Error('Database not connected');

  const { data, error } = await supabase
    .from('users')
    .insert([{
      employee_id: employeeId,
      name,
      role,
      department,
      discipline,
      password_hash: passwordHash
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update user password hash (Admin reset)
 */
export async function updateUserPassword(employeeId, passwordHash) {
  if (!supabase) throw new Error('Database not connected');

  const { error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('employee_id', employeeId);

  if (error) throw new Error(error.message);
}
