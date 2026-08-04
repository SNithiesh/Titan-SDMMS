import React, { useState, useEffect } from 'react';
import { INITIAL_COMPLAINTS } from './mockData';
import LoginModal from './components/LoginModal';
import InstallPromptBar from './components/InstallPromptBar';
import ComplaintForm from './components/ComplaintForm';
import LiveTimeline from './components/LiveTimeline';
import TechnicianDashboard from './components/TechnicianDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import HistoryView from './components/HistoryView';
import { Wrench, Shield, User, BarChart3, LogOut, PlusCircle, Activity, History } from 'lucide-react';
import { useAuth } from './context/AuthContext.jsx';
import { fetchComplaints, createComplaint, assignTechnician, acceptJob, startRepair, completeRepair, verifyAndClose } from './api/complaint.api.js';
import { subscribeToRealtimeComplaints } from './services/supabaseClient.js';
import { requestNotificationPermission, sendAlertNotification } from './services/notificationService';

export default function App() {
  const { currentUser, logout } = useAuth();

  const [currentRole, setCurrentRole] = useState(() => {
    if (!currentUser) return 'Operator';
    if (currentUser.role === 'Technician') return 'Technician';
    if (currentUser.role === 'Supervisor' || currentUser.role === 'Admin') return 'Supervisor';
    return 'Operator';
  });

  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [isLiveDatabase, setIsLiveDatabase] = useState(false);
  const [activeTab, setActiveTab] = useState('raise');
  const [selectedComplaintId, setSelectedComplaintId] = useState(complaints[0]?.id || '');
  const [recentNotification, setRecentNotification] = useState(null);

  // When user logs in, set correct default role
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'Technician') setCurrentRole('Technician');
      else if (currentUser.role === 'Supervisor' || currentUser.role === 'Admin') setCurrentRole('Supervisor');
      else setCurrentRole('Operator');
      requestNotificationPermission();
    }
  }, [currentUser]);

  // Load complaints via Express API (authenticated)
  useEffect(() => {
    if (!currentUser) return;

    async function loadData() {
      try {
        const result = await fetchComplaints();
        if (result?.data?.complaints?.length > 0) {
          setComplaints(result.data.complaints);
          setSelectedComplaintId(result.data.complaints[0]?.id || '');
          setIsLiveDatabase(result.data.isLive !== false);
        }
      } catch (err) {
        // If API call fails (backend not running), use local data
        console.warn('[APP] Backend not reachable, using local data:', err.message);
        setIsLiveDatabase(false);
      }
    }
    loadData();

    // Keep real-time Supabase subscription for instant UI updates
    const unsubscribe = subscribeToRealtimeComplaints((payload) => {
      loadData();
      if (payload?.eventType === 'INSERT') {
        const r = payload.new;
        sendAlertNotification({
          title: `🚨 BREAKDOWN: ${r.machine_name}`,
          message: `${r.fault_name} reported by ${r.operator_name}`,
          priority: r.priority
        });
        setRecentNotification(`Alert: ${r.machine_name} - ${r.fault_name}`);
        setTimeout(() => setRecentNotification(null), 6000);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    if (user.role === 'Technician') setCurrentRole('Technician');
    else if (user.role === 'Supervisor' || user.role === 'Admin') setCurrentRole('Supervisor');
    else setCurrentRole('Operator');
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleAddComplaint = async (newCmp) => {
    setComplaints(prev => [newCmp, ...prev]);
    setSelectedComplaintId(newCmp.id);
    setActiveTab('active');

    sendAlertNotification({
      title: `🚨 BREAKDOWN ALERT: ${newCmp.machineName}`,
      message: `${newCmp.faultName} (Priority: ${newCmp.priority})`,
      priority: newCmp.priority
    });
    setRecentNotification(`🚨 Breakdown: ${newCmp.machineName} - ${newCmp.faultName}`);
    setTimeout(() => setRecentNotification(null), 6000);

    try {
      await createComplaint({
        machineId: newCmp.machineId,
        machineName: newCmp.machineName,
        categoryId: newCmp.categoryId,
        categoryName: newCmp.categoryName,
        faultName: newCmp.faultName,
        priority: newCmp.priority,
        shift: newCmp.shift,
        description: newCmp.description
      });
    } catch (err) {
      console.warn('[APP] Complaint save failed:', err.message);
    }
  };

  const handleUpdateStatus = async (complaintId, updatedFields) => {
    setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, ...updatedFields } : c));

    try {
      const { status } = updatedFields;
      if (status === 'Assigned') {
        await assignTechnician(complaintId, updatedFields.assignedTechnician, updatedFields.assignedTechnician);
      } else if (status === 'Accepted') {
        await acceptJob(complaintId);
      } else if (status === 'Repair Started') {
        await startRepair(complaintId);
      } else if (status === 'Completed') {
        await completeRepair(complaintId, updatedFields.remarks, updatedFields.partsChanged);
      } else if (status === 'Closed') {
        await verifyAndClose(complaintId);
      }
    } catch (err) {
      console.warn('[APP] Status update via API failed, saved locally:', err.message);
    }
  };

  const handleAssignTechnician = (complaintId, techName) => {
    handleUpdateStatus(complaintId, {
      assignedTechnician: techName,
      status: 'Assigned',
      assignedTime: new Date().toISOString()
    });
  };

  const handleVerifyComplaint = (complaintId) => {
    handleUpdateStatus(complaintId, {
      status: 'Closed',
      verifiedTime: new Date().toISOString()
    });
  };

  const selectedComplaint = complaints.find(c => c.id === selectedComplaintId) || complaints[0];

  if (!currentUser) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-20 md:pb-6">
      <InstallPromptBar />

      {recentNotification && (
        <div className="bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs py-2 px-4 text-center shadow-lg animate-pulse flex items-center justify-center gap-2 z-50">
          <Activity className="w-4 h-4 animate-spin" />
          <span>{recentNotification}</span>
        </div>
      )}

      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">TITAN SDMMS</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-blue-400">
                  BACK COVER DEPT
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border flex items-center gap-1 ${
                  isLiveDatabase
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                    : 'bg-amber-950/80 border-amber-700 text-amber-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLiveDatabase ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  {isLiveDatabase ? 'LIVE DB' : 'DEMO MODE'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Smart Digital Maintenance Management System v2.0</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {currentUser.role === 'Operator' && (
              <span className="px-3 py-1.5 rounded-md font-bold text-white bg-blue-600 shadow-sm flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Operator Workspace
              </span>
            )}
            {currentUser.role === 'Technician' && (
              <span className="px-3 py-1.5 rounded-md font-bold text-white bg-blue-600 shadow-sm flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" /> Technician Dashboard
              </span>
            )}
            {(currentUser.role === 'Supervisor' || currentUser.role === 'Admin') && [
              { role: 'Supervisor', icon: Shield },
              { role: 'History', icon: History },
              { role: 'Analytics', icon: BarChart3 }
            ].map(({ role, icon: Icon }) => (
              <button
                key={role}
                onClick={() => setCurrentRole(role)}
                className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                  currentRole === role
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {role}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="text-right text-xs">
              <div className="font-bold text-slate-200">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400">{currentUser.role} ({currentUser.employeeId})</div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 transition-colors border border-slate-700"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-5">
        {currentRole === 'Operator' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('raise')}
                  className={`px-3.5 py-1.5 rounded-md font-bold transition-all ${activeTab === 'raise' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  + Raise Complaint
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-3.5 py-1.5 rounded-md font-bold transition-all ${activeTab === 'active' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  Track Active ({complaints.filter(c => c.status !== 'Closed').length})
                </button>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">Active Line: <strong>20 Machines</strong></span>
            </div>

            {activeTab === 'raise' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-7">
                  <ComplaintForm onSubmitSuccess={handleAddComplaint} />
                </div>
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Active Complaint Timeline</h3>
                  {selectedComplaint ? (
                    <LiveTimeline complaint={selectedComplaint} />
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
                      No active complaints selected.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {complaints.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedComplaintId(c.id)}
                      className={`px-3 py-2 rounded-lg text-xs border text-left flex-shrink-0 transition-all ${
                        selectedComplaintId === c.id
                          ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>{c.machineName}</div>
                      <div className="text-[10px] text-slate-400">{c.faultName} ({c.status})</div>
                    </button>
                  ))}
                </div>
                {selectedComplaint && <LiveTimeline complaint={selectedComplaint} />}
              </div>
            )}
          </div>
        )}

        {currentRole === 'Technician' && (
          <TechnicianDashboard complaints={complaints} onUpdateStatus={handleUpdateStatus} />
        )}

        {currentRole === 'Supervisor' && (
          <SupervisorDashboard
            complaints={complaints}
            onAssignTechnician={handleAssignTechnician}
            onVerifyComplaint={handleVerifyComplaint}
          />
        )}

        {currentRole === 'History' && <HistoryView complaints={complaints} />}
        {currentRole === 'Analytics' && <AnalyticsDashboard complaints={complaints} />}
      </main>

      {/* Mobile Bottom Navigation (Only for Supervisors/Admins who need to switch tabs) */}
      {(currentUser.role === 'Supervisor' || currentUser.role === 'Admin') && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg px-1 py-1.5 z-50">
          <div className="grid grid-cols-3 gap-0.5 text-center">
            {[
              { role: 'Supervisor', label: 'Supervisor', icon: Shield },
              { role: 'History', label: 'History', icon: History },
              { role: 'Analytics', label: 'Analytics', icon: BarChart3 }
            ].map(({ role, label, icon: Icon }) => (
              <button
                key={role}
                onClick={() => setCurrentRole(role)}
                className={`py-1 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all ${
                  currentRole === role ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                {label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
