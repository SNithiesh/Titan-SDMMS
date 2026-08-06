import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { TECHNICIANS } from '../mockData';

export default function SupervisorDashboard({ complaints, onAssignTechnician, onVerifyComplaint }) {
  const [filter, setFilter] = useState('All');

  // KPI Calculations
  const activeFaults = complaints?.filter(c => c.status !== 'Closed').length;
  const unassignedFaults = complaints?.filter(c => c.status === 'New').length;
  const criticalFaults = complaints?.filter(c => c.status !== 'Closed' && c.priority === 'Critical').length;
  const completedPendingVerification = complaints?.filter(c => c.status === 'Completed').length;

  const filteredComplaints = complaints?.filter(c => {
    if (filter === 'All') return c.status !== 'Closed';
    if (filter === 'Unassigned') return c.status === 'New';
    if (filter === 'Pending Review') return c.status === 'Completed';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Assigned': return <span className="px-1.5 py-0.5 bg-[var(--status-info)]/20 text-[var(--status-info)] border border-[var(--status-info)]/50 text-[9px]">ASSIGNED</span>;
      case 'Accepted': return <span className="px-1.5 py-0.5 bg-[#D83B01]/20 text-[#D83B01] border border-[#D83B01]/50 text-[9px]">ACCEPTED</span>;
      case 'Repair Started': return <span className="px-1.5 py-0.5 bg-[#107C10]/20 text-[#107C10] border border-[#107C10]/50 text-[9px]">IN PROGRESS</span>;
      case 'Completed': return <span className="px-1.5 py-0.5 bg-[var(--status-info)] text-white border border-[var(--status-info)] text-[9px] animate-pulse">VERIFY</span>;
      default: return <span className="px-1.5 py-0.5 bg-[var(--text-secondary)]/20 text-[var(--text-secondary)] border border-[var(--text-secondary)]/50 text-[9px]">OPEN</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] max-w-7xl mx-auto w-full">
      
      {/* ── KPI METRICS STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-b border-[var(--border-strong)] bg-[var(--bg-panel)]">
        <div className="bg-[var(--bg-app)] border border-[var(--border-strong)] p-3 flex flex-col justify-center relative overflow-hidden">
          <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mb-1">Active Faults</div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{activeFaults}</div>
          <AlertTriangle className="absolute -right-2 -bottom-2 w-12 h-12 text-[var(--border-subtle)] opacity-50" />
        </div>
        <div className="bg-[var(--bg-app)] border border-[#E81123]/50 p-3 flex flex-col justify-center relative overflow-hidden">
          <div className="text-[10px] text-[#E81123] uppercase font-bold mb-1">Critical Priority</div>
          <div className="text-2xl font-bold font-mono text-[#E81123]">{criticalFaults}</div>
          <AlertTriangle className="absolute -right-2 -bottom-2 w-12 h-12 text-[#E81123] opacity-10" />
        </div>
        <div className="bg-[var(--bg-app)] border border-[#D83B01]/50 p-3 flex flex-col justify-center relative overflow-hidden">
          <div className="text-[10px] text-[#D83B01] uppercase font-bold mb-1">Unassigned Jobs</div>
          <div className="text-2xl font-bold font-mono text-[#D83B01]">{unassignedFaults}</div>
          <Clock className="absolute -right-2 -bottom-2 w-12 h-12 text-[#D83B01] opacity-10" />
        </div>
        <div className="bg-[var(--bg-app)] border border-[#107C10]/50 p-3 flex flex-col justify-center relative overflow-hidden">
          <div className="text-[10px] text-[#107C10] uppercase font-bold mb-1">Pending Review</div>
          <div className="text-2xl font-bold font-mono text-[#107C10]">{completedPendingVerification}</div>
          <CheckCircle2 className="absolute -right-2 -bottom-2 w-12 h-12 text-[#107C10] opacity-10" />
        </div>
      </div>

      {/* ── DATA GRID AREA ── */}
      <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-panel)] p-4">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">Filter View:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-1 bg-[var(--bg-app)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="All">All Active</option>
              <option value="Unassigned">Unassigned Only</option>
              <option value="Pending Review">Pending Review Only</option>
            </select>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] font-mono">
            SHOWING {filteredComplaints.length} RECORDS
          </div>
        </div>

        {/* Master Table */}
        <div className="flex-1 overflow-x-auto border border-[var(--border-strong)] bg-[var(--bg-app)] pb-16 md:pb-0">
          <div className="min-w-[800px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[var(--bg-panel)] z-10 shadow-sm">
              <tr>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">ID</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Asset</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Reported Fault</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Priority</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Status</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Assignment / Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-xs text-[var(--text-muted)]">No records match current filter.</td>
                </tr>
              ) : (
                filteredComplaints?.map(c => (
                  <tr key={c.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-panel-hover)] transition-none">
                    <td className="py-2 px-3 text-xs font-mono text-[var(--text-secondary)]">{c.id}</td>
                    <td className="py-2 px-3 text-xs font-bold text-[var(--text-primary)]">{c.machineName}</td>
                    <td className="py-2 px-3 text-xs text-[var(--text-secondary)] truncate max-w-[200px]">{c.faultName}</td>
                    <td className={`py-2 px-3 text-xs font-bold ${c.priority === 'Critical' ? 'text-[#E81123]' : c.priority === 'High' ? 'text-[#D83B01]' : 'text-[var(--text-secondary)]'}`}>
                      {c.priority}
                    </td>
                    <td className="py-2 px-3 font-bold">{getStatusBadge(c.status)}</td>
                    <td className="py-2 px-3">
                      {['New', 'Assigned', 'Accepted', 'Repair Started'].includes(c.status) ? (
                        <div className="flex gap-2">
                          <select
                            onChange={(e) => onAssignTechnician(c.id, e.target.value)}
                            className="bg-[var(--bg-app)] border border-[var(--border-strong)] text-[10px] p-1 text-[var(--text-primary)]"
                            value={c.assignedTechnician && c.assignedTechnician !== 'Unassigned' ? c.assignedTechnician : ""}
                          >
                            <option value="" disabled>Assign Tech...</option>
                            {TECHNICIANS?.map(t => (
                              <option key={t.id} value={t.name}>{t.name} - {t.role}</option>
                            ))}
                          </select>
                        </div>
                      ) : c.status === 'Completed' ? (
                        <button
                          onClick={() => onVerifyComplaint(c.id)}
                          className="px-3 py-1 bg-[#107C10] hover:bg-[#0B5A0B] text-white text-[10px] font-bold border border-[#107C10]"
                        >
                          VERIFY & CLOSE
                        </button>
                      ) : (
                        <span className="text-xs text-[var(--text-secondary)]">{c.assignedTechnician}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

      </div>
    </div>
  );
}
