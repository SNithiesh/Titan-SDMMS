import React, { useState } from 'react';
import { Settings, Users, AlertTriangle, Building, LayoutDashboard, FileText, Activity, HardDrive } from 'lucide-react';
import DashboardOverview from './DashboardOverview';
import AdminDashboard from '../AdminDashboard';
import ComplaintManagement from './ComplaintManagement';
import MachineManagement from './MachineManagement';
import FaultManagement from './FaultManagement';
import MasterDataManagement from './MasterDataManagement';
import AuditLogView from './AuditLogView';

const adminModules = [
  { id: 'Overview',     label: 'Dashboard Overview',         icon: LayoutDashboard },
  { id: 'Users',        label: 'User & Role Mgmt',           icon: Users },
  { id: 'Complaints',   label: 'Complaint Management',        icon: FileText },
  { id: 'Machines',     label: 'Asset Management',           icon: HardDrive },
  { id: 'Faults',       label: 'Fault Configuration',        icon: AlertTriangle },
  { id: 'MasterData',   label: 'Master Data (Depts/Settings)',icon: Building },
  { id: 'AuditLog',     label: 'Audit Log Ledger',           icon: Activity },
];

export default function AdminLayout({ currentUser }) {
  const [activeModule, setActiveModule] = useState('Overview');

  if (currentUser?.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <AlertTriangle className="w-12 h-12 text-[#E81123] mx-auto mb-4" />
          <p className="text-[#E81123] font-bold text-sm uppercase">Access Denied</p>
          <p className="text-[var(--text-muted)] text-xs mt-1">This area is restricted to System Administrators only.</p>
        </div>
      </div>
    );
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'Overview':   return <DashboardOverview />;
      case 'Users':      return <AdminDashboard currentUser={currentUser} />;
      case 'Complaints': return <ComplaintManagement />;
      case 'Machines':   return <MachineManagement />;
      case 'Faults':     return <FaultManagement />;
      case 'MasterData': return <MasterDataManagement />;
      case 'AuditLog':   return <AuditLogView />;
      default:           return null;
    }
  };

  return (
    <div className="flex h-full w-full bg-[var(--bg-app)]">

      {/* Admin Sub-Navigation Sidebar */}
      <div className="w-56 bg-[var(--bg-panel)] border-r border-[var(--border-strong)] flex-col hidden md:flex shrink-0">
        <div className="p-4 border-b border-[var(--border-strong)] bg-[var(--bg-app)]">
          <h2 className="text-xs font-bold uppercase tracking-wide text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#D83B01]" />
            ERP Administration
          </h2>
          <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Full System Control</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {adminModules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold border-l-2 transition-none ${
                activeModule === mod.id
                  ? 'bg-[var(--bg-selected)] text-white border-[#D83B01]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-panel-hover)] hover:text-white border-transparent'
              }`}
            >
              <mod.icon className={`w-4 h-4 shrink-0 ${activeModule === mod.id ? 'text-[#D83B01]' : ''}`} />
              <span className="truncate">{mod.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-app)] overflow-auto p-4">
        {renderModule()}
      </div>
    </div>
  );
}
