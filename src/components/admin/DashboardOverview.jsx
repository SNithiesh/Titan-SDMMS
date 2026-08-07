import React, { useState, useEffect } from 'react';
import { Shield, Activity, Users, HardDrive, AlertTriangle } from 'lucide-react';
import apiClient from '../../api/apiClient';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    users: 0,
    machines: 0,
    activeFaults: 0,
    systemStatus: 'ONLINE'
  });
  const [loading, setLoading] = useState(true);

  // In a real app, this would fetch from /api/admin/stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulating an API call for now
        setTimeout(() => {
          setStats({
            users: 12,
            machines: 145,
            activeFaults: 3,
            systemStatus: 'SECURE'
          });
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error("Failed to load admin stats");
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-[var(--text-muted)]">Loading Admin Telemetry...</div>;
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="bg-[var(--bg-panel)] p-4 border border-[var(--border-strong)]">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#107C10]" />
          System Telemetry
        </h2>
        <p className="text-[10px] text-[var(--text-secondary)] mt-1">Live overview of ERP health and database metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Registered Users</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">{stats.users}</div>
          </div>
          <Users className="w-8 h-8 text-[var(--border-subtle)] opacity-50" />
        </div>

        <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Total Assets</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">{stats.machines}</div>
          </div>
          <HardDrive className="w-8 h-8 text-[var(--border-subtle)] opacity-50" />
        </div>

        <div className="bg-[var(--bg-panel)] border border-[#E81123]/50 p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-[#E81123] uppercase">Active Faults</div>
            <div className="text-2xl font-bold text-[#E81123] font-mono mt-1">{stats.activeFaults}</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-[#E81123] opacity-50" />
        </div>

        <div className="bg-[var(--bg-panel)] border border-[#107C10]/50 p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-[#107C10] uppercase">System Integrity</div>
            <div className="text-xl font-bold text-[#107C10] font-mono mt-2">{stats.systemStatus}</div>
          </div>
          <Shield className="w-8 h-8 text-[#107C10] opacity-50" />
        </div>

      </div>

      {/* Placeholder for Audit Logs preview */}
      <div className="flex-1 bg-[var(--bg-panel)] border border-[var(--border-strong)] flex flex-col min-h-0">
        <div className="p-3 border-b border-[var(--border-strong)] bg-[var(--bg-app)]">
          <h3 className="text-[11px] font-bold uppercase text-white">Recent Audit Logs</h3>
        </div>
        <div className="flex-1 p-4 overflow-auto flex items-center justify-center">
          <span className="text-xs text-[var(--text-muted)] italic">Audit Log Ledger will render here.</span>
        </div>
      </div>

    </div>
  );
}
