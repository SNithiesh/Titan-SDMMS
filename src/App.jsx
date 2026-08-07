import React, { useState, useEffect } from 'react';
import { INITIAL_COMPLAINTS } from './mockData';
import LoginModal from './components/LoginModal';
import ComplaintForm from './components/ComplaintForm';
import LiveTimeline from './components/LiveTimeline';
import TechnicianDashboard from './components/TechnicianDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AdminLayout from './components/admin/AdminLayout';
import HistoryView from './components/HistoryView';
import { Wrench, Shield, User, BarChart3, LogOut, Activity, History, Database, Sun, Moon, Clock, Download, CheckCircle2, Users, Settings } from 'lucide-react';
import { useAuth } from './context/AuthContext.jsx';
import { useTheme } from './context/ThemeContext.jsx';
import { fetchComplaints, createComplaint, assignTechnician, acceptJob, startRepair, completeRepair, verifyAndClose } from './api/complaint.api.js';
import { initRealtimeClient, subscribeToRealtimeComplaints } from './services/realtimeClient.js';
import { requestNotificationPermission, sendAlertNotification } from './services/notificationService';
import NotificationCenter from './components/NotificationCenter';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="hidden sm:flex items-center gap-2 bg-[var(--bg-app)] border border-[var(--border-strong)] px-2 py-1 rounded-sm text-[var(--status-info)]">
      <Clock className="w-3.5 h-3.5" />
      <span className="text-[10px] font-mono font-bold">{time.toLocaleString()}</span>
    </div>
  );
}

