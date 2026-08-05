import { db } from '../config/database.js';

export async function findUserByEmployeeId(employeeId) {
  const user = db.prepare('SELECT * FROM users WHERE employee_id = ?').get(employeeId);
  return user || null;
}

export async function getAllUsers() {
  return db.prepare('SELECT id, employee_id, name, role, department, discipline, created_at, last_login, is_locked FROM users ORDER BY name').all();
}

export async function getAllTechnicians() {
  return db.prepare('SELECT id, employee_id, name, department, discipline FROM users WHERE role = ? ORDER BY name').all('Technician');
}

export async function incrementFailedAttempts(employeeId) {
  const user = db.prepare('SELECT failed_attempts FROM users WHERE employee_id = ?').get(employeeId);
  const attempts = (user?.failed_attempts || 0) + 1;
  const isLocked = attempts >= 5;
  const lockedUntil = isLocked
    ? new Date(Date.now() + 30 * 60 * 1000).toISOString()
    : null;

  db.prepare(`
    UPDATE users 
    SET failed_attempts = ?, is_locked = ?, locked_until = ?
    WHERE employee_id = ?
  `).run(attempts, isLocked ? 1 : 0, lockedUntil, employeeId);

  return { attempts, isLocked };
}

export async function resetFailedAttempts(employeeId) {
  db.prepare(`
    UPDATE users
    SET failed_attempts = 0, is_locked = 0, locked_until = NULL, last_login = ?
    WHERE employee_id = ?
  `).run(new Date().toISOString(), employeeId);
}

export async function recordLoginHistory({ employeeId, success, ipAddress, userAgent, failureReason }) {
  db.prepare(`
    INSERT INTO login_history (employee_id, success, ip_address, user_agent, failure_reason)
    VALUES (?, ?, ?, ?, ?)
  `).run(employeeId, success ? 1 : 0, ipAddress, userAgent, failureReason || null);
}

export async function createUser({ employeeId, name, role, department, discipline, passwordHash }) {
  const result = db.prepare(`
    INSERT INTO users (employee_id, name, role, department, discipline, password_hash)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(employeeId, name, role, department, discipline, passwordHash);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
}

export async function updateUserPassword(employeeId, passwordHash) {
  db.prepare('UPDATE users SET password_hash = ? WHERE employee_id = ?').run(passwordHash, employeeId);
}
