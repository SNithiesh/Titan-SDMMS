import React, { useState } from 'react';
import { Wrench, CheckCircle2, PlayCircle, Clock, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function TechnicianDashboard({ complaints, onUpdateStatus }) {
  const { currentUser } = useAuth();
  const [selectedTask, setSelectedTask] = useState(null);

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
      case 'Assigned': return <span className="px-1.5 py-0.5 bg-[var(--status-info)]/20 text-[var(--status-info)] border border-[var(--status-info)]/50">ASSIGNED</span>;
      case 'Accepted': return <span className="px-1.5 py-0.5 bg-[#D83B01]/20 text-[#D83B01] border border-[#D83B01]/50">ACCEPTED</span>;
      case 'Repair Started': return <span className="px-1.5 py-0.5 bg-[#107C10]/20 text-[#107C10] border border-[#107C10]/50 animate-pulse">IN PROGRESS</span>;
      case 'Completed': return <span className="px-1.5 py-0.5 bg-[var(--text-muted)]/20 text-[var(--text-muted)] border border-[var(--text-muted)]/50">COMPLETED</span>;
      default: return <span className="px-1.5 py-0.5 bg-[var(--text-secondary)]/20 text-[var(--text-secondary)] border border-[var(--text-secondary)]/50">OPEN</span>;
    }
  };

  const renderActionButtons = (task) => {
    if (task.status === 'Assigned') {
      return (
        <button
          onClick={() => onUpdateStatus(task.id, { status: 'Accepted', acceptedTime: new Date().toISOString() })}
          className="w-full py-1.5 bg-[var(--status-info)] hover:bg-[#004A99] text-white text-xs font-bold border border-[var(--status-info)]"
        >
          ACCEPT JOB
        </button>
      );
    }
    if (task.status === 'Accepted') {
      return (
        <button
          onClick={() => onUpdateStatus(task.id, { status: 'Repair Started', startTime: new Date().toISOString() })}
          className="w-full py-1.5 bg-[#107C10] hover:bg-[#0B5A0B] text-white text-xs font-bold border border-[#107C10]"
        >
          START REPAIR
        </button>
      );
    }
    if (task.status === 'Repair Started') {
      return (
        <button
          onClick={() => onUpdateStatus(task.id, { status: 'Completed', completedTime: new Date().toISOString() })}
          className="w-full py-1.5 bg-[#D83B01] hover:bg-[#B33101] text-white text-xs font-bold border border-[#D83B01]"
        >
          MARK COMPLETED
        </button>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)]">
      <div className="flex items-center justify-between p-3 bg-[var(--bg-panel)] border-b border-[var(--border-strong)]">
        <h1 className="text-sm font-bold uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[var(--status-info)]" />
          My Active Tasks
        </h1>
        <div className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-app)] px-2 py-1 border border-[var(--border-strong)]">
          TOTAL TASKS: {myTasks.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left: Master Data Grid */}
        <div className="w-full md:w-2/3 border-r border-[var(--border-strong)] overflow-auto bg-[var(--bg-panel)]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[var(--bg-panel)] z-10 shadow-sm">
              <tr>
                <th className="py-2 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)] w-24">ID</th>
                <th className="py-2 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)]">Machine</th>
                <th className="py-2 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)]">Fault</th>
                <th className="py-2 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)] w-20">Priority</th>
                <th className="py-2 px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-strong)] w-28">Status</th>
              </tr>
            </thead>
            <tbody>
              {myTasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-xs text-[var(--text-muted)]">No active tasks assigned to you.</td>
                </tr>
              ) : (
                myTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`cursor-pointer border-b border-[var(--border-subtle)] transition-none ${
                      selectedTask?.id === task.id ? 'bg-[var(--bg-selected)]' : 'hover:bg-[var(--bg-panel-hover)]'
                    }`}
                  >
                    <td className="py-2 px-3 text-xs font-mono text-[var(--text-secondary)]">{task.id}</td>
                    <td className="py-2 px-3 text-xs font-bold text-[var(--text-primary)]">{task.machineName}</td>
                    <td className="py-2 px-3 text-xs text-[var(--text-secondary)] truncate max-w-[150px]">{task.faultName}</td>
                    <td className={`py-2 px-3 text-xs font-bold ${getPriorityColor(task.priority)}`}>{task.priority}</td>
                    <td className="py-2 px-3 text-[10px] font-bold">{getStatusBadge(task.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Right: Detail View & Action Panel */}
        <div className="w-full md:w-1/3 bg-[var(--bg-panel)] overflow-auto flex flex-col">
          <div className="p-2 border-b border-[var(--border-strong)] bg-[var(--bg-panel)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
            Task Execution Panel
          </div>
          
          {selectedTask ? (
            <div className="p-4 flex flex-col gap-4 h-full">
              <div>
                <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mb-1">Asset Information</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{selectedTask.machineName}</div>
                <div className="text-xs text-[var(--text-muted)] font-mono">{selectedTask.categoryId} / {selectedTask.machineId}</div>
              </div>

              <div>
                <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mb-1">Reported Issue</div>
                <div className="p-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)]">
                  <strong>{selectedTask.faultName}</strong>
                  <div className="mt-1 text-[var(--text-secondary)] text-[11px]">{selectedTask.description || 'No additional details provided.'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-[var(--bg-app)] border border-[var(--border-strong)]">
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase">Reported By</div>
                  <div className="text-xs font-bold mt-0.5">{selectedTask.operatorName}</div>
                </div>
                <div className="p-2 bg-[var(--bg-app)] border border-[var(--border-strong)]">
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase">Time Elapsed</div>
                  <div className="text-xs font-mono font-bold text-[#D83B01] mt-0.5">
                    {Math.round((new Date() - new Date(selectedTask.timestamp)) / 60000)} mins
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-[var(--border-strong)]">
                 {renderActionButtons(selectedTask)}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[var(--text-muted)]">
              <Info className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">Select a task from the grid to view details and execute actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
