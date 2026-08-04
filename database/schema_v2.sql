-- =====================================================
-- TITAN SDMMS ENTERPRISE DATABASE SCHEMA V2
-- Version 2.0 | Titan Industries Pvt. Ltd.
-- =====================================================

-- 1. Users Table (with security fields)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Operator','Technician','Supervisor','Admin')),
    department TEXT NOT NULL DEFAULT 'Back Cover Dept',
    discipline TEXT,
    password_hash TEXT NOT NULL,            -- bcrypt hash, NEVER plain text
    failed_attempts INTEGER DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Machines Table
CREATE TABLE IF NOT EXISTS machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    location TEXT NOT NULL DEFAULT 'Back Cover Line',
    type TEXT NOT NULL CHECK (type IN ('Friction Press','Hydraulic Press','Crank Press')),
    status TEXT DEFAULT 'Operational' CHECK (status IN ('Operational','Under Maintenance','Breakdown')),
    criticality TEXT DEFAULT 'High' CHECK (criticality IN ('Low','Medium','High','Critical')),
    last_breakdown TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Complaints Table (core workflow)
CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    machine_id TEXT REFERENCES machines(id),
    operator_employee_id TEXT NOT NULL REFERENCES users(employee_id),
    assigned_technician_id TEXT REFERENCES users(employee_id),
    department TEXT NOT NULL DEFAULT 'Back Cover Dept',
    shift TEXT NOT NULL DEFAULT 'Shift A',
    category_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    fault_name TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'High' CHECK (priority IN ('Low','Medium','High','Critical')),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'New' CHECK (
        status IN ('New','Assigned','Accepted','Repair Started','Completed','Closed','Rejected')
    ),
    created_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_time TIMESTAMP WITH TIME ZONE,
    accepted_time TIMESTAMP WITH TIME ZONE,
    repair_started_time TIMESTAMP WITH TIME ZONE,
    completed_time TIMESTAMP WITH TIME ZONE,
    verified_time TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    parts_changed TEXT
);

-- 4. Complaint History (full audit trail of status changes)
CREATE TABLE IF NOT EXISTS complaint_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id TEXT NOT NULL REFERENCES complaints(id),
    changed_by_employee_id TEXT NOT NULL REFERENCES users(employee_id),
    old_status TEXT,
    new_status TEXT NOT NULL,
    notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Attachments (complaint photos)
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id TEXT NOT NULL REFERENCES complaints(id),
    uploaded_by_id TEXT NOT NULL REFERENCES users(employee_id),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('breakdown_photo','completion_photo')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_employee_id TEXT NOT NULL REFERENCES users(employee_id),
    complaint_id TEXT REFERENCES complaints(id),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Audit Logs (security trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_employee_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Login History
CREATE TABLE IF NOT EXISTS login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    failure_reason TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_machine ON complaints(machine_id);
CREATE INDEX IF NOT EXISTS idx_complaints_technician ON complaints(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON complaints(created_time DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_employee_id, is_read);

-- Enable Realtime
-- ALTER PUBLICATION supabase_realtime ADD TABLE complaints;
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
