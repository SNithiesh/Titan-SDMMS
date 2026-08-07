import React, { useState, useEffect } from 'react';
import { Building, Plus, Pencil, Trash2, X, Check, AlertTriangle, RefreshCw, Settings, Clock } from 'lucide-react';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment, fetchSettings, upsertSetting } from '../../api/erp.api.js';

export default function MasterDataManagement() {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [settingForm, setSettingForm] = useState({ key: '', value: '', description: '' });

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const loadDepartments = async () => {
    setLoading(true);
    try { const res = await fetchDepartments(); setDepartments(res.data.departments || []); }
    catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  const loadSettings = async () => {
    setLoading(true);
    try { const res = await fetchSettings(); setSettings(res.data.settings || []); }
    catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'departments') loadDepartments();
    if (activeTab === 'settings') loadSettings();
  }, [activeTab]);

  // ─── Department CRUD ────────────────────────────────────────────────────────
  const openAddDept = () => { setForm({ id: '', name: '', description: '' }); setModal('add-dept'); };
  const openEditDept = (d) => { setForm({ id: d.id, name: d.name, description: d.description || '' }); setModal('edit-dept'); };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'add-dept') { await createDepartment(form); flash('Department added.'); }
      else { await updateDepartment(form.id, form); flash('Department updated.'); }
      setModal(null);
      loadDepartments();
    } catch (err) { flash(err.response?.data?.message || err.message, true); }
  };

  const handleDeleteDept = async (d) => {
    if (!window.confirm(`Remove department "${d.name}"?`)) return;
    try { await deleteDepartment(d.id); flash('Department removed.'); loadDepartments(); }
    catch (err) { flash(err.response?.data?.message || err.message, true); }
  };

  // ─── Settings CRUD ──────────────────────────────────────────────────────────
  const handleSaveSetting = async (e) => {
    e.preventDefault();
    try {
      await upsertSetting(settingForm);
      flash('Setting saved.');
      setSettingForm({ key: '', value: '', description: '' });
      loadSettings();
    } catch (err) { flash(err.response?.data?.message || err.message, true); }
  };

  const editSetting = (s) => setSettingForm({ key: s.setting_key, value: s.setting_value, description: s.description || '' });

  const tabs = [
    { id: 'departments', label: 'Departments', icon: Building },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between bg-[var(--bg-panel)] p-3 border border-[var(--border-strong)]">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-[#107C10]" />
          <div>
            <h2 className="text-sm font-bold uppercase text-white">Master Data Management</h2>
            <p className="text-[9px] text-[var(--text-muted)]">Configure departments, locations and system settings</p>
          </div>
        </div>
        <button onClick={() => activeTab === 'departments' ? loadDepartments() : loadSettings()} className="p-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-white rounded-sm"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {error && <div className="flex items-center gap-2 bg-[#E81123]/20 border border-[#E81123] text-white p-2 text-xs"><AlertTriangle className="w-4 h-4 shrink-0 text-[#E81123]" />{error}</div>}
      {success && <div className="flex items-center gap-2 bg-[#107C10]/20 border border-[#107C10] text-white p-2 text-xs"><Check className="w-4 h-4 shrink-0 text-[#107C10]" />{success}</div>}

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-[var(--bg-panel)] p-2 border border-[var(--border-strong)]">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-sm ${activeTab === t.id ? 'bg-[var(--status-info)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-white'}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="flex justify-end">
            <button onClick={openAddDept} className="flex items-center gap-2 px-3 py-2 bg-[var(--status-info)] text-white text-xs font-bold hover:opacity-90 rounded-sm"><Plus className="w-4 h-4" />Add Department</button>
          </div>
          <div className="flex-1 bg-[var(--bg-panel)] border border-[var(--border-strong)] overflow-auto">
            {loading ? <div className="p-8 text-center text-xs text-[var(--text-muted)]">Loading...</div> : (
              <table className="w-full text-left">
                <thead className="bg-[var(--bg-app)] sticky top-0">
                  <tr className="text-[10px] uppercase text-[var(--text-secondary)] border-b border-[var(--border-strong)]">
                    <th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Description</th><th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {departments.map(d => (
                    <tr key={d.id} className="hover:bg-[var(--bg-app)] text-xs">
                      <td className="p-3 font-mono text-[var(--text-muted)]">{d.id}</td>
                      <td className="p-3 font-bold text-white">{d.name}</td>
                      <td className="p-3 text-[var(--text-secondary)]">{d.description || '-'}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditDept(d)} className="p-1.5 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--border-subtle)] rounded-sm"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteDept(d)} className="p-1.5 text-[var(--text-secondary)] hover:text-[#E81123] hover:bg-[#E81123]/20 rounded-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {/* Add/Edit Setting Form */}
          <form onSubmit={handleSaveSetting} className="bg-[var(--bg-panel)] border border-[var(--border-strong)] p-3 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Setting Key</label>
              <input required value={settingForm.key} onChange={e => setSettingForm({...settingForm, key: e.target.value})} placeholder="shift_1_start_time" className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)]" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Value</label>
              <input required value={settingForm.value} onChange={e => setSettingForm({...settingForm, value: e.target.value})} placeholder="06:00" className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)]" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Description</label>
              <input value={settingForm.description} onChange={e => setSettingForm({...settingForm, description: e.target.value})} placeholder="Optional description" className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)]" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full px-3 py-2 bg-[var(--status-info)] text-white text-xs font-bold hover:opacity-90 rounded-sm">Save Setting</button>
            </div>
          </form>

          <div className="flex-1 bg-[var(--bg-panel)] border border-[var(--border-strong)] overflow-auto">
            {loading ? <div className="p-8 text-center text-xs text-[var(--text-muted)]">Loading settings...</div> : settings.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">No settings configured yet. Use the form above to add one.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-[var(--bg-app)] sticky top-0">
                  <tr className="text-[10px] uppercase text-[var(--text-secondary)] border-b border-[var(--border-strong)]">
                    <th className="p-3">Key</th><th className="p-3">Value</th><th className="p-3">Description</th><th className="p-3">Updated</th><th className="p-3 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {settings.map(s => (
                    <tr key={s.setting_key} className="hover:bg-[var(--bg-app)] text-xs">
                      <td className="p-3 font-mono font-bold text-white">{s.setting_key}</td>
                      <td className="p-3 text-[var(--status-info)] font-bold">{s.setting_value}</td>
                      <td className="p-3 text-[var(--text-muted)]">{s.description || '-'}</td>
                      <td className="p-3 text-[var(--text-muted)]">{new Date(s.updated_at).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => editSetting(s)} className="p-1.5 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--border-subtle)] rounded-sm"><Pencil className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Department Modal */}
      {modal?.includes('dept') && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-strong)] bg-[var(--bg-app)]">
              <h3 className="text-sm font-bold text-white uppercase">{modal === 'add-dept' ? 'Add Department' : 'Edit Department'}</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-[var(--text-secondary)]" /></button>
            </div>
            <form onSubmit={handleDeptSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Dept ID</label>
                <input required disabled={modal === 'edit-dept'} value={form.id} onChange={e => setForm({...form, id: e.target.value})} placeholder="D5" className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)] disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Name</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Quality Control" className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)]" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Description</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional" className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white outline-none focus:border-[var(--status-info)]" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-strong)]">
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
