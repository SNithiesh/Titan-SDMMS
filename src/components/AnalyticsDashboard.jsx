import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { BarChart3, Activity, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AnalyticsDashboard({ complaints }) {
  
  // ── KPI CALCULATIONS ──
  const totalFaults = complaints.length;
  const criticalFaults = complaints.filter(c => c.priority === 'Critical').length;
  const completedComplaints = complaints.filter(c => c.status === 'Completed' || c.status === 'Closed');
  const completionRate = totalFaults > 0 ? Math.round((completedComplaints.length / totalFaults) * 100) : 0;

  const mttrMinutes = useMemo(() => {
    if (completedComplaints.length === 0) return 0;
    const totalMs = completedComplaints.reduce((acc, c) => {
      // createdTime is the property name used in our DB mapper
      const start = new Date(c.createdTime).getTime();
      const end = new Date(c.completedTime).getTime();
      if (!isNaN(start) && !isNaN(end)) return acc + (end - start);
      return acc;
    }, 0);
    return Math.round(totalMs / completedComplaints.length / 60000);
  }, [completedComplaints]);

  // Format MTTR (e.g. 1h 25m)
  const formatMTTR = (mins) => {
    if (mins === 0) return '0m';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  // ── CHART 1: FAULTS BY MACHINE (Stacked by Priority) ──
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
    return Object.values(map).sort((a, b) => 
      (b.Critical + b.High) - (a.Critical + a.High) // Sort by most severe
    ).slice(0, 5); // Top 5
  }, [complaints]);

  // ── CHART 2: FAULT DISTRIBUTION BY CATEGORY (Pie) ──
  const categoryData = useMemo(() => {
    const map = {};
    complaints.forEach(c => {
      const cat = c.categoryName || 'Uncategorized';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ name: k, value: map[k] }));
  }, [complaints]);

  const CATEGORY_COLORS = ['var(--status-info)', 'var(--status-warning)', 'var(--status-ok)', 'var(--status-critical)'];

  // ── TOP RECURRING FAULTS ──
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

  // ── CUSTOM TOOLTIP FOR RECHARTS ──
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] p-3 text-xs shadow-lg rounded-sm">
          <p className="font-bold text-[var(--text-primary)] mb-2 uppercase tracking-wide border-b border-[var(--border-subtle)] pb-1">{label}</p>
          {payload.map((entry, index) => (
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
    <div className="flex flex-col h-full bg-[var(--bg-app)] max-w-7xl mx-auto w-full">
      <div className="p-3 bg-[var(--bg-panel)] border-b border-[var(--border-strong)]">
        <h1 className="text-sm font-bold uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[var(--status-info)]" />
          Plant Performance Analytics
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-4 pb-16 md:pb-4 flex flex-col gap-4 no-scrollbar">
        
        {/* ── KPI METRICS STRIP ── */}
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

        {/* ── CHARTS ROW 1 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[350px]">
          
          {/* Stacked Bar Chart: Asset Vulnerability */}
          <div className="lg:col-span-2 bg-[var(--bg-panel)] border border-[var(--border-strong)] flex flex-col">
            <div className="px-4 py-3 border-b border-[var(--border-strong)] bg-[var(--bg-panel)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
              Top 5 Most Vulnerable Assets (By Priority)
            </div>
            <div className="flex-1 p-4 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={machineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} maxBarSize={60}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickMargin={10} tickFormatter={(val) => val.length > 15 ? val.substring(0,15)+'...' : val} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }} />
                  <Bar dataKey="Critical" stackId="a" fill="var(--status-critical)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="High" stackId="a" fill="var(--status-warning)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Medium" stackId="a" fill="var(--status-info)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Fault Distribution */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] flex flex-col">
            <div className="px-4 py-3 border-b border-[var(--border-strong)] bg-[var(--bg-panel)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
              Fault Distribution by Discipline
            </div>
            <div className="flex-1 p-4 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
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

        {/* ── BOTTOM ROW: TOP RECURRING FAULTS ── */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] flex flex-col">
          <div className="px-4 py-3 border-b border-[var(--border-strong)] bg-[var(--bg-panel)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide flex justify-between">
            <span>Top Recurring Faults (Pareto Analysis)</span>
            <span className="text-[var(--status-info)] cursor-pointer hover:underline">View Full Report</span>
          </div>
          <div className="p-0 overflow-x-auto">
            <div className="min-w-[600px]">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)]">Rank</th>
                  <th className="py-2 px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)]">Fault / Defect Description</th>
                  <th className="py-2 px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)] text-right">Occurrences</th>
                  <th className="py-2 px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)] w-1/3">Frequency Bar</th>
                </tr>
              </thead>
              <tbody>
                {recurringFaults.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-xs text-[var(--text-muted)]">No faults logged yet.</td>
                  </tr>
                ) : (
                  recurringFaults.map((fault, idx) => {
                    const max = recurringFaults[0].count;
                    const pct = Math.round((fault.count / max) * 100);
                    return (
                      <tr key={fault.name} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-panel-hover)] transition-none">
                        <td className="py-2 px-4 text-xs font-bold text-[var(--text-secondary)] tabular-nums">#{idx + 1}</td>
                        <td className="py-2 px-4 text-xs text-[var(--text-primary)] font-bold">{fault.name}</td>
                        <td className="py-2 px-4 text-xs text-[var(--text-primary)] text-right tabular-nums font-bold">{fault.count}</td>
                        <td className="py-2 px-4">
                          <div className="h-1.5 w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[var(--status-info)]"
                              style={{ width: `${pct}%` }}
                            />
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
  );
}
