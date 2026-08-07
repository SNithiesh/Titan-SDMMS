import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Search, RefreshCw, Pencil, Trash2, RotateCcw, X, Check, ChevronLeft, ChevronRight, AlertTriangle, Filter } from 'lucide-react';
import { fetchComplaints, updateComplaint, deleteComplaint, restoreComplaint } from '../../api/erp.api.js';

const STATUSES = ['New', 'Assigned', 'Accepted', 'Repair Started', 'Completed', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const priorityColor = (p) => p === 'Critical' ? 'text-[#E81123]' : p === 'High' ? 'text-[#D83B01]' : p === 'Medium' ? 'text-[#0078D4]' : 'text-[var(--text-secondary)]';
const statusColor = (s) => {
  switch(s) {
    case 'Closed': return 'bg-[#107C10]/20 text-[#107C10] border-[#107C10]/50';
    case 'Completed': return 'bg-[#0078D4]/20 text-[#0078D4] border-[#0078D4]/50';
    case 'Repair Started': return 'bg-[#D83B01]/20 text-[#D83B01] border-[#D83B01]/50';
    case 'Assigned': return 'bg-[#0078D4]/20 text-[#0078D4] border-[#0078D4]/50';
    default: return 'bg-[var(--text-secondary)]/20 text-[var(--text-secondary)] border-[var(--text-secondary)]/50';
  }
};

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchComplaints({ page, limit: 15, search, status: filterStatus, priority: filterPriority, showDeleted });
      setComplaints(res.data.complaints || []);
      setTotalPages(res.data.totalPages || 1);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus, filterPriority, showDeleted]);

  useEffect(() => { loadComplaints(); }, [loadComplaints]);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const handleEdit = (c) => {
    setEditingComplaint(c);
    setEditForm({ status: c.status, priority: c.priority, assigned_technician: c.assigned_technician || '', remarks: c.remarks || '' });
  };

  const handleSaveEdit = async () => {
    try {
      await updateComplaint(editingComplaint.id, editForm);
      flash('Complaint updated successfully.');
      setEditingComplaint(null);
      loadComplaints();
    } catch (err) {
      flash(err.response?.data?.message || err.message, true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this complaint? It can be restored later.')) return;
    try {
      await deleteComplaint(id);
      flash('Complaint archived.');
      loadComplaints();
    } catch (err) {
      flash(err.response?.data?.message || err.message, true);
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreComplaint(id);
      flash('Complaint restored.');
      loadComplaints();
    } catch (err) {
      flash(err.response?.data?.message || err.message, true);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between bg-[var(--bg-panel)] p-3 border border-[var(--border-strong)]">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#0078D4]" />
          <div>
            <h2 className="text-sm font-bold uppercase text-white">Complaint Management</h2>
            <p className="text-[9px] text-[var(--text-muted)]">View, edit, archive and restore all complaints</p>
          </div>
        </div>
        <button onClick={loadComplaints} className="p-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-white rounded-sm">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Alerts */}
      {error && <div className="flex items-center gap-2 bg-[#E81123]/20 border border-[#E81123] text-white p-2 text-xs"><AlertTriangle className="w-4 h-4 text-[#E81123] shrink-0" />{error}</div>}
      {success && <div className="flex items-center gap-2 bg-[#107C10]/20 border border-[#107C10] text-white p-2 text-xs"><Check className="w-4 h-4 text-[#107C10] shrink-0" />{success}</div>}

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-[var(--bg-panel)] p-3 border border-[var(--border-strong)]">
        <div className="flex items-center gap-1 flex-1 min-w-[180px] bg-[var(--bg-app)] border border-[var(--border-strong)] px-2">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search ID, machine, fault, operator..."
            className="flex-1 bg-transparent p-1.5 text-xs text-white outline-none"
          />
        </div>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="bg-[var(--bg-app)] border border-[var(--border-strong)] text-xs text-white p-1.5 outline-none">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(1); }} className="bg-[var(--bg-app)] border border-[var(--border-strong)] text-xs text-white p-1.5 outline-none">
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} className="accent-[#D83B01]" />
          Show Archived
        </label>
      </div>

      {/* Table */}
      <div className="flex-1 bg-[var(--bg-panel)] border border-[var(--border-strong)] overflow-auto">
        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--text-muted)]">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--text-muted)]">No complaints found for current filters.</div>
        ) : (
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-[var(--bg-app)] sticky top-0 z-10">
              <tr className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-strong)]">
                <th className="p-2.5 font-semibold">ID</th>
                <th className="p-2.5 font-semibold">Machine</th>
                <th className="p-2.5 font-semibold">Fault</th>
                <th className="p-2.5 font-semibold">Priority</th>
                <th className="p-2.5 font-semibold">Status</th>
                <th className="p-2.5 font-semibold">Operator</th>
                <th className="p-2.5 font-semibold">Created</th>
                <th className="p-2.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {complaints.map(c => (
                <tr key={c.id} className={`hover:bg-[var(--bg-app)] ${c.is_deleted ? 'opacity-50' : ''}`}>
                  <td className="p-2.5 text-[10px] font-mono text-[var(--text-secondary)]">{c.id}</td>
                  <td className="p-2.5 text-xs font-bold text-white max-w-[140px] truncate">{c.machine_name}</td>
                  <td className="p-2.5 text-xs text-[var(--text-secondary)] max-w-[160px] truncate">{c.fault_name}</td>
                  <td className={`p-2.5 text-xs font-bold ${priorityColor(c.priority)}`}>{c.priority}</td>
                  <td className="p-2.5">
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold border rounded-sm ${statusColor(c.status)}`}>{c.status}</span>
                  </td>
                  <td className="p-2.5 text-xs text-[var(--text-muted)]">{c.operator_name}</td>
                  <td className="p-2.5 text-[10px] text-[var(--text-muted)]">{c.created_time ? new Date(c.created_time).toLocaleDateString() : '-'}</td>
                  <td className="p-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {c.is_deleted ? (
                        <button onClick={() => handleRestore(c.id)} className="p-1.5 text-[#107C10] hover:bg-[#107C10]/20 rounded-sm" title="Restore"><RotateCcw className="w-3.5 h-3.5" /></button>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(c)} className="p-1.5 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--border-subtle)] rounded-sm" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 text-[var(--text-secondary)] hover:text-[#E81123] hover:bg-[#E81123]/20 rounded-sm" title="Archive"><Trash2 className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] bg-[var(--bg-panel)] p-2 border border-[var(--border-strong)]">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 border border-[var(--border-strong)] hover:bg-[var(--border-subtle)] disabled:opacity-40 rounded-sm"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 border border-[var(--border-strong)] hover:bg-[var(--border-subtle)] disabled:opacity-40 rounded-sm"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingComplaint && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-strong)] bg-[var(--bg-app)]">
              <h3 className="text-sm font-bold text-white uppercase">Edit Complaint — {editingComplaint.id}</h3>
              <button onClick={() => setEditingComplaint(null)}><X className="w-5 h-5 text-[var(--text-secondary)]" /></button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)]">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Priority</label>
                  <select value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})} className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)]">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Assigned Technician</label>
                <input value={editForm.assigned_technician} onChange={e => setEditForm({...editForm, assigned_technician: e.target.value})} className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)]" placeholder="Technician name..." />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Admin Remarks</label>
                <textarea value={editForm.remarks} onChange={e => setEditForm({...editForm, remarks: e.target.value})} rows={3} className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)] resize-none" placeholder="Add administrative notes..." />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-strong)]">
                <button onClick={() => setEditingComplaint(null)} className="px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-secondary)] font-bold hover:text-white rounded-sm">Cancel</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-[var(--status-info)] text-white font-bold hover:opacity-90 rounded-sm">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
