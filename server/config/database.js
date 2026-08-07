import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { INITIAL_COMPLAINTS, DEMO_USERS, FAULT_CATEGORIES, MACHINES } from '../../src/mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../database/sdmms.sqlite');

// Ensure database directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

export const db = new Database(dbPath, { verbose: null });

db.pragma('journal_mode = WAL'); // Better performance for SQLite

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT,
      discipline TEXT,
      password_hash TEXT NOT NULL,
      failed_attempts INTEGER DEFAULT 0,
      is_locked BOOLEAN DEFAULT 0,
      locked_until TEXT,
      last_login TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS machines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT,
      location TEXT,
      type TEXT,
      status TEXT,
      criticality TEXT
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      machine_id TEXT,
      machine_name TEXT,
      operator_name TEXT,
      employee_id TEXT,
      department TEXT,
      shift TEXT,
      category_id TEXT,
      category_name TEXT,
      fault_name TEXT,
      priority TEXT,
      description TEXT,
      status TEXT,
      assigned_technician TEXT,
      created_time TEXT,
      assigned_time TEXT,
      accepted_time TEXT,
      repair_started_time TEXT,
      completed_time TEXT,
      verified_time TEXT,
      remarks TEXT,
      parts_changed TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_employee_id TEXT,
      action TEXT,
      entity_type TEXT,
      entity_id TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS login_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT,
      success BOOLEAN,
      ip_address TEXT,
      user_agent TEXT,
      failure_reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id TEXT,
      title TEXT,
      message TEXT,
      priority TEXT,
      is_read BOOLEAN DEFAULT 0,
      read_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    /* =========================================
       ERP SYSTEM TABLES
       ========================================= */

    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS machine_categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fault_categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fault_types (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      default_priority TEXT DEFAULT 'Medium',
      is_active BOOLEAN DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(category_id) REFERENCES fault_categories(id)
    );

    CREATE TABLE IF NOT EXISTS priorities (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      level INTEGER NOT NULL,
      color_code TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS statuses (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      is_terminal BOOLEAN DEFAULT 0,
      color_code TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed demo users if empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    console.log('[DB] Seeding initial users...');
    const insertUser = db.prepare(`
      INSERT INTO users (employee_id, name, role, department, discipline, password_hash)
      VALUES (@employeeId, @name, @role, @department, @discipline, @passwordHash)
    `);
    const insertMany = db.transaction((users) => {
      for (const u of users) {
        insertUser.run({
          employeeId: u.employeeId,
          name: u.name,
          role: u.role,
          department: u.department || null,
          discipline: u.discipline || null,
          // If mockData lacks a hash, use the bcrypt hash for '123'
          passwordHash: u.password_hash || '$2b$10$o79EEIYyJBrmzNpTbiu04u5rbCodc4U4rwcAjqPgH9ijePuLwfelW' 
        });
      }
    });
    insertMany(DEMO_USERS);
  }

  // Seed initial complaints if empty
  const complaintCount = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
  if (complaintCount === 0) {
    console.log('[DB] Seeding initial complaints...');
    const insertComplaint = db.prepare(`
      INSERT INTO complaints (
        id, machine_id, machine_name, operator_name, employee_id, department, shift,
        category_id, category_name, fault_name, priority, description, status,
        assigned_technician, created_time, assigned_time, accepted_time,
        repair_started_time, completed_time, verified_time, remarks, parts_changed
      ) VALUES (
        @id, @machineId, @machineName, @operatorName, @employeeId, @department, @shift,
        @categoryId, @categoryName, @faultName, @priority, @description, @status,
        @assignedTechnician, @createdTime, @assignedTime, @acceptedTime,
        @repairStartedTime, @completedTime, @verifiedTime, @remarks, @partsChanged
      )
    `);

    const insertMany = db.transaction((complaints) => {
      for (const c of complaints) {
        insertComplaint.run({
          id: c.id,
          machineId: c.machineId || null,
          machineName: c.machineName || null,
          operatorName: c.operatorName || null,
          employeeId: c.employeeId || null,
          department: c.department || null,
          shift: c.shift || null,
          categoryId: c.categoryId || null,
          categoryName: c.categoryName || null,
          faultName: c.faultName || null,
          priority: c.priority || null,
          description: c.description || null,
          status: c.status || null,
          assignedTechnician: c.assignedTechnician || null,
          createdTime: c.createdTime || null,
          assignedTime: c.assignedTime || null,
          acceptedTime: c.acceptedTime || null,
          repairStartedTime: c.repairStartedTime || null,
          completedTime: c.completedTime || null,
          verifiedTime: c.verifiedTime || null,
          remarks: c.remarks || null,
          partsChanged: c.partsChanged || null
        });
      }
    });
    insertMany(INITIAL_COMPLAINTS);
  }

  // Seed ERP base data (Priorities, Statuses, Departments)
  const priorityCount = db.prepare('SELECT COUNT(*) as count FROM priorities').get().count;
  if (priorityCount === 0) {
    console.log('[DB] Seeding ERP Master Data...');
    db.exec(`
      INSERT INTO priorities (id, name, level, color_code) VALUES 
      ('P1', 'Critical', 1, '#E81123'),
      ('P2', 'High', 2, '#D83B01'),
      ('P3', 'Medium', 3, '#0078D4'),
      ('P4', 'Low', 4, '#107C10');

      INSERT INTO statuses (id, name, is_terminal, color_code) VALUES 
      ('S1', 'New', 0, '#666666'),
      ('S2', 'Assigned', 0, '#0078D4'),
      ('S3', 'Accepted', 0, '#D83B01'),
      ('S4', 'Repair Started', 0, '#107C10'),
      ('S5', 'Completed', 0, '#0078D4'),
      ('S6', 'Closed', 1, '#107C10');

      INSERT INTO departments (id, name, description) VALUES 
      ('D1', 'Back Cover Dept', 'Main assembly line for back covers'),
      ('D2', 'Maintenance', 'General plant maintenance'),
      ('D3', 'Automation', 'Automation and robotics division'),
      ('D4', 'IT / Plant Admin', 'System administration');
    `);
  }

  // Seed Fault Categories & Types from FAULT_CATEGORIES
  const faultCatCount = db.prepare('SELECT COUNT(*) as count FROM fault_categories').get().count;
  if (faultCatCount === 0) {
    console.log('[DB] Seeding Fault Categories and Types...');
    const insertCat = db.prepare('INSERT INTO fault_categories (id, name, description) VALUES (?, ?, ?)');
    const insertType = db.prepare('INSERT INTO fault_types (id, category_id, name) VALUES (?, ?, ?)');
    
    db.transaction(() => {
      for (const cat of FAULT_CATEGORIES) {
        insertCat.run(cat.id, cat.name, cat.name + ' Faults');
        for (let i = 0; i < cat.faults.length; i++) {
          const f = cat.faults[i];
          insertType.run(f.id, cat.id, f.name);
        }
      }
    })();
  }
}

initializeDatabase();
