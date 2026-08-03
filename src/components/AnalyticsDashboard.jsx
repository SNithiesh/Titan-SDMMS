import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

export default function AnalyticsDashboard({ complaints }) {
  // Machine failure counts
  const machineBreakdownData = [
    { name: 'HP01 (Press 01)', breakdowns: 4, downtime: 140 },
    { name: 'HP02 (Press 02)', breakdowns: 7, downtime: 290 },
    { name: 'HP03 (Press 03)', breakdowns: 2, downtime: 65 },
    { name: 'CY01 (Conveyor)', breakdowns: 3, downtime: 45 },
    { name: 'BF01 (Bowl Feeder)', breakdowns: 5, downtime: 110 },
    { name: 'HPU01 (Hydraulics)', breakdowns: 3, downtime: 95 }
  ];

  // Category distribution
  const categoryDistributionData = [
    { name: 'Mechanical', value: 45, color: '#f59e0b' },
    { name: 'Electrical', value: 25, color: '#3b82f6' },
    { name: 'Automation/PLC', value: 15, color: '#10b981' },
    { name: 'Sensors', value: 10, color: '#a855f7' },
    { name: 'Vision / Quality', value: 5, color: '#ec4899' }
  ];

  // Downtime trend over weeks
  const downtimeTrendData = [
    { week: 'Week 1', hours: 18.5 },
    { week: 'Week 2', hours: 14.2 },
    { week: 'Week 3', hours: 22.0 },
    { week: 'Week 4', hours: 9.4 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Back Cover Department Maintenance Analytics
          </h2>
          <p className="text-xs text-slate-400">Titan Industries Plant Performance & MTTR / MTBF Insights</p>
        </div>
        <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold rounded-full">
          Industrial KPIs
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Machine Breakdown Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Machine-Wise Failure Frequency
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineBreakdownData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="breakdowns" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fault Category Distribution Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Fault Category Distribution (%)
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2 text-[11px]">
            {categoryDistributionData.map((item) => (
              <span key={item.name} className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                {item.name} ({item.value}%)
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Downtime Trend Line Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          Weekly Line Downtime Trend (Hours)
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={downtimeTrendData}>
              <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="hours" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
