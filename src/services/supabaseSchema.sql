-- ====================================================================
-- TITAN SDMMS - SUPABASE DATABASE SCHEMA DDL SCRIPT
-- Copy and paste this script into Supabase SQL Editor
-- (https://supabase.com -> Project -> SQL Editor)
-- ====================================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- 'Operator', 'Technician', 'Supervisor', 'Admin'
    department TEXT NOT NULL,
    discipline TEXT,
    password TEXT NOT NULL DEFAULT '123',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Machines Table
CREATE TABLE IF NOT EXISTS machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Friction Press', 'Hydraulic Press', 'Crank Press'
    status TEXT DEFAULT 'Operational',
    criticality TEXT DEFAULT 'High'
);

-- 3. Create Complaints Table (with Realtime enabled)
CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    machine_id TEXT REFERENCES machines(id),
    machine_name TEXT NOT NULL,
    operator_name TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'Back Cover Dept',
    shift TEXT NOT NULL DEFAULT 'Shift A',
    category_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    fault_name TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'High',
    description TEXT,
    status TEXT NOT NULL DEFAULT 'New', -- 'New', 'Assigned', 'Accepted', 'Repair Started', 'Completed', 'Closed'
    assigned_technician TEXT DEFAULT 'Unassigned',
    created_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    assigned_time TIMESTAMP WITH TIME ZONE,
    accepted_time TIMESTAMP WITH TIME ZONE,
    repair_started_time TIMESTAMP WITH TIME ZONE,
    completed_time TIMESTAMP WITH TIME ZONE,
    verified_time TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    parts_changed TEXT
);

-- Enable Realtime broadcasting on complaints table for instant alerts
ALTER PUBLICATION supabase_realtime ADD TABLE complaints;
