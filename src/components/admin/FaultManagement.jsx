import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Pencil, Trash2, X, Check, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { fetchFaultCategories, createFaultCategory, updateFaultCategory, deleteFaultCategory, fetchFaultTypes, createFaultType, updateFaultType, deleteFaultType } from '../../api/erp.api.js';

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function FaultManagement() {
  const [categories, setCategories] = useState([]);
  const [faultTypes, setFaultTypes] = useState({});
  const [expandedCat, setExpandedCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetchFaultCategories();
      setCategories(res.data.categories || []);
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCategories(); }, []);

  const loadFaultTypes = async (catId) => {
    if (faultTypes[catId]) return;
    try {
      const res = await fetchFaultTypes(catId);
      setFaultTypes(prev => ({ ...prev, [catId]: res.data.types || [] }));
    } catch {}
  };

  const toggleExpand = (catId) => {
    if (expandedCat === catId) { setExpandedCat(null); return; }
    setExpandedCat(catId);
    loadFaultTypes(catId);
  };

  const refreshTypes = async (catId) => {
    try {
      const res = await fetchFaultTypes(catId);
      setFaultTypes(prev => ({ ...prev, [catId]: res.data.types || [] }));
    } catch {}
  };

  // ─── Category Actions ──────────────────────────────────────────────────────
  const openAddCategory = () => {
    setForm({ id: '', name: '', description: '' });
    setModal({ type: 'add-category' });
  };
  const openEditCategory = (cat) => {
    setForm({ id: cat.id, name: cat.name, description: cat.description || '' });
    setModal({ type: 'edit-category', data: cat });
  };
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.type === 'add-category') {
        if (!form.id) { flash('Category ID is required', true); return; }
        await createFaultCategory(form);
        flash('Category added.');
      } else {
        await updateFaultCategory(modal.data.id, form);
        flash('Category updated.');
      }
      setModal(null);
      loadCategories();
    } catch (err) { flash(err.response?.data?.message || err.message, true); }
  };
  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? This will fail if it has fault types.`)) return;
    try { await deleteFaultCategory(cat.id); flash('Category removed.'); loadCategories(); }
    catch (err) { flash(err.response?.data?.message || err.message, true); }
  };

  // ─── Fault Type Actions ────────────────────────────────────────────────────
  const openAddFaultType = (catId) => {
    setForm({ id: '', category_id: catId, name: '', default_priority: 'Medium' });
    setModal({ type: 'add-fault-type', catId });
  };
  const openEditFaultType = (ft) => {
    setForm({ id: ft.id, category_id: ft.category_id, name: ft.name, default_priority: ft.default_priority });
    setModal({ type: 'edit-fault-type', data: ft });
  };
  const handleFaultTypeSubmit = async (e) => {
    e.preventDefault();
    const catId = form.category_id;
    try {
      if (modal.type === 'add-fault-type') {
        if (!form.id) { flash('Fault Type ID is required', true); return; }
        await createFaultType(form);
        flash('Fault type added.');
      } else {
        await updateFaultType(modal.data.id, form);
        flash('Fault type updated.');
      }
      setModal(null);
      setFaultTypes(prev => ({ ...prev, [catId]: undefined }));
      refreshTypes(catId);
    } catch (err) { flash(err.response?.data?.message || err.message, true); }
  };
  const handleDeleteFaultType = async (ft) => {
    if (!window.confirm(`Remove fault type "${ft.name}"?`)) return;
    try { await deleteFaultType(ft.id); flash('Fault type removed.'); refreshTypes(ft.category_id); }
    catch (err) { flash(err.response?.data?.message || err.message, true); }
  };

  const isCategory = modal?.type?.includes('category');

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between bg-[var(--bg-panel)] p-3 border border-[var(--border-strong)]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#D83B01]" />
          <div>
            <h2 className="text-sm font-bold uppercase text-white">Fault Configuration</h2>
            <p className="text-[9px] text-[var(--text-muted)]">Manage fault categories and fault types</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={loadCategories} className="p-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-white rounded-sm"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={openAddCategory} className="flex items-center gap-2 px-3 py-2 bg-[var(--status-info)] text-white text-xs font-bold hover:opacity-90 rounded-sm"><Plus className="w-4 h-4" />Add Category</button>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 bg-[#E81123]/20 border border-[#E81123] text-white p-2 text-xs"><AlertTriangle className="w-4 h-4 text-[#E81123] shrink-0" />{error}</div>}
      {success && <div className="flex items-center gap-2 bg-[#107C10]/20 border border-[#107C10] text-white p-2 text-xs"><Check className="w-4 h-4 text-[#107C10] shrink-0" />{success}</div>}

      <div className="flex-1 overflow-auto space-y-2">
        {loading ? <div className="p-8 text-center text-xs text-[var(--text-muted)]">Loading fault configuration...</div> :
          categories.map(cat => (
          <div key={cat.id} className="bg-[var(--bg-panel)] border border-[var(--border-strong)]">
            {/* Category Row */}
            <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => toggleExpand(cat.id)}>
              <div className="flex items-center gap-2">
                {expandedCat === cat.id ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
                <span className="text-sm font-bold text-white">{cat.name}</span>
                <span className="text-[9px] text-[var(--text-muted)] font-mono bg-[var(--bg-app)] px-1.5 py-0.5">{cat.id}</span>
                {cat.description && <span className="text-xs text-[var(--text-muted)]">— {cat.description}</span>}
              </div>
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => openAddFaultType(cat.id)} className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[10px] text-[var(--text-secondary)] hover:text-white rounded-sm"><Plus className="w-3 h-3" />Add Fault</button>
                <button onClick={() => openEditCategory(cat)} className="p-1.5 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--border-subtle)] rounded-sm"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDeleteCategory(cat)} className="p-1.5 text-[var(--text-secondary)] hover:text-[#E81123] hover:bg-[#E81123]/20 rounded-sm"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Fault Types (expandable) */}
            {expandedCat === cat.id && (
              <div className="border-t border-[var(--border-subtle)]">
                {!faultTypes[cat.id] ? (
                  <div className="p-3 text-xs text-[var(--text-muted)] pl-10">Loading fault types...</div>
                ) : faultTypes[cat.id].length === 0 ? (
                  <div className="p-3 text-xs text-[var(--text-muted)] pl-10">No fault types. Click "Add Fault" to add one.</div>
                ) : faultTypes[cat.id].map(ft => (
                  <div key={ft.id} className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)] last:border-0 pl-10 hover:bg-[var(--bg-app)]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white">{ft.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${ft.default_priority === 'Critical' ? 'bg-[#E81123]/20 text-[#E81123]' : ft.default_priority === 'High' ? 'bg-[#D83B01]/20 text-[#D83B01]' : 'bg-[var(--border-subtle)] text-[var(--text-secondary)]'}`}>{ft.default_priority}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditFaultType(ft)} className="p-1 text-[var(--text-secondary)] hover:text-white rounded-sm"><Pencil className="w-3 h-3" /></button>
                      <button onClick={() => handleDeleteFaultType(ft)} className="p-1 text-[var(--text-secondary)] hover:text-[#E81123] rounded-sm"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-strong)] bg-[var(--bg-app)]">
              <h3 className="text-sm font-bold text-white uppercase">
                {modal.type === 'add-category' ? 'Add Category' : modal.type === 'edit-category' ? 'Edit Category' : modal.type === 'add-fault-type' ? 'Add Fault Type' : 'Edit Fault Type'}
              </h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-[var(--text-secondary)]" /></button>
            </div>
            <form onSubmit={isCategory ? handleCategorySubmit : handleFaultTypeSubmit} className="p-4 space-y-3 text-xs">
              {isCategory ? (
                <>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Category ID</label>
                    <input required disabled={modal.type === 'edit-category'} value={form.id} onChange={e => setForm({...form, id: e.target.value})} placeholder="mechanical" className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)] disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Category Name</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Mechanical Maintenance" className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)]" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Description</label>
                    <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description" className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)]" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Fault Type ID</label>
                    <input required disabled={modal.type === 'edit-fault-type'} value={form.id} onChange={e => setForm({...form, id: e.target.value})} placeholder="m1" className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)] disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Fault Name</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="TDC Problem" className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)]" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Default Priority</label>
                    <select value={form.default_priority} onChange={e => setForm({...form, default_priority: e.target.value})} className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)]">
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-strong)] mt-2">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-secondary)] font-bold hover:text-white rounded-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[var(--status-info)] text-white font-bold hover:opacity-90 rounded-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
