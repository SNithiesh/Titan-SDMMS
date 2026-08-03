# TITAN INDUSTRIES SDMMS - SMART DIGITAL MAINTENANCE MANAGEMENT SYSTEM

## Project Overview
Digital Maintenance Management System (SDMMS) developed for **Titan Industries Pvt. Ltd.**, specifically for the **Back Cover Department** (Friction Presses, Hydraulic Presses, Crank Presses).

Replaces manual breakdown reporting phone calls with a responsive Progressive Web App (PWA) featuring real-time type-ahead fault search, direct machine catalog selection, role-based authentication, and live food-delivery-style status tracking.

---

## Key Features
- **Role-Based Access Control (RBAC):** Authenticated logins for Operators, Mechanical Maintenance, Electrical Maintenance, Automation Engineers, and Supervisors.
- **Machine Catalog (20 Assets):** Direct visual grid selection for 15 Friction Presses, 3 Hydraulic Presses, and 2 Crank Presses with type filter chips.
- **Real-Time Fault Option Search Bar:** Instant type-ahead filtering for over 50+ fault options across 8 categories (Press `/' to search).
- **Live Status Timeline Tracker:** Timestamped delivery-style tracker (`Submitted ➔ Assigned ➔ Accepted ➔ Repair Started ➔ Completed ➔ Verified & Closed`).
- **Supervisor Dashboard & Analytics:** Real-time KPI summary cards (MTTR, MTBF), technician assignment, verification closure, and Recharts failure distribution graphs.
- **Cross-Platform PWA Support:** Fully responsive touch UI for mobile smartphones and dual-pane layout for widescreen desktop laptops. Can be installed as a Progressive Web App (PWA).

---

## Tech Stack
- **Frontend:** React 19, Vite v8, Tailwind CSS v4, Lucide React Icons, Recharts
- **Database Architecture:** Cloud Serverless Ready (Supabase / Firebase)
- **Deployment:** Progressive Web App (PWA) / Node.js Express Server

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Build Production Bundle
```bash
npm run build
```

---

## Machine Master Roster (Back Cover Dept)
- **Friction Press (15 Machines):** 6036001, 6036002, 6036003, 6036004, 6036005, 6036006, 6036007, 6035002, 6038004, 6036008, 6036009, 6036010, 6038003, 6035001, 6038005
- **Hydraulic Press (3 Machines):** 6050005, 6050001, 6036001
- **Crank Press (2 Machines):** 6049004, 6049002

---

## License & Copyright
Developed for **Titan Industries Pvt. Ltd.** - Back Cover Department.
