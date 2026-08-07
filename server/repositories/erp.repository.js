import { db } from '../config/database.js';

// ─── Migrate schema: add soft-delete columns if missing ───────────────────────
try { db.exec('ALTER TABLE complaints ADD COLUMN is_deleted BOOLEAN DEFAULT 0'); } catch {}
try { db.exec('ALTER TABLE machines ADD COLUMN is_deleted BOOLEAN DEFAULT 0'); } catch {}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLAINT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
export function getAllComplaints({ page = 1, limit = 15, search = '', status = '', priority = '', showDeleted = false } = {}) {
  const offset = (Number(page) - 1) * Number(limit);
  const conditions = [];
  const params = [];

  if (!showDeleted) { conditions.push('is_deleted = 0'); }
  if (status)       { conditions.push('status = ?'); params.push(status); }
  if (priority)     { conditions.push('priority = ?'); params.push(priority); }
  if (search) {
    conditions.push('(id LIKE ? OR machine_name LIKE ? OR fault_name LIKE ? OR operator_name LIKE ?)');
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const totalRow = db.prepare(`SELECT COUNT(*) as count FROM complaints ${where}`).get(...params);
  const total = totalRow.count;
  const totalPages = Math.ceil(total / Number(limit)) || 1;

  const rows = db.prepare(`SELECT * FROM complaints ${where} ORDER BY created_time DESC LIMIT ? OFFSET ?`).all(...params, Number(limit), offset);
  return { complaints: rows, total, totalPages, page: Number(page) };
}

export function getComplaintById(id) {
  return db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
}

export function adminUpdateComplaint(id, data) {
  const allowed = ['status', 'priority', 'assigned_technician', 'description', 'remarks', 'department', 'shift'];
  const sets = [];
  const vals = [];
  for (const key of allowed) {
    if (data[key] !== undefined) { sets.push(`${key} = ?`); vals.push(data[key]); }
  }
  if (!sets.length) return;
  vals.push(id);
  db.prepare(`UPDATE complaints SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
}

export function softDeleteComplaint(id) {
  db.prepare('UPDATE complaints SET is_deleted = 1 WHERE id = ?').run(id);
}

export function restoreComplaint(id) {
  db.prepare('UPDATE complaints SET is_deleted = 0 WHERE id = ?').run(id);
}

// ─────────────────────────────────────────────────────────────────────────────
// MACHINE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
export function getAllMachines({ page = 1, limit = 20, search = '', type = '', status = '' } = {}) {
  const offset = (Number(page) - 1) * Number(limit);
  const conditions = ['is_deleted = 0'];
  const params = [];

  if (type)   { conditions.push('type = ?'); params.push(type); }
  if (status) { conditions.push('status = ?'); params.push(status); }
  if (search) {
    conditions.push('(id LIKE ? OR name LIKE ? OR code LIKE ? OR location LIKE ?)');
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  const where = 'WHERE ' + conditions.join(' AND ');
  const total = db.prepare(`SELECT COUNT(*) as count FROM machines ${where}`).get(...params).count;
  const totalPages = Math.ceil(total / Number(limit)) || 1;
  const rows = db.prepare(`SELECT * FROM machines ${where} ORDER BY name ASC LIMIT ? OFFSET ?`).all(...params, Number(limit), offset);
  return { machines: rows, total, totalPages, page: Number(page) };
}

export function getMachineById(id) {
  return db.prepare('SELECT * FROM machines WHERE id = ?').get(id);
}

export function createMachine(data) {
  const { id, name, code, location, type, status = 'Operational', criticality = 'Medium' } = data;
  db.prepare('INSERT INTO machines (id, name, code, location, type, status, criticality) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, name, code, location, type, status, criticality);
  return db.prepare('SELECT * FROM machines WHERE id = ?').get(id);
}

export function updateMachine(id, data) {
  const allowed = ['name', 'code', 'location', 'type', 'status', 'criticality'];
  const sets = []; const vals = [];
  for (const key of allowed) {
    if (data[key] !== undefined) { sets.push(`${key} = ?`); vals.push(data[key]); }
  }
  if (!sets.length) return;
  vals.push(id);
  db.prepare(`UPDATE machines SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
}

export function deleteMachine(id) {
  db.prepare('UPDATE machines SET is_deleted = 1 WHERE id = ?').run(id);
}

// ─────────────────────────────────────────────────────────────────────────────
// FAULT CATEGORY & TYPE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
export function getAllFaultCategories() {
  return db.prepare('SELECT * FROM fault_categories WHERE is_active = 1 ORDER BY name ASC').all();
}

export function createFaultCategory(data) {
  const { id, name, description = '' } = data;
  db.prepare('INSERT INTO fault_categories (id, name, description) VALUES (?, ?, ?)').run(id, name, description);
  return db.prepare('SELECT * FROM fault_categories WHERE id = ?').get(id);
}

export function updateFaultCategory(id, data) {
  const { name, description } = data;
  db.prepare('UPDATE fault_categories SET name = ?, description = ? WHERE id = ?').run(name, description, id);
}

export function deleteFaultCategory(id) {
  const typeCount = db.prepare('SELECT COUNT(*) as count FROM fault_types WHERE category_id = ?').get(id).count;
  if (typeCount > 0) throw new Error('Cannot delete: category has fault types. Remove fault types first.');
  db.prepare('UPDATE fault_categories SET is_active = 0 WHERE id = ?').run(id);
}

export function getFaultTypesByCategory(categoryId) {
  return db.prepare('SELECT * FROM fault_types WHERE category_id = ? AND is_active = 1 ORDER BY name ASC').all(categoryId);
}

export function createFaultType(data) {
  const { id, category_id, name, default_priority = 'Medium' } = data;
  db.prepare('INSERT INTO fault_types (id, category_id, name, default_priority) VALUES (?, ?, ?, ?)').run(id, category_id, name, default_priority);
  return db.prepare('SELECT * FROM fault_types WHERE id = ?').get(id);
}

export function updateFaultType(id, data) {
  const { name, default_priority } = data;
  db.prepare('UPDATE fault_types SET name = ?, default_priority = ? WHERE id = ?').run(name, default_priority, id);
}

export function deleteFaultType(id) {
  db.prepare('UPDATE fault_types SET is_active = 0 WHERE id = ?').run(id);
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPARTMENT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
export function getAllDepartments() {
  return db.prepare('SELECT * FROM departments WHERE is_active = 1 ORDER BY name ASC').all();
}

export function createDepartment(data) {
  const { id, name, description = '' } = data;
  db.prepare('INSERT INTO departments (id, name, description) VALUES (?, ?, ?)').run(id, name, description);
  return db.prepare('SELECT * FROM departments WHERE id = ?').get(id);
}

export function updateDepartment(id, data) {
  const { name, description } = data;
  db.prepare('UPDATE departments SET name = ?, description = ? WHERE id = ?').run(name, description, id);
}

export function deleteDepartment(id) {
  db.prepare('UPDATE departments SET is_active = 0 WHERE id = ?').run(id);
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
export function getAllSettings() {
  return db.prepare('SELECT * FROM system_settings ORDER BY setting_key ASC').all();
}

export function upsertSetting(key, value, description = '') {
  db.prepare(`INSERT INTO system_settings (setting_key, setting_value, description, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = excluded.updated_at`
  ).run(key, value, description);
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────
export function getAuditLogs({ page = 1, limit = 30, search = '' } = {}) {
  const offset = (Number(page) - 1) * Number(limit);
  const where = search ? 'WHERE user_employee_id LIKE ? OR action LIKE ? OR entity_type LIKE ?' : '';
  const params = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
  const total = db.prepare(`SELECT COUNT(*) as count FROM audit_logs ${where}`).get(...params).count;
  const totalPages = Math.ceil(total / Number(limit)) || 1;
  const rows = db.prepare(`SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, Number(limit), offset);
  return { logs: rows, total, totalPages, page: Number(page) };
}
