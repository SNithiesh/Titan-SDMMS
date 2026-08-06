import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, Activity, Clock, ShieldAlert, CheckCircle2, X, FileText, Filter } from 'lucide-react';

// ── FULL REPORT MODAL ──────────────────────────────────────────
function FullReportModal({ complaints, onClose }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  const statuses = ['All', 'New', 'Assigned', 'Accepted', 'Repair Started', 'Completed', 'Closed'];
  const priorities = ['All', 'Critical', 'High', 'Medium', 'Low'];

  const filtered = useMemo(() => {
    return complaints?.filter(c => {
      const matchStatus = filterStatus === 'All' || c.status === filterStatus;
      const matchPriority = filterPriority === 'All' || c.priority === filterPriority;
      return matchStatus && matchPriority;
    });
  }, [complaints, filterStatus, filterPriority]);

  const priorityColor = (p) => {
    if (p === 'Critical') return 'text-[var(--status-critical)] bg-[var(--status-critical)]/10 border-[var(--status-critical)]/30';
    if (p === 'High') return 'text-[var(--status-warning)] bg-[var(--status-warning)]/10 border-[var(--status-warning)]/30';
    if (p === 'Medium') return 'text-[var(--status-info)] bg-[var(--status-info)]/10 border-[var(--status-info)]/30';
    return 'text-[var(--text-secondary)] bg-[var(--border-subtle)] border-[var(--border-strong)]';
  };

  const statusColor = (s) => {
    if (s === 'Closed') return 'text-[var(--status-ok)]';
    if (s === 'Completed') return 'text-[var(--status-info)]';
    if (s === 'Repair Started') return 'text-[var(--status-warning)]';
    if (s === 'New') return 'text-[var(--status-critical)]';
    return 'text-[var(--text-secondary)]';
  };

  const fmt = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col" onClick={onClose}>
      <div
        className="flex flex-col flex-1 m-2 md:m-6 bg-[var(--bg-app)] border border-[var(--border-strong)] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-panel)] border-b border-[var(--border-strong)] shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--status-info)]" />
            <span className="text-sm font-bold uppercase tracking-wide">Full Maintenance Report</span>
            <span className="text-xs bg-[var(--border-subtle)] px-2 py-0.5 text-[var(--text-secondary)] font-mono">
              {filtered.length} / {complaints.length} records
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#E81123] hover:text-white text-[var(--text-secondary)] rounded-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-[var(--bg-panel)] border-b border-[var(--border-strong)] shrink-0">
          <Filter className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mr-1">Status:</span>
          {statuses?.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-2 py-0.5 text-[10px] font-bold border rounded-sm transition-none ${
                filterStatus === s
                  ? 'bg-[var(--status-info)] text-white border-[var(--status-info)]'
                  : 'border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--status-info)]'
              }`}
            >
              {s}
            </button>
          ))}
          <span className="text-[var(--border-strong)] mx-1">|</span>
          <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mr-1">Priority:</span>
          {priorities?.map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2 py-0.5 text-[10px] font-bold border rounded-sm transition-none ${
                filterPriority === p
                  ? 'bg-[var(--status-info)] text-white border-[var(--status-info)]'
                  : 'border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--status-info)]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[var(--bg-app)] text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Complaint ID</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Machine</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Fault</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Category</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Priority</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Status</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Technician</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Reported At</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Completed At</th>
                <th className="py-2 px-3 border-b border-[var(--border-strong)]">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-16 text-center text-xs text-[var(--text-muted)]">
                    No records match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered?.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={`border-b border-[var(--border-subtle)] text-xs hover:bg-[var(--bg-panel-hover)] ${
                      idx % 2 === 0 ? '' : 'bg-[var(--bg-panel)]/30'
                    }`}
                  >
                    <td className="py-2 px-3 font-mono text-[var(--text-secondary)] whitespace-nowrap">{c.id}</td>
                    <td className="py-2 px-3 font-bold text-[var(--text-primary)] whitespace-nowrap">{c.machineName}</td>
                    <td className="py-2 px-3 text-[var(--text-primary)] whitespace-nowrap">{c.faultName}</td>
                    <td className="py-2 px-3 text-[var(--text-secondary)] whitespace-nowrap">{c.categoryName || '—'}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-sm ${priorityColor(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className={`py-2 px-3 font-bold whitespace-nowrap ${statusColor(c.status)}`}>{c.status}</td>
                    <td className="py-2 px-3 text-[var(--text-secondary)] whitespace-nowrap">{c.assignedTechnician || '—'}</td>
                    <td className="py-2 px-3 text-[var(--text-secondary)] whitespace-nowrap font-mono text-[10px]">{fmt(c.createdTime)}</td>
                    <td className="py-2 px-3 text-[var(--text-secondary)] whitespace-nowrap font-mono text-[10px]">{fmt(c.completedTime)}</td>
                    <td className="py-2 px-3 text-[var(--text-secondary)] max-w-[200px] truncate">{c.remarks || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[var(--bg-panel)] border-t border-[var(--border-strong)] flex items-center justify-between shrink-0">
          <span className="text-[10px] text-[var(--text-muted)] font-mono">
            TITAN SDMMS — Maintenance Report Export | {new Date().toLocaleDateString('en-IN')}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1 text-xs font-bold bg-[var(--border-subtle)] hover:bg-[var(--bg-selected)] text-[var(--text-secondary)] hover:text-white rounded-sm"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ANALYTICS DASHBOARD ──────────────────────────────────
export default function AnalyticsDashboard({ complaints }) {
  const [showFullReport, setShowFullReport] = useState(false);

  // ── KPI CALCULATIONS ──
  const totalFaults = complaints.length;
  const criticalFaults = complaints?.filter(c => c.priority === 'Critical').length;
  const completedComplaints = complaints?.filter(c => c.status === 'Completed' || c.status === 'Closed');
  const completionRate = totalFaults > 0 ? Math.round((completedComplaints.length / totalFaults) * 100) : 0;

  const mttrMinutes = useMemo(() => {
    if (completedComplaints.length === 0) return 0;
    const totalMs = completedComplaints.reduce((acc, c) => {
      const start = new Date(c.createdTime).getTime();
      const end = new Date(c.completedTime).getTime();
      if (!isNaN(start) && !isNaN(end)) return acc + (end - start);
      return acc;
    }, 0);
    return Math.round(totalMs / completedComplaints.length / 60000);
  }, [completedComplaints]);

  const formatMTTR = (mins) => {
    if (mins === 0) return '0m';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  // ── CHART DATA ──
  const machineData = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      if (!map[c.machineName]) {
        map[c.machineName] = { name: c.machineName, Critical: 0, High: 0, Medium: 0, Low: 0 };
      }
      if (['Critical', 'High', 'Medium', 'Low'].includes(c.priority)) {
        map[c.machineName][c.priority] += 1;
      }
    });
    return Object.values(map)
      .sort((a, b) => (b.Critical + b.High) - (a.Critical + a.High))
      .slice(0, 5);
  }, [complaints]);

  const categoryData = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      const cat = c.categoryName || 'Uncategorized';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ name: k, value: map[k] }));
  }, [complaints]);

  const CATEGORY_COLORS = ['var(--status-info)', 'var(--status-warning)', 'var(--status-ok)', 'var(--status-critical)'];

  const recurringFaults = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      map[c.faultName] = (map[c.faultName] || 0) + 1;
    });
    return Object.keys(map)
      .map(k => ({ name: k, count: map[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [complaints]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] p-3 text-xs shadow-lg rounded-sm">
          <p className="font-bold text-[var(--text-primary)] mb-2 uppercase tracking-wide border-b border-[var(--border-subtle)] pb-1">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[var(--text-secondary)]">{entry.name}:</span>
              <span className="font-bold text-[var(--text-primary)] tabular-nums">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {showFullReport && (
        <FullReportModal complaints={complaints} onClose={() => setShowFullReport(false)} />
      )}

      <div className="flex flex-col h-full bg-[var(--bg-app)] max-w-7xl mx-auto w-full">
        <div className="p-3 bg-[var(--bg-panel)] border-b border-[var(--border-strong)]">
          <h1 className="text-sm font-bold uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--status-info)]" />
            Plant Performance Analytics
          </h1>
        </div>

        <div className="flex-1 overflow-auto p-4 pb-16 md:pb-4 flex flex-col gap-4 no-scrollbar">

          {/* ── KPI STRIP ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] p-4 relative overflow-hidden">
              <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mb-1">Total Reported Faults</div>
              <div className="text-3xl font-bold tabular-nums text-[var(--text-primary)]">{totalFaults}</div>
              <Activity className="absolute -right-2 -bottom-2 w-16 h-16 text-[var(--text-muted)] opacity-10" />
            </div>
            <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] p-4 relative overflow-hidden">
              <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mb-1">Mean Time To Repair (MTTR)</div>
              <div className="text-3xl font-bold tabular-nums text-[var(--status-info)]">{formatMTTR(mttrMinutes)}</div>
              <Clock className="absolute -right-2 -bottom-2 w-16 h-16 text-[var(--status-info)] opacity-10" />
            </div>
            <div className="bg-[var(--bg-panel)] border border-[var(--status-critical)] p-4 relative overflow-hidden">
              <div className="text-[10px] text-[var(--status-critical)] uppercase font-bold mb-1">Critical Breakdown Events</div>
              <div className="text-3xl font-bold tabular-nums text-[var(--status-critical)]">{criticalFaults}</div>
              <ShieldAlert className="absolute -right-2 -bottom-2 w-16 h-16 text-[var(--status-critical)] opacity-10" />
            </div>
            <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] p-4 relative overflow-hidden">
              <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mb-1">SLA Completion Rate</div>
              <div className="text-3xl font-bold tabular-nums text-[var(--status-ok)]">{completionRate}%</div>
              <CheckCircle2 className="absolute -right-2 -bottom-2 w-16 h-16 text-[var(--status-ok)] opacity-10" />
            </div>
          </div>

          {/* ── CHARTS ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[350px]">
            <div className="lg:col-span-2 bg-[var(--bg-panel)] border border-[var(--border-strong)] flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--border-strong)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                Top 5 Most Vulnerable Assets (By Priority)
              </div>
              <div className="flex-1 p-4 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={machineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} maxBarSize={60}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickMargin={10} tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }} />
                    <Bar dataKey="Critical" stackId="a" fill="var(--status-critical)" />
                    <Bar dataKey="High" stackId="a" fill="var(--status-warning)" />
                    <Bar dataKey="Medium" stackId="a" fill="var(--status-info)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--border-strong)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                Fault Distribution by Discipline
              </div>
              <div className="flex-1 p-4 min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} innerRadius="60%" outerRadius="80%" paddingAngle={2} dataKey="value" stroke="none">
                      {categoryData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', color: 'var(--text-secondary)' }} />
                  </PieChart>
                </ResponsiveContainer>
                {categoryData.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--text-muted)]">No data available</div>
                )}
              </div>
            </div>
          </div>

          {/* ── PARETO TABLE ── */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] flex flex-col">
            <div className="px-4 py-3 border-b border-[var(--border-strong)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide flex justify-between items-center">
              <span>Top Recurring Faults (Pareto Analysis)</span>
              <button
                onClick={() => setShowFullReport(true)}
                className="text-[var(--status-info)] hover:underline hover:text-white text-[10px] font-bold px-2 py-1 hover:bg-[var(--status-info)] rounded-sm transition-colors"
              >
                View Full Report →
              </button>
            </div>
            <div className="p-0 overflow-x-auto">
              <div className="min-w-[600px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)] text-[10px] font-bold text-[var(--text-secondary)] uppercase">Rank</th>
                      <th className="py-2 px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)] text-[10px] font-bold text-[var(--text-secondary)] uppercase">Fault / Defect Description</th>
                      <th className="py-2 px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)] text-[10px] font-bold text-[var(--text-secondary)] uppercase text-right">Occurrences</th>
                      <th className="py-2 px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)] text-[10px] font-bold text-[var(--text-secondary)] uppercase w-1/3">Frequency Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recurringFaults.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-xs text-[var(--text-muted)]">No faults logged yet.</td>
                      </tr>
                    ) : (
                      recurringFaults?.map((fault, idx) => {
                        const max = recurringFaults[0].count;
                        const pct = Math.round((fault.count / max) * 100);
                        return (
                          <tr key={fault.name} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-panel-hover)]">
                            <td className="py-2 px-4 text-xs font-bold text-[var(--text-secondary)] tabular-nums">#{idx + 1}</td>
                            <td className="py-2 px-4 text-xs text-[var(--text-primary)] font-bold">{fault.name}</td>
                            <td className="py-2 px-4 text-xs text-[var(--text-primary)] text-right tabular-nums font-bold">{fault.count}</td>
                            <td className="py-2 px-4">
                              <div className="h-1.5 w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--status-info)]" style={{ width: `${pct}%` }} />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