export default function App() {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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

  // ── PWA INSTALL PROMPT ──
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches
  );
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredInstallPrompt(e); };
    const installedHandler = () => setIsAppInstalled(true);
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);
  const handleInstallApp = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') setIsAppInstalled(true);
      setDeferredInstallPrompt(null);
    } else {
      // Show manual install guide for iOS / non-prompt browsers
      setShowInstallGuide(true);
    }
  };

  // When user logs in, set correct default role
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'Technician') setCurrentRole('Technician');
      else if (currentUser.role === 'Supervisor' || currentUser.role === 'Admin') setCurrentRole('Supervisor');
      else setCurrentRole('Operator');
      requestNotificationPermission();
      initRealtimeClient(currentUser.role);
    }
  }, [currentUser]);

  // Load complaints via Express API
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
        console.warn('[APP] Backend not reachable, using local data:', err.message);
        setIsLiveDatabase(false);
      }
    }
    loadData();

    const unsubscribe = subscribeToRealtimeComplaints((payload) => {
      loadData();
      if (payload?.eventType === 'INSERT') {
        const r = payload.new;
        sendAlertNotification({
          title: `BREAKDOWN: ${r.machine_name}`,
          message: `${r.fault_name}`,
          priority: r.priority
        });
        setRecentNotification(`Alert: ${r.machine_name} - ${r.fault_name}`);
        setTimeout(() => setRecentNotification(null), 8000);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    if (user.role === 'Technician') setCurrentRole('Technician');
    else if (user.role === 'Supervisor' || user.role === 'Admin') setCurrentRole('Supervisor');
    else setCurrentRole('Operator');
  };

  const handleAddComplaint = async (newCmp) => {
    // Ensure correct DB field name for optimistic update
    const complaintToSave = { ...newCmp, createdTime: newCmp.timestamp || new Date().toISOString() };
    setComplaints(prev => [complaintToSave, ...prev]);
    setSelectedComplaintId(complaintToSave.id);
    setActiveTab('active');

    sendAlertNotification({
      title: `BREAKDOWN: ${newCmp.machineName}`,
      message: `${newCmp.faultName}`,
      priority: newCmp.priority
    });

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
    setComplaints(prev => prev?.map(c => c.id === complaintId ? { ...c, ...updatedFields } : c));
    try {
      const { status } = updatedFields;
      if (status === 'Assigned') await assignTechnician(complaintId, updatedFields.assignedTechnician, updatedFields.assignedTechnician);
      else if (status === 'Accepted') await acceptJob(complaintId);
      else if (status === 'Repair Started') await startRepair(complaintId);
      else if (status === 'Completed') await completeRepair(complaintId, updatedFields.remarks, updatedFields.partsChanged);
      else if (status === 'Closed') await verifyAndClose(complaintId);
    } catch (err) {
      console.warn('[APP] Status update failed:', err.message);
    }
  };

  const handleAssignTechnician = (complaintId, technicianName) => {
    handleUpdateStatus(complaintId, { 
      status: 'Assigned', 
      assignedTechnician: technicianName,
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

  // Define navigation items based on role
  const navItems = [];
  if (currentUser.role === 'Operator') {
    navItems.push({ id: 'Operator', label: 'Operator HMI', icon: User });
  } else if (currentUser.role === 'Technician') {
    navItems.push({ id: 'Technician', label: 'Tech Station', icon: Wrench });
  } else if (currentUser.role === 'Supervisor' || currentUser.role === 'Admin') {
    navItems.push(
      { id: 'Supervisor', label: 'Command Center', icon: Shield },
      { id: 'History', label: 'Audit Log', icon: History },
      { id: 'Analytics', label: 'Plant Analytics', icon: BarChart3 }
    );
    
    if (currentUser.role === 'Admin') {
      navItems.push({ id: 'ERP', label: 'ERP Administration', icon: Settings });
    }
  }

  return (
    <div className="flex h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans antialiased overflow-hidden">
      
      {/* ── ALERTS (Fixed Top Right) ── */}
      {recentNotification && (
        <div className="fixed top-12 right-4 bg-[#E81123] text-white font-bold text-xs py-2 px-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center gap-2 z-50 border border-[var(--border-strong)] rounded-sm">
          <Activity className="w-4 h-4 animate-spin" />
          <span>{recentNotification}</span>
        </div>
      )}

      {/* ── PWA INSTALL GUIDE MODAL ── */}
      {showInstallGuide && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowInstallGuide(false)}>
          <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] w-full max-w-sm shadow-2xl rounded-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-strong)]">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[var(--status-info)]" />
                <span className="text-sm font-bold uppercase tracking-wide">Install TITAN SDMMS</span>
              </div>
              <button onClick={() => setShowInstallGuide(false)} className="text-[var(--text-secondary)] hover:text-white text-lg leading-none">✕</button>
            </div>
            <div className="p-4 space-y-4 text-xs">
              <div className="bg-[var(--bg-app)] border border-[var(--border-strong)] p-3 rounded-sm">
                <p className="font-bold text-[var(--status-info)] mb-1">📱 Android (Chrome)</p>
                <p className="text-[var(--text-secondary)]">Tap the <span className="font-bold text-white">⋮ menu</span> in the top-right corner → <span className="font-bold text-white">"Add to Home screen"</span> → Tap <span className="font-bold text-white">"Install"</span></p>
              </div>
              <div className="bg-[var(--bg-app)] border border-[var(--border-strong)] p-3 rounded-sm">
                <p className="font-bold text-[var(--status-warning)] mb-1">🍎 iPhone / iPad (Safari)</p>
                <p className="text-[var(--text-secondary)]">Tap the <span className="font-bold text-white">Share button (□↑)</span> at the bottom → Scroll down → Tap <span className="font-bold text-white">"Add to Home Screen"</span></p>
              </div>
              <div className="bg-[var(--bg-app)] border border-[var(--border-strong)] p-3 rounded-sm">
                <p className="font-bold text-[var(--status-ok)] mb-1">💻 Desktop (Chrome / Edge)</p>
                <p className="text-[var(--text-secondary)]">Look for the <span className="font-bold text-white">install icon (⊕)</span> in the browser address bar on the right side → Click it → Click <span className="font-bold text-white">"Install"</span></p>
              </div>
              <p className="text-[var(--text-muted)] text-center text-[10px]">Once installed, the app works offline and opens without a browser!</p>
            </div>
            <div className="px-4 pb-4">
              <button onClick={() => setShowInstallGuide(false)} className="w-full py-2 bg-[var(--status-info)] text-white text-xs font-bold rounded-sm hover:opacity-90">
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── LEFT SIDEBAR (Strict Industrial Layout) ── */}
      <aside className="w-60 bg-[var(--bg-panel)] border-r border-[var(--border-strong)] flex flex-col hidden md:flex shrink-0">
        <div className="h-12 flex items-center px-4 border-b border-[var(--border-strong)] bg-[var(--bg-panel)]">
          <Wrench className="w-4 h-4 text-[var(--status-info)] mr-2" />
          <span className="font-bold text-sm tracking-wide">TITAN SDMMS</span>
        </div>
        
        <div className="p-3 text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
          System Modules
        </div>
        
        <nav className="flex-1 px-2 space-y-0.5">
          {navItems?.map((item) => {
            const isSelected = currentRole === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentRole(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-sm transition-none ${
                  isSelected 
                    ? 'bg-[var(--bg-selected)] text-white border-l-2 border-[var(--status-info)]' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-panel-hover)] hover:text-white border-l-2 border-transparent'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isSelected ? 'text-[var(--status-info)]' : ''}`} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border-strong)] text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--text-secondary)]">User:</span>
            <span className="font-bold">{currentUser.employeeId}</span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-[var(--border-subtle)] hover:bg-[#E81123] hover:text-white text-[var(--text-secondary)] transition-colors rounded-sm text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            End Shift
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Context Bar */}
        <header className="h-12 bg-[var(--bg-panel)] border-b border-[var(--border-strong)] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide truncate">
              {currentRole} WORKSPACE
            </span>
            <span className="hidden sm:inline-block text-[10px] bg-[var(--border-subtle)] px-1.5 py-0.5 text-[var(--text-primary)]">
              BACK COVER DEPT
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <LiveClock />
            {/* PWA Install Button — always visible */}
            {isAppInstalled ? (
              <span className="flex items-center gap-1 text-[10px] text-[var(--status-ok)] font-bold">
                <CheckCircle2 className="w-3 h-3" /> App Installed
              </span>
            ) : (
              <button
                onClick={handleInstallApp}
                title="Install TITAN SDMMS as an App"
                className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold bg-[var(--status-info)] text-white hover:opacity-90 border border-[var(--status-info)] rounded-sm transition-opacity animate-pulse"
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}
            
            {/* Notification Center (For Supervisors/Admins only) */}
            {(currentRole === 'Supervisor' || currentRole === 'Admin') && (
              <NotificationCenter />
            )}

            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-1.5 rounded-sm bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--status-info)]"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="md:hidden flex items-center gap-2">
               <span className="text-xs font-bold text-[var(--text-primary)]">{currentUser.name}</span>
               <button onClick={logout} className="p-1 bg-[var(--border-subtle)] text-[var(--text-secondary)] rounded-sm">
                  <LogOut className="w-3.5 h-3.5" />
               </button>
            </div>
          </div>
        </header>

        {/* Dynamic Workspace Content */}
        <main className={`flex-1 overflow-auto bg-[var(--bg-app)] ${currentRole !== 'ERP' ? 'p-4' : ''}`}>
          {currentRole === 'Operator' && (
            <div className="space-y-4 max-w-7xl mx-auto h-full flex flex-col pb-16 md:pb-0">
              <div className="flex items-center gap-2 bg-[var(--bg-panel)] p-1.5 border border-[var(--border-strong)] overflow-x-auto whitespace-nowrap">
                <button
                  onClick={() => setActiveTab('raise')}
                  className={`px-4 py-1.5 text-xs font-bold transition-none ${activeTab === 'raise' ? 'bg-[var(--status-info)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'}`}
                >
                  Create Maintenance Request
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-1.5 text-xs font-bold transition-none ${activeTab === 'active' ? 'bg-[var(--status-info)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'}`}
                >
                  Active Requests [{complaints?.filter(c => c.status !== 'Closed').length}]
                </button>
              </div>

              {activeTab === 'raise' ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1 h-full min-h-0">
                  <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] overflow-auto">
                     <ComplaintForm onSubmitSuccess={handleAddComplaint} />
                  </div>
                  <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] overflow-auto">
                    <div className="px-4 py-2 border-b border-[var(--border-strong)] bg-[var(--bg-panel)] text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                      System Audit Trail
                    </div>
                    {selectedComplaint ? (
                      <div className="p-4"><LiveTimeline complaint={selectedComplaint} /></div>
                    ) : (
                      <div className="p-4 text-xs text-[var(--text-muted)]">No active selection.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-[var(--bg-panel)] border border-[var(--border-strong)] flex flex-col h-full min-h-0">
                  <div className="border-b border-[var(--border-strong)] bg-[var(--bg-panel)] p-2 flex gap-1 overflow-x-auto no-scrollbar">
                    {complaints?.filter(c => c.status !== 'Closed').map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedComplaintId(c.id)}
                        className={`px-3 py-1.5 text-xs text-left whitespace-nowrap border-l-2 ${
                          selectedComplaintId === c.id
                            ? 'bg-[var(--bg-selected)] border-[var(--status-info)] text-white font-bold'
                            : 'bg-[var(--bg-app)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
                        }`}
                      >
                        <div>{c.machineName}</div>
                        <div className="text-[10px] opacity-75">{c.status}</div>
                      </button>
                    ))}
                  </div>
                  <div className="p-4 overflow-auto flex-1">
                    {selectedComplaint && <LiveTimeline complaint={selectedComplaint} />}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentRole === 'Technician' && <TechnicianDashboard complaints={complaints} onUpdateStatus={handleUpdateStatus} />}
          {currentRole === 'Supervisor' && <SupervisorDashboard complaints={complaints} onAssignTechnician={handleAssignTechnician} onVerifyComplaint={handleVerifyComplaint} />}
          {currentRole === 'History' && <HistoryView complaints={complaints} />}
          {currentRole === 'Analytics' && <AnalyticsDashboard complaints={complaints} />}
          {currentRole === 'ERP' && <AdminLayout currentUser={currentUser} />}
        </main>

        {/* ── BOTTOM STATUS BAR ── */}
        <footer className="h-6 bg-[#0078D4] text-white flex items-center justify-between px-3 text-[10px] font-mono shrink-0 select-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Database className="w-3 h-3" />
              {isLiveDatabase ? 'DB: CONNECTED (SECURE)' : 'DB: OFFLINE (FALLBACK MODE)'}
            </span>
            <span>|</span>
            <span>PROTOCOL: JWT/HTTPS</span>
          </div>
          <div className="flex items-center gap-4">
            <span>CLIENT v2.0.1</span>
            <span>SYSTEM READY</span>
          </div>
        </footer>
      </div>

      {/* Mobile-only bottom nav for switching tabs if allowed */}
      {(currentUser.role === 'Supervisor' || currentUser.role === 'Admin') && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-panel)] border-t border-[var(--border-strong)] flex text-[10px] z-50 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.5)]">
          {navItems?.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentRole(item.id)}
              className={`flex-1 py-2 flex flex-col items-center justify-center font-bold ${
                currentRole === item.id ? 'bg-[var(--bg-selected)] text-[var(--status-info)] border-t-2 border-[var(--status-info)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              <item.icon className="w-4 h-4 mb-0.5" />
              {item.id}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
