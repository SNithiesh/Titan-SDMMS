import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAuditLogs } from '../../api/erp.api.js';

const actionColor = (action) => {
  switch (action) {
    case 'CREATE': return 'bg-[#107C10]/20 text-[#107C10] border-[#107C10]/50';
    case 'UPDATE': return 'bg-[#0078D4]/20 text-[#0078D4] border-[#0078D4]/50';
    case 'DELETE': case 'ARCHIVE': return 'bg-[#E81123]/20 text-[#E81123] border-[#E81123]/50';
    case 'RESTORE': return 'bg-[#D83B01]/20 text-[#D83B01] border-[#D83B01]/50';
    default: return 'bg-[var(--text-secondary)]/20 text-[var(--text-secondary)] border-[var(--text-secondary)]/50';
  }
};

export default function AuditLogView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchAuditLogs({ page, limit: 30, search });
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setLogs([]);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between bg-[var(--bg-panel)] p-3 border border-[var(--border-strong)]">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#0078D4]" />
          <div>
            <h2 className="text-sm font-bold uppercase text-white">Audit Log Ledger</h2>
            <p className="text-[9px] text-[var(--text-muted)]">Complete chronological record of all administrative actions</p>
          </div>
        </div>
        <button onClick={load} className="p-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-white rounded-sm"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="flex items-center gap-2 bg-[var(--bg-panel)] p-3 border border-[var(--border-strong)]">
        <div className="flex items-center gap-1 flex-1 bg-[var(--bg-app)] border border-[var(--border-strong)] px-2">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by user, action, or entity type..." className="flex-1 bg-transparent p-1.5 text-xs text-white outline-none" />
        </div>
      </div>

      <div className="flex-1 bg-[var(--bg-panel)] border border-[var(--border-strong)] overflow-auto">
        {loading ? <div className="p-8 text-center text-xs text-[var(--text-muted)]">Loading audit logs...</div> : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--text-muted)]">No audit logs found.</div>
        ) : (
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-[var(--bg-app)] sticky top-0 z-10">
              <tr className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-strong)]">
                <th className="p-2.5">#</th>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">User (Emp ID)</th>
                <th className="p-2.5">Action</th>
                <th className="p-2.5">Entity Type</th>
                <th className="p-2.5">Entity ID</th>
                <th className="p-2.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-[var(--bg-app)]">
                  <td className="p-2.5 text-[10px] font-mono text-[var(--text-muted)]">{log.id}</td>
                  <td className="p-2.5 text-[10px] text-[var(--text-muted)] whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="p-2.5 text-xs font-bold text-white">{log.user_employee_id}</td>
                  <td className="p-2.5">
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold border rounded-sm ${actionColor(log.action)}`}>{log.action}</span>
                  </td>
                  <td className="p-2.5 text-xs text-[var(--text-secondary)]">{log.entity_type}</td>
                  <td className="p-2.5 text-[10px] font-mono text-[var(--text-muted)]">{log.entity_id}</td>
                  <td className="p-2.5 text-[10px] text-[var(--text-muted)]">{log.ip_address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] bg-[var(--bg-panel)] p-2 border border-[var(--border-strong)]">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 border border-[var(--border-strong)] hover:bg-[var(--border-subtle)] disabled:opacity-40 rounded-sm"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 border border-[var(--border-strong)] hover:bg-[var(--border-subtle)] disabled:opacity-40 rounded-sm"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
