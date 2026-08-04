import React, { useState } from 'react';
import { Wrench, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function TechnicianDashboard({ complaints, onUpdateStatus }) {
  const { currentUser } = useAuth();
  
  // Modal State
  const [modalTask, setModalTask] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [partsChanged, setPartsChanged] = useState('');

  // Filter complaints meant for this technician
  const myTasks = complaints.filter(
    (c) => c.status !== 'Closed' && (c.assignedTechnician === currentUser?.name || c.status === 'Open')
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-[#E81123]';
      case 'High': return 'text-[#D83B01]';
      case 'Medium': return 'text-[var(--status-info)]';
      default: return 'text-[#107C10]';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Assigned': return <span className="px-2 py-1 bg-[var(--status-info)]/20 text-[var(--status-info)] border border-[var(--status-info)]/50 whitespace-nowrap text-[9px]">ASSIGNED</span>;
      case 'Accepted': return <span className="px-2 py-1 bg-[#D83B01]/20 text-[#D83B01] border border-[#D83B01]/50 whitespace-nowrap text-[9px]">ACCEPTED</span>;
      case 'Repair Started': return <span className="px-2 py-1 bg-[#107C10]/20 text-[#107C10] border border-[#107C10]/50 animate-pulse whitespace-nowrap text-[9px]">IN PROGRESS</span>;
      case 'Completed': return <span className="px-2 py-1 bg-[var(--text-muted)]/20 text-[var(--text-muted)] border border-[var(--text-muted)]/50 whitespace-nowrap text-[9px]">COMPLETED</span>;
      default: return <span className="px-2 py-1 bg-[var(--text-secondary)]/20 text-[var(--text-secondary)] border border-[var(--text-secondary)]/50 whitespace-nowrap text-[9px]">OPEN</span>;
    }
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
        <button
          onClick={(e) => { e.stopPropagation(); onUpdateStatus(task.id, { status: 'Accepted', acceptedTime: new Date().toISOString() }); }}
          className="w-full py-1.5 px-3 bg-[var(--status-info)] hover:bg-[#004A99] text-white text-[10px] font-bold border border-[var(--status-info)] uppercase transition-colors"
        >
          Accept Job
        </button>
      );
    }
    if (task.status === 'Accepted') {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); onUpdateStatus(task.id, { status: 'Repair Started', repairStartedTime: new Date().toISOString() }); }}
          className="w-full py-1.5 px-3 bg-[#107C10] hover:bg-[#0B5A0B] text-white text-[10px] font-bold border border-[#107C10] uppercase transition-colors"
        >
          Start Repair
        </button>
      );
    }
    if (task.status === 'Repair Started') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setModalTask(task);
            setRemarks('');
            setPartsChanged('');
          }}
          className="w-full py-1.5 px-3 bg-[#D83B01] hover:bg-[#B33101] text-white text-[10px] font-bold border border-[#D83B01] uppercase transition-colors shadow-sm"
        >
          Mark Completed
        </button>
      );
    }
    if (task.status === 'Completed') {
        return (
            <div className="w-full text-center py-1.5 px-3 text-[10px] font-bold text-[var(--text-muted)] border border-[var(--text-muted)]/20 bg-[var(--bg-app)]">
                VERIFY PENDING
            </div>
        );
    }
    return <span className="text-[10px] text-[var(--text-muted)] uppercase">No Action</span>;
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] relative">
      <div className="flex items-center justify-between p-3 bg-[var(--bg-panel)] border-b border-[var(--border-strong)]">
        <h1 className="text-sm font-bold uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[var(--status-info)]" />
          My Active Tasks
        </h1>
        <div className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-app)] px-2 py-1 border border-[var(--border-strong)]">
          TOTAL TASKS: {myTasks.length}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[var(--bg-panel)] p-2">
        <div className="border border-[var(--border-strong)] h-full overflow-hidden flex flex-col">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="sticky top-0 bg-[var(--bg-panel)] z-10 shadow-sm">
              <tr>
                <th className="py-2.5 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)] w-24">ID</th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)] w-48">Machine</th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)]">Reported Fault & Details</th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)] w-24">Priority</th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)] w-28 text-center">Status</th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)] w-24 text-center">Active Time</th>
                <th className="py-2.5 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)] w-36 text-center">Quick Action</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bg-app)]">
              {myTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-[var(--text-muted)] border-b border-[var(--border-strong)]">
                    <div className="flex flex-col items-center justify-center">
                      <Info className="w-8 h-8 mb-2 opacity-50 text-[var(--text-secondary)]" />
                      <span className="text-xs font-bold uppercase tracking-wider">No Active Tasks Assigned</span>
                    </div>
                  </td>
                </tr>
              ) : (
                myTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-panel-hover)] transition-colors group"
                  >
                    <td className="py-3 px-3 text-xs font-mono text-[var(--text-secondary)]">{task.id}</td>
                    <td className="py-3 px-3">
                        <div className="text-xs font-bold text-[var(--text-primary)] truncate">{task.machineName}</div>
                        <div className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">{task.machineId}</div>
                    </td>
                    <td className="py-3 px-3">
                        <div className="text-xs font-bold text-[var(--text-primary)]">{task.faultName}</div>
                        {task.description && (
                            <div className="text-[10px] text-[var(--text-secondary)] truncate max-w-sm mt-0.5" title={task.description}>
                                {task.description}
                            </div>
                        )}
                        <div className="text-[9px] text-[var(--text-muted)] uppercase mt-1">Reported by {task.operatorName}</div>
                    </td>
                    <td className={`py-3 px-3 text-xs font-bold ${getPriorityColor(task.priority)}`}>{task.priority}</td>
                    <td className="py-3 px-3 text-[10px] font-bold text-center align-middle">{getStatusBadge(task.status)}</td>
                    <td className="py-3 px-3 text-center align-middle">
                      <div className="text-xs font-mono font-bold text-[#D83B01]">
                        {task.createdTime ? Math.round((new Date() - new Date(task.createdTime)) / 60000) : 0}m
                      </div>
                    </td>
                    <td className="py-3 px-3 align-middle">
                        {renderActionButtons(task)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completion Modal Overlay */}
      {modalTask && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] shadow-2xl w-full max-w-md flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between p-3 border-b border-[var(--border-strong)] bg-[#D83B01]">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Complete Work Order</h2>
              <button onClick={() => setModalTask(null)} className="text-white hover:text-white/70">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCompleteSubmit} className="p-5 flex flex-col gap-4">
              <div className="bg-[var(--bg-app)] border border-[var(--border-strong)] p-3 mb-2">
                <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Asset</div>
                <div className="text-xs font-bold text-[var(--text-primary)] mb-2">{modalTask.machineName} ({modalTask.machineId})</div>
                <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Fault</div>
                <div className="text-xs text-[var(--text-primary)]">{modalTask.faultName}</div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase mb-1">
                  Repair Remarks / Solution <span className="text-[#E81123]">*</span>
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe the root cause and exactly what was done to fix it..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs focus:border-[var(--status-info)] outline-none resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase mb-1">
                  Parts Changed / Replaced
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1x O-Ring, 2x M6 Bolts (Leave blank if none)"
                  value={partsChanged}
                  onChange={(e) => setPartsChanged(e.target.value)}
                  className="w-full p-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs focus:border-[var(--status-info)] outline-none"
                />
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border-strong)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalTask(null)}
                  className="px-4 py-2 bg-[var(--bg-app)] hover:bg-[var(--border-strong)] text-[var(--text-primary)] text-xs font-bold border border-[var(--border-strong)] uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!remarks.trim()}
                  className="px-6 py-2 bg-[#D83B01] hover:bg-[#B33101] text-white text-xs font-bold border border-[#D83B01] uppercase transition-colors disabled:opacity-50"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
