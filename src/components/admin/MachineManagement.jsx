import React, { useState, useEffect, useCallback } from 'react';
import { HardDrive, Plus, Pencil, Trash2, Search, RefreshCw, X, Check, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchMachines, createMachine, updateMachine, deleteMachine } from '../../api/erp.api.js';

const MACHINE_TYPES = ['Friction Press', 'Hydraulic Press', 'Crank Press', 'Conveyor', 'Bowl Feeder', 'Robot', 'Other'];
const STATUSES = ['Operational', 'Needs Maintenance', 'Under Repair', 'Offline'];
const CRITICALITY = ['Low', 'Medium', 'High', 'Critical'];

const emptyForm = { id: '', name: '', code: '', location: '', type: 'Friction Press', status: 'Operational', criticality: 'High' };

export default function MachineManagement() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', data: {} }
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchMachines({ page, limit: 15, search, type: filterType, status: filterStatus });
      setMachines(res.data.machines || []);
      setTotalPages(res.data.totalPages || 1);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  }, [page, search, filterType, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const openAdd = () => { setForm(emptyForm); setModal({ mode: 'add' }); };
  const openEdit = (m) => { setForm({ id: m.id, name: m.name, code: m.code, location: m.location, type: m.type, status: m.status, criticality: m.criticality }); setModal({ mode: 'edit', data: m }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.mode === 'add') {
        if (!form.id) { flash('Machine ID is required.', true); return; }
        await createMachine(form);
        flash('Machine added successfully.');
      } else {
        await updateMachine(modal.data.id, form);
        flash('Machine updated successfully.');
      }
      setModal(null);
      load();
    } catch (err) { flash(err.response?.data?.message || err.message, true); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Archive machine "${name}"?`)) return;
    try { await deleteMachine(id); flash('Machine archived.'); load(); }
    catch (err) { flash(err.response?.data?.message || err.message, true); }
  };

  const statusColor = (s) => s === 'Operational' ? 'text-[#107C10]' : s === 'Needs Maintenance' ? 'text-[#D83B01]' : 'text-[#E81123]';

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between bg-[var(--bg-panel)] p-3 border border-[var(--border-strong)]">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-[#D83B01]" />
          <div>
            <h2 className="text-sm font-bold uppercase text-white">Asset / Machine Management</h2>
            <p className="text-[9px] text-[var(--text-muted)]">Add, edit, and archive production assets</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-white rounded-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={openAdd} className="flex items-center gap-2 px-3 py-2 bg-[var(--status-info)] text-white text-xs font-bold hover:opacity-90 rounded-sm"><Plus className="w-4 h-4" />Add Machine</button>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 bg-[#E81123]/20 border border-[#E81123] text-white p-2 text-xs"><AlertTriangle className="w-4 h-4 text-[#E81123] shrink-0" />{error}</div>}
      {success && <div className="flex items-center gap-2 bg-[#107C10]/20 border border-[#107C10] text-white p-2 text-xs"><Check className="w-4 h-4 text-[#107C10] shrink-0" />{success}</div>}

      <div className="flex flex-wrap items-center gap-2 bg-[var(--bg-panel)] p-3 border border-[var(--border-strong)]">
        <div className="flex items-center gap-1 flex-1 min-w-[160px] bg-[var(--bg-app)] border border-[var(--border-strong)] px-2">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search ID, name, code, location..." className="flex-1 bg-transparent p-1.5 text-xs text-white outline-none" />
        </div>
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }} className="bg-[var(--bg-app)] border border-[var(--border-strong)] text-xs text-white p-1.5 outline-none">
          <option value="">All Types</option>
          {MACHINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="bg-[var(--bg-app)] border border-[var(--border-strong)] text-xs text-white p-1.5 outline-none">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex-1 bg-[var(--bg-panel)] border border-[var(--border-strong)] overflow-auto">
        {loading ? <div className="p-8 text-center text-xs text-[var(--text-muted)]">Loading assets...</div> : machines.length === 0 ? <div className="p-8 text-center text-xs text-[var(--text-muted)]">No assets found.</div> : (
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-[var(--bg-app)] sticky top-0 z-10">
              <tr className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-strong)]">
                <th className="p-2.5">Asset ID</th><th className="p-2.5">Name</th><th className="p-2.5">Code</th>
                <th className="p-2.5">Type</th><th className="p-2.5">Location</th>
                <th className="p-2.5">Status</th><th className="p-2.5">Criticality</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {machines.map(m => (
                <tr key={m.id} className="hover:bg-[var(--bg-app)]">
                  <td className="p-2.5 text-[10px] font-mono text-[var(--text-secondary)]">{m.id}</td>
                  <td className="p-2.5 text-xs font-bold text-white max-w-[160px] truncate">{m.name}</td>
                  <td className="p-2.5 text-[10px] font-mono text-[var(--text-muted)]">{m.code}</td>
                  <td className="p-2.5 text-xs text-[var(--text-secondary)]">{m.type}</td>
                  <td className="p-2.5 text-xs text-[var(--text-muted)] max-w-[140px] truncate">{m.location}</td>
                  <td className={`p-2.5 text-xs font-bold ${statusColor(m.status)}`}>{m.status}</td>
                  <td className="p-2.5 text-xs text-[var(--text-secondary)]">{m.criticality}</td>
                  <td className="p-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(m)} className="p-1.5 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--border-subtle)] rounded-sm"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(m.id, m.name)} className="p-1.5 text-[var(--text-secondary)] hover:text-[#E81123] hover:bg-[#E81123]/20 rounded-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
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

      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-strong)] bg-[var(--bg-app)]">
              <h3 className="text-sm font-bold text-white uppercase">{modal.mode === 'add' ? 'Add New Machine' : `Edit — ${modal.data?.name}`}</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-[var(--text-secondary)]" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 grid grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Asset ID', key: 'id', placeholder: 'M-6036001', disabled: modal.mode === 'edit' },
                { label: 'Name', key: 'name', placeholder: 'Friction Press 6036001' },
                { label: 'Code', key: 'code', placeholder: '6036001' },
                { label: 'Location', key: 'location', placeholder: 'Line 1 - Friction Bay' },
              ].map(f => (
                <div key={f.key} className={f.label === 'Location' ? 'col-span-2' : ''}>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">{f.label}</label>
                  <input required disabled={f.disabled} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder} className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)] disabled:opacity-50" />
                </div>
              ))}
              {[
                { label: 'Type', key: 'type', options: MACHINE_TYPES },
                { label: 'Status', key: 'status', options: STATUSES },
                { label: 'Criticality', key: 'criticality', options: CRITICALITY },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">{f.label}</label>
                  <select value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)]">
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-[var(--border-strong)] mt-1">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-secondary)] font-bold hover:text-white rounded-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[var(--status-info)] text-white font-bold hover:opacity-90 rounded-sm">{modal.mode === 'add' ? 'Add Machine' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
