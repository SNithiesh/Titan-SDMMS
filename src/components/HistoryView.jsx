import React, { useState } from 'react';
import { History, Search, Download } from 'lucide-react';

export default function HistoryView({ complaints }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Only show completed/closed complaints in history log
  const historyLog = complaints.filter(c => c.status === 'Closed' || c.status === 'Completed');

  const filteredHistory = historyLog.filter(c => 
    c.machineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.faultName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.assignedTechnician?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    if (filteredHistory.length === 0) return;
    
    const headers = ['Req ID', 'Machine Name', 'Category', 'Fault Name', 'Priority', 'Remarks', 'Parts Changed', 'Assigned Technician', 'Reported Time', 'Completed Time'];
    
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map(c => [
        c.id,
        `"${(c.machineName || '').replace(/"/g, '""')}"`,
        c.categoryId || '',
        `"${(c.faultName || '').replace(/"/g, '""')}"`,
        c.priority || '',
        `"${(c.remarks || '').replace(/"/g, '""')}"`,
        `"${(c.partsChanged || '').replace(/"/g, '""')}"`,
        `"${(c.assignedTechnician || '').replace(/"/g, '""')}"`,
        `"${c.timestamp ? new Date(c.timestamp).toLocaleString() : ''}"`,
        `"${c.completedTime ? new Date(c.completedTime).toLocaleString() : ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SDMMS_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] max-w-7xl mx-auto w-full">
      <div className="p-3 bg-[var(--bg-panel)] border-b border-[var(--border-strong)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-sm font-bold uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-2">
          <History className="w-4 h-4 text-[var(--text-secondary)]" />
          Historical Audit Log
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Search ID, Asset, Tech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-2 py-1.5 w-64 bg-[var(--bg-app)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--status-info)]"
            />
          </div>
          <button 
            onClick={exportToCSV}
            disabled={filteredHistory.length === 0}
            className="px-3 py-1.5 bg-[var(--border-subtle)] hover:bg-[var(--border-strong)] text-[var(--text-secondary)] hover:text-white text-xs font-bold border border-[var(--border-strong)] flex items-center gap-2 transition-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT CSV
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto bg-[var(--bg-panel)] p-4 pb-16 md:pb-4">
        <div className="border border-[var(--border-strong)] min-w-[800px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[var(--bg-panel)] z-10 shadow-sm">
              <tr>
                <th className="py-2 px-3 border-b border-[var(--border-strong)] w-24">Req ID</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Asset Info</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Fault Details</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Resolution</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Execution Tech</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Timestamp Log</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-xs text-[var(--text-muted)]">No historical records found.</td>
                </tr>
              ) : (
                filteredHistory.map(c => (
                  <tr key={c.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-panel-hover)] transition-none">
                    <td className="py-2 px-3 text-xs font-mono text-[var(--text-secondary)]">{c.id}</td>
                    <td className="py-2 px-3">
                      <div className="text-xs font-bold text-[var(--text-primary)]">{c.machineName}</div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-mono">{c.categoryId}</div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-xs text-[var(--text-primary)] truncate max-w-[200px]" title={c.faultName}>{c.faultName}</div>
                      <div className="text-[10px] text-[#D83B01] font-bold">PRIORITY: {c.priority}</div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-xs text-[#107C10] font-bold truncate max-w-[200px]" title={c.remarks}>{c.remarks || 'No remarks logged.'}</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Parts: {c.partsChanged || 'None'}</div>
                    </td>
                    <td className="py-2 px-3 text-xs text-[var(--text-secondary)]">{c.assignedTechnician}</td>
                    <td className="py-2 px-3 text-[10px] font-mono text-[var(--text-muted)]">
                      <div>OPN: {new Date(c.timestamp).toLocaleString()}</div>
                      {c.completedTime && <div>CLS: {new Date(c.completedTime).toLocaleString()}</div>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
