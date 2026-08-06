import React, { useState } from 'react';
import { Wrench, X, ChevronDown, ChevronUp, FileText, Clock, AlertTriangle, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function TechnicianDashboard({ complaints, onUpdateStatus }) {
  const { currentUser } = useAuth();
  
  // States
  const [modalTask, setModalTask] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [partsChanged, setPartsChanged] = useState('');
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Filter active tasks for this technician
  const myTasks = complaints?.filter(
    (c) => c.status !== 'Closed' && (c.assignedTechnician === currentUser?.name || c.status === 'Open')
  );

  // Get history from REAL complaints data
  const getMachineHistory = (machineId, currentTaskId) => {
    return complaints
      .filter(c => c.machineId === machineId && c.id !== currentTaskId && (c.status === 'Completed' || c.status === 'Closed'))
      .sort((a, b) => new Date(b.createdTime || 0) - new Date(a.createdTime || 0))
      .slice(0, 3); // Get last 3
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-[#E81123] drop-shadow-[0_0_8px_rgba(232,17,35,0.5)]';
      case 'High': return 'text-[#D83B01]';
      case 'Medium': return 'text-[var(--status-info)]';
      default: return 'text-[#107C10]';
    }
  };

  const renderStatusStepper = (status) => {
    const steps = ['Assigned', 'Accepted', 'Repair Started', 'Completed'];
    const currentIndex = steps.indexOf(status) === -1 ? 0 : steps.indexOf(status);

    return (
      <div className="flex items-center justify-center gap-1">
        {steps?.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          let colorClass = 'bg-[var(--text-muted)] opacity-20';
          if (isCompleted) colorClass = 'bg-[#107C10]';
          if (isActive && step === 'Repair Started') colorClass = 'bg-[#D83B01] animate-pulse shadow-[0_0_8px_rgba(216,59,1,0.8)]';
          else if (isActive) colorClass = 'bg-[var(--status-info)] shadow-[0_0_5px_rgba(0,120,212,0.5)]';

          return (
            <div key={step} className="flex flex-col items-center group relative">
              <div className={`h-1.5 w-6 rounded-full transition-all duration-300 ${colorClass}`} title={step}></div>
              {isActive && <div className="text-[8px] font-bold uppercase mt-1 tracking-tighter text-[var(--text-primary)] absolute top-2 whitespace-nowrap">{step}</div>}
            </div>
          );
        })}
      </div>
    );
  };

  const handleCompleteSubmit = (e) => {
    e.preventDefault();
    if (!remarks.trim()) return;
    
    onUpdateStatus(modalTask.id, { 
      status: 'Completed', 
      completedTime: new Date().toISOString(),
      remarks,
      partsChanged: partsChanged || 'None'
    });
    
    setModalTask(null);
    setRemarks('');
    setPartsChanged('');
  };

  const renderActionButtons = (task) => {
    if (task.status === 'Assigned') {
      return (
        <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(task.id, { status: 'Accepted', acceptedTime: new Date().toISOString() }); }} className="w-full py-1.5 px-3 bg-[var(--status-info)] hover:bg-[#004A99] text-white text-[10px] font-bold border border-[var(--status-info)] uppercase transition-colors">
          Accept Job
        </button>
      );
    }
    if (task.status === 'Accepted') {
      return (
        <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(task.id, { status: 'Repair Started', repairStartedTime: new Date().toISOString() }); }} className="w-full py-1.5 px-3 bg-[#107C10] hover:bg-[#0B5A0B] text-white text-[10px] font-bold border border-[#107C10] uppercase transition-colors">
          Start Repair
        </button>
      );
    }
    if (task.status === 'Repair Started') {
      return (
        <button onClick={(e) => { e.stopPropagation(); setModalTask(task); setRemarks(''); setPartsChanged(''); }} className="w-full py-1.5 px-3 bg-[#D83B01] hover:bg-[#B33101] text-white text-[10px] font-bold border border-[#D83B01] uppercase transition-colors shadow-[0_0_10px_rgba(216,59,1,0.4)]">
          Mark Completed
        </button>
      );
    }
    if (task.status === 'Completed') {
        return <div className="w-full text-center py-1.5 px-3 text-[10px] font-bold text-[var(--text-muted)] border border-[var(--text-muted)]/20 bg-[var(--bg-app)]">VERIFY PENDING</div>;
    }
    return <span className="text-[10px] text-[var(--text-muted)] uppercase">No Action</span>;
  };

  const quickActions = [
    "Cleaned Sensors",
    "Replaced O-Ring",
    "Tightened Belt",
    "Lubricated Bearings",
    "Reset Calibration",
    "Replaced Fuse",
    "Cleared Jam"
  ];

  const handleQuickAction = (action) => {
    setRemarks(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return action + ". ";
      if (trimmed.includes(action)) return prev;
      return trimmed + (trimmed.endsWith(".") ? " " : ". ") + action + ". ";
    });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] relative">
      <div className="flex items-center justify-between p-3 bg-[var(--bg-panel)] border-b border-[var(--border-strong)]">
        <h1 className="text-sm font-bold uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--status-info)] animate-pulse" />
          Live Technician Terminal
        </h1>
        <div className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-app)] px-2 py-1 border border-[var(--border-strong)] shadow-inner">
          ACTIVE TASKS: {myTasks.length}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto bg-[var(--bg-panel)] p-2 pb-16 md:pb-2">
        <div className="border border-[var(--border-strong)] h-full flex flex-col min-w-[900px]">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="sticky top-0 bg-[var(--bg-panel)] z-10 shadow-sm">
              <tr>
                <th className="py-2.5 px-2 w-8 border-b border-[var(--border-strong)]"></th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)] w-20">ID</th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)] w-48">Machine Asset</th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)]">Fault Telemetry</th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)] w-24">Priority</th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)] w-32 text-center">Pipeline</th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)] w-28 text-center">SLA Time</th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)] w-36 text-center">Execution</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bg-app)]">
              {myTasks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-[var(--text-muted)] border-b border-[var(--border-strong)]">
                    <div className="flex flex-col items-center justify-center">
                      <Wrench className="w-8 h-8 mb-2 opacity-30 text-[var(--text-secondary)]" />
                      <span className="text-xs font-bold uppercase tracking-wider">No Tasks Assigned. System Idle.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                myTasks?.map((task) => {
                  const activeMinutes = task.createdTime ? Math.round((new Date() - new Date(task.createdTime)) / 60000) : 0;
                  const isSlaBreached = activeMinutes > 60 && task.status !== 'Completed';
                  const isExpanded = expandedRowId === task.id;

                  return (
                    <React.Fragment key={task.id}>
                      <tr 
                        className={`border-b border-[var(--border-subtle)] transition-colors group cursor-pointer ${isExpanded ? 'bg-[var(--bg-panel-hover)]' : 'hover:bg-[var(--bg-panel-hover)]'}`}
                        onClick={() => setExpandedRowId(isExpanded ? null : task.id)}
                      >
                        <td className="py-3 px-2 text-center">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />}
                        </td>
                        <td className="py-3 px-3 text-xs font-mono text-[var(--text-secondary)]">{task.id}</td>
                        <td className="py-3 px-3">
                            <div className="text-xs font-bold text-[var(--text-primary)] truncate">{task.machineName}</div>
                            <div className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">{task.machineId}</div>
                        </td>
                        <td className="py-3 px-3">
                            <div className="text-xs font-bold text-[var(--text-primary)]">{task.faultName}</div>
                            <div className="text-[9px] text-[var(--text-muted)] uppercase mt-1">By {task.operatorName}</div>
                        </td>
                        <td className={`py-3 px-3 text-xs font-bold ${getPriorityColor(task.priority)}`}>{task.priority}</td>
                        <td className="py-3 px-3 align-middle h-14">
                            {renderStatusStepper(task.status)}
                        </td>
                        <td className="py-3 px-3 text-center align-middle">
                          <div className={`text-xs font-mono font-bold flex flex-col items-center justify-center ${isSlaBreached ? 'text-[#E81123] animate-pulse drop-shadow-[0_0_5px_rgba(232,17,35,0.8)]' : 'text-[#D83B01]'}`}>
                            {isSlaBreached && <AlertTriangle className="w-3 h-3 mb-0.5" />}
                            {activeMinutes}m
                          </div>
                        </td>
                        <td className="py-3 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
                            {renderActionButtons(task)}
                        </td>
                      </tr>

                      {/* Expandable History Drawer */}
                      {isExpanded && (
                        <tr className="bg-[var(--bg-panel)] border-b border-[var(--border-strong)] shadow-inner">
                          <td colSpan="8" className="p-0">
                            <div className="p-4 border-l-4 border-[var(--status-info)] ml-4 my-2 bg-[var(--bg-app)]">
                              <div className="flex items-center gap-2 mb-3">
                                <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
                                <h3 className="text-xs font-bold uppercase text-[var(--text-primary)]">Historical Telemetry: {task.machineName}</h3>
                              </div>
                              
                              {getMachineHistory(task.machineId, task.id).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {getMachineHistory(task.machineId, task.id).map(history => (
                                    <div key={history.id} className="border border-[var(--border-subtle)] p-2 bg-[var(--bg-panel)]">
                                      <div className="text-[10px] font-mono text-[var(--text-muted)] mb-1">
                                        {new Date(history.createdTime).toLocaleDateString()} - {history.id}
                                      </div>
                                      <div className="text-[11px] font-bold text-[var(--text-primary)]">{history.faultName}</div>
                                      <div className="mt-2 text-[10px] text-[var(--text-secondary)] border-l-2 border-[#107C10] pl-1 italic">
                                        "{history.remarks}"
                                      </div>
                                      {history.partsChanged && history.partsChanged !== 'None' && (
                                        <div className="mt-1 text-[9px] text-[#D83B01] font-mono uppercase">
                                          Parts: {history.partsChanged}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-[var(--text-muted)] italic">No recent failure history found for this asset.</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completion Modal Overlay */}
      {modalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] shadow-2xl w-full max-w-4xl flex flex-col shadow-[0_0_40px_rgba(216,59,1,0.2)] relative overflow-hidden max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#D83B01]"></div>
            
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-strong)] bg-[#111] bg-opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#D83B01]" />
                Execute Work Order
              </h2>
              <button onClick={() => setModalTask(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* LEFT COLUMN: Context & History Engine */}
              <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-[var(--border-strong)] flex flex-col bg-[var(--bg-app)] overflow-y-auto">
                <div className="p-4 flex-1">
                  <div className="mb-4">
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-1">Target Asset</div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{modalTask.machineName}</div>
                    <div className="text-[10px] font-mono text-[var(--text-muted)] flex justify-between items-center mt-1">
                      <span>ID: {modalTask.machineId}</span>
                      <button type="button" className="text-[#004A99] hover:text-[#0078D4] flex items-center gap-1 font-bold uppercase transition-colors">
                        <FileText className="w-3 h-3" /> SOP
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider flex items-center gap-1.5 mb-2 border-b border-[var(--border-strong)] pb-1">
                      <Clock className="w-3 h-3 text-[#D83B01]" />
                      Historical Telemetry (Last 3)
                    </div>
                    {getMachineHistory(modalTask.machineId, modalTask.id).length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {getMachineHistory(modalTask.machineId, modalTask.id).map(history => (
                          <div key={history.id} className="border border-[var(--border-subtle)] p-2 bg-[var(--bg-panel)] relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#107C10] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex justify-between items-start pl-2">
                              <div>
                                <div className="text-[10px] font-bold text-[var(--text-primary)] truncate max-w-[150px]">{history.faultName}</div>
                                <div className="text-[9px] text-[var(--text-muted)] italic mt-1 leading-tight line-clamp-2">"{history.remarks}"</div>
                              </div>
                              <div className="text-[9px] font-mono text-[var(--text-muted)] text-right">
                                {new Date(history.createdTime).toLocaleDateString()}<br/>
                                <span className="text-[var(--text-secondary)]">{history.id}</span>
                              </div>
                            </div>
                            {history.partsChanged && history.partsChanged !== 'None' && (
                              <div className="mt-1.5 pl-2 text-[9px] text-[#D83B01] font-mono uppercase font-bold">
                                Parts: {history.partsChanged}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-[var(--text-muted)] italic py-2">No recent failure history found for this asset.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Input Forms & Quick Actions */}
              <div className="w-full md:w-7/12 flex flex-col bg-[var(--bg-panel)] overflow-y-auto">
                <form onSubmit={handleCompleteSubmit} className="p-4 flex flex-col h-full">
                  
                  <div className="mb-5">
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Smart Suggestions (Tap to Auto-fill)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {quickActions?.map(action => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => handleQuickAction(action)}
                          className="px-2 py-1 text-[10px] font-bold uppercase border border-[var(--border-strong)] bg-[var(--bg-app)] text-[var(--text-secondary)] hover:border-[#D83B01] hover:text-[#D83B01] transition-colors rounded-sm"
                        >
                          + {action}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col min-h-[150px] mb-4">
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase mb-1">
                      Root Cause & Resolution <span className="text-[#E81123]">*</span>
                    </label>
                    <textarea
                      required
                      placeholder="Describe exactly what was fixed..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="flex-1 w-full p-3 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs focus:border-[#D83B01] focus:ring-1 focus:ring-[#D83B01] outline-none resize-none transition-all"
                    ></textarea>
                  </div>

                  <div className="mb-2">
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase mb-1">
                      Parts Replaced (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1x O-Ring (Leave blank if none)"
                      value={partsChanged}
                      onChange={(e) => setPartsChanged(e.target.value)}
                      className="w-full p-2.5 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs focus:border-[#D83B01] focus:ring-1 focus:ring-[#D83B01] outline-none transition-all"
                    />
                  </div>

                  <div className="mt-4 pt-4 border-t border-[var(--border-strong)] flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={() => setModalTask(null)} className="px-5 py-2 bg-[var(--bg-app)] hover:bg-[var(--border-strong)] text-[var(--text-primary)] text-xs font-bold border border-[var(--border-strong)] uppercase transition-colors">
                      Abort
                    </button>
                    <button type="submit" disabled={!remarks.trim()} className="px-8 py-2 bg-[#D83B01] hover:bg-[#B33101] text-white text-xs font-bold border border-[#D83B01] uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      Verify & Close
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
