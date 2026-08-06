import React, { useState, useMemo } from 'react';
import { History, Search, Download, Calendar, CalendarDays, CalendarRange, Archive } from 'lucide-react';

// ── TIME RANGE FILTER OPTIONS ─────────────────────────────────
const TIME_RANGES = [
  { id: 'all',   label: 'All Time',    icon: Archive },
  { id: 'day',   label: 'Today',       icon: Calendar },
  { id: 'week',  label: 'This Week',   icon: CalendarDays },
  { id: 'month', label: 'This Month',  icon: CalendarRange },
];

function isWithinRange(dateStr, rangeId) {
  if (rangeId === 'all') return true;
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();

  if (rangeId === 'day') {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }
  if (rangeId === 'week') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
  }
  if (rangeId === 'month') {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }
  return true;
}

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

// ── CSV EXPORT ────────────────────────────────────────────────
function exportToCSV(data, rangeLabel) {
  if (data.length === 0) return;

  const headers = [
    'Req ID', 'Machine Name', 'Category', 'Fault Name', 'Priority', 'Status',
    'Assigned Technician', 'Remarks', 'Parts Changed',
    'Reported Time', 'Assigned Time', 'Accepted Time',
    'Repair Started', 'Completed Time', 'Verified Time'
  ];

  const escape = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

  const rows = data?.map(c => [
    escape(c.id),
    escape(c.machineName),
    escape(c.categoryName || c.categoryId),
    escape(c.faultName),
    escape(c.priority),
    escape(c.status),
    escape(c.assignedTechnician),
    escape(c.remarks),
    escape(c.partsChanged),
    escape(fmt(c.createdTime)),
    escape(fmt(c.assignedTime)),
    escape(fmt(c.acceptedTime)),
    escape(fmt(c.repairStartedTime)),
    escape(fmt(c.completedTime)),
    escape(fmt(c.verifiedTime)),
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel

  const dateTag = new Date().toISOString().split('T')[0];
  const filename = `TITAN_SDMMS_AuditLog_${rangeLabel.replace(/\s/g, '_')}_${dateTag}.csv`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── PRIORITY BADGE ────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const colors = {
    Critical: 'text-[var(--status-critical)] bg-[var(--status-critical)]/10 border-[var(--status-critical)]/30',
    High:     'text-[var(--status-warning)] bg-[var(--status-warning)]/10 border-[var(--status-warning)]/30',
    Medium:   'text-[var(--status-info)] bg-[var(--status-info)]/10 border-[var(--status-info)]/30',
    Low:      'text-[var(--text-secondary)] bg-[var(--border-subtle)] border-[var(--border-strong)]',
  };
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-bold border rounded-sm ${colors[priority] || colors.Low}`}>
      {priority}
    </span>
  );
}

// ── STATUS BADGE ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const colors = {
    Closed:          'text-[var(--status-ok)]',
    Completed:       'text-[var(--status-info)]',
    'Repair Started':'text-[var(--status-warning)]',
    Accepted:        'text-purple-400',
    Assigned:        'text-yellow-400',
    New:             'text-[var(--status-critical)]',
  };
  return <span className={`text-[10px] font-bold uppercase ${colors[status] || 'text-[var(--text-secondary)]'}`}>{status}</span>;
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function HistoryView({ complaints }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRange, setActiveRange] = useState('all');

  // All complaints (not just closed) for complete audit log
  const filtered = useMemo(() => {
    return complaints?.filter(c => {
      const matchTime = isWithinRange(c.createdTime || c.timestamp, activeRange);
      const q = searchTerm.toLowerCase();
      const matchSearch = !q ||
        c.id?.toLowerCase().includes(q) ||
        c.machineName?.toLowerCase().includes(q) ||
        c.faultName?.toLowerCase().includes(q) ||
        c.assignedTechnician?.toLowerCase().includes(q) ||
        c.operatorName?.toLowerCase().includes(q) ||
        c.categoryName?.toLowerCase().includes(q);
      return matchTime && matchSearch;
    });
  }, [complaints, activeRange, searchTerm]);

  const rangeLabel = TIME_RANGES.find(r => r.id === activeRange)?.label || 'All Time';

  // Summary counts for the active range
  const summary = useMemo(() => ({
    total:     filtered.length,
    closed:    filtered?.filter(c => c.status === 'Closed').length,
    completed: filtered?.filter(c => c.status === 'Completed').length,
    active:    filtered?.filter(c => !['Closed', 'Completed'].includes(c.status)).length,
  }), [filtered]);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] max-w-7xl mx-auto w-full">

      {/* ── HEADER ── */}
      <div className="p-3 bg-[var(--bg-panel)] border-b border-[var(--border-strong)]">
        <h1 className="text-sm font-bold uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-[var(--status-info)]" />
          Historical Audit Log
        </h1>

        {/* ── TIME RANGE TABS ── */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {TIME_RANGES?.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveRange(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border transition-none rounded-sm ${
                activeRange === id
                  ? 'bg-[var(--status-info)] text-white border-[var(--status-info)]'
                  : 'bg-[var(--bg-app)] text-[var(--text-secondary)] border-[var(--border-strong)] hover:border-[var(--status-info)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── SEARCH + EXPORT ROW ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, Machine, Fault, Technician..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-7 pr-3 py-1.5 w-full bg-[var(--bg-app)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--status-info)] rounded-sm"
            />
          </div>
          <button
            onClick={() => exportToCSV(filtered, rangeLabel)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--status-ok)]/10 hover:bg-[var(--status-ok)] text-[var(--status-ok)] hover:text-white text-xs font-bold border border-[var(--status-ok)]/40 hover:border-[var(--status-ok)] rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Export {rangeLabel} CSV
          </button>
        </div>
      </div>

      {/* ── SUMMARY STRIP ── */}
      <div className="grid grid-cols-4 border-b border-[var(--border-strong)] shrink-0">
        {[
          { label: 'Total Records', value: summary.total, color: 'text-[var(--text-primary)]' },
          { label: 'Verified & Closed', value: summary.closed, color: 'text-[var(--status-ok)]' },
          { label: 'Repair Completed', value: summary.completed, color: 'text-[var(--status-info)]' },
          { label: 'Still Active', value: summary.active, color: 'text-[var(--status-warning)]' },
        ]?.map(({ label, value, color }) => (
          <div key={label} className="px-4 py-2 bg-[var(--bg-panel)] border-r border-[var(--border-strong)] last:border-r-0">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">{label}</div>
            <div className={`text-xl font-bold tabular-nums ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── TABLE ── */}
      <div className="flex-1 overflow-auto pb-16 md:pb-0">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--bg-app)] text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">
              <th className="py-2 px-3 border-b border-[var(--border-strong)]">Req ID</th>
              <th className="py-2 px-3 border-b border-[var(--border-strong)]">Asset / Machine</th>
              <th className="py-2 px-3 border-b border-[var(--border-strong)]">Fault</th>
              <th className="py-2 px-3 border-b border-[var(--border-strong)]">Priority</th>
              <th className="py-2 px-3 border-b border-[var(--border-strong)]">Status</th>
              <th className="py-2 px-3 border-b border-[var(--border-strong)]">Technician</th>
              <th className="py-2 px-3 border-b border-[var(--border-strong)]">Resolution</th>
              <th className="py-2 px-3 border-b border-[var(--border-strong)]">Reported</th>
              <th className="py-2 px-3 border-b border-[var(--border-strong)]">Completed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-20 text-center">
                  <History className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-40" />
                  <p className="text-xs text-[var(--text-muted)]">No records found for <span className="font-bold text-[var(--text-secondary)]">{rangeLabel}</span>.</p>
                </td>
              </tr>
            ) : (
              filtered?.map((c, idx) => (
                <tr
                  key={c.id}
                  className={`border-b border-[var(--border-subtle)] hover:bg-[var(--bg-panel-hover)] text-xs ${
                    idx % 2 === 1 ? 'bg-[var(--bg-panel)]/20' : ''
                  }`}
                >
                  <td className="py-2 px-3 font-mono text-[var(--text-secondary)] text-[10px] whitespace-nowrap">{c.id}</td>
                  <td className="py-2 px-3">
                    <div className="font-bold text-[var(--text-primary)] whitespace-nowrap">{c.machineName}</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">{c.categoryName || c.categoryId}</div>
                  </td>
                  <td className="py-2 px-3 text-[var(--text-primary)] max-w-[180px] truncate" title={c.faultName}>{c.faultName}</td>
                  <td className="py-2 px-3 whitespace-nowrap"><PriorityBadge priority={c.priority} /></td>
                  <td className="py-2 px-3 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                  <td className="py-2 px-3 text-[var(--text-secondary)] whitespace-nowrap">{c.assignedTechnician || '—'}</td>
                  <td className="py-2 px-3 max-w-[180px]">
                    <div className="text-[var(--status-ok)] font-bold truncate" title={c.remarks}>{c.remarks || '—'}</div>
                    <div className="text-[10px] text-[var(--text-secondary)] truncate">Parts: {c.partsChanged || 'None'}</div>
                  </td>
                  <td className="py-2 px-3 text-[10px] font-mono text-[var(--text-muted)] whitespace-nowrap">{fmt(c.createdTime || c.timestamp)}</td>
                  <td className="py-2 px-3 text-[10px] font-mono text-[var(--text-muted)] whitespace-nowrap">{fmt(c.completedTime)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER ── */}
      <div className="px-4 py-1.5 bg-[var(--bg-panel)] border-t border-[var(--border-strong)] flex items-center justify-between shrink-0">
        <span className="text-[10px] text-[var(--text-muted)] font-mono">
          TITAN SDMMS — Audit Log | Showing {filtered.length} of {complaints.length} total records
        </span>
        <span className="text-[10px] text-[var(--text-muted)] font-mono">
          Filter: {rangeLabel} {searchTerm && `| Search: "${searchTerm}"`}
        </span>
      </div>
    </div>
  );
}
