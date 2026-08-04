import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsDashboard({ complaints }) {
  const machineFaults = complaints.reduce((acc, c) => {
    acc[c.machineName] = (acc[c.machineName] || 0) + 1;
    return acc;
  }, {});
  
  const barData = Object.keys(machineFaults).map(key => ({
    name: key,
    faults: machineFaults[key]
  }));

  const priorityData = complaints.reduce((acc, c) => {
    acc[c.priority] = (acc[c.priority] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(priorityData).map(key => ({
    name: key,
    value: priorityData[key]
  }));

  const COLORS = {
    'Critical': '#E81123',
    'High': '#D83B01',
    'Medium': 'var(--status-info)',
    'Low': '#107C10'
  };

  const completedComplaints = complaints.filter(c => c.status === 'Completed' || c.status === 'Closed');
  const avgResolutionTime = completedComplaints.length > 0 
    ? Math.round(completedComplaints.reduce((acc, c) => {
        if(c.completedTime && c.timestamp) {
          return acc + (new Date(c.completedTime) - new Date(c.timestamp)) / 60000;
        }
        return acc;
      }, 0) / completedComplaints.length)
    : 0;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] max-w-7xl mx-auto w-full">
      <div className="p-3 bg-[var(--bg-panel)] border-b border-[var(--border-strong)]">
        <h1 className="text-sm font-bold uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[var(--status-info)]" />
          Plant Performance Analytics
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        {/* Top KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] p-4">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mb-1">Total Reported Faults</div>
            <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{complaints.length}</div>
          </div>
          <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] p-4">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mb-1">Mean Time To Repair (MTTR)</div>
            <div className="text-2xl font-bold font-mono text-[var(--status-info)]">{avgResolutionTime} mins</div>
          </div>
          <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] p-4">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mb-1">Completion Rate</div>
            <div className="text-2xl font-bold font-mono text-[#107C10]">
              {complaints.length > 0 ? Math.round((completedComplaints.length / complaints.length) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[400px]">
          {/* Bar Chart */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] flex flex-col">
            <div className="px-4 py-2 border-b border-[var(--border-strong)] bg-[var(--bg-panel)] text-[10px] font-bold text-[var(--text-secondary)] uppercase">
              Faults per Machine
            </div>
            <div className="flex-1 p-4 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} tickMargin={10} />
                  <YAxis stroke="var(--text-secondary)" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-strong)', borderRadius: '2px', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="faults" fill="var(--status-info)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] flex flex-col">
            <div className="px-4 py-2 border-b border-[var(--border-strong)] bg-[var(--bg-panel)] text-[10px] font-bold text-[var(--text-secondary)] uppercase">
              Fault Distribution by Priority
            </div>
            <div className="flex-1 p-4 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || 'var(--text-muted)'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-strong)', borderRadius: '2px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
