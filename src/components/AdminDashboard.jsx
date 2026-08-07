import React, { useState, useEffect } from 'react';
import { UserPlus, Pencil, Trash2, X, Check, Shield, AlertTriangle } from 'lucide-react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../api/user.api.js';

export default function AdminDashboard({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    role: 'Operator',
    department: '',
    discipline: '',
    password: ''
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await fetchUsers();
      setUsers(result.data.users);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      employeeId: '',
      name: '',
      role: 'Operator',
      department: 'Back Cover Dept',
      discipline: '',
      password: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      employeeId: user.employee_id,
      name: user.name,
      role: user.role,
      department: user.department || '',
      discipline: user.discipline || '',
      password: '' // Don't populate password on edit
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to completely remove user ${name}? This action cannot be undone.`)) {
      try {
        await deleteUser(id);
        setSuccess(`User ${name} deleted successfully.`);
        loadUsers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
        setSuccess('User updated successfully.');
      } else {
        await createUser(formData);
        setSuccess('User added successfully.');
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // Prevent non-admins from seeing the dashboard (just a safety check, App.jsx handles routing)
  if (currentUser?.role !== 'Admin') {
    return <div className="p-8 text-center text-[#E81123]">ACCESS DENIED. SYSTEM ADMINS ONLY.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] max-w-7xl mx-auto w-full p-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-[var(--bg-panel)] p-4 border border-[var(--border-strong)]">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#D83B01]" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">User Management</h2>
            <p className="text-[10px] text-[var(--text-secondary)]">Add, edit, or remove system access</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--status-info)] text-white text-xs font-bold hover:opacity-90 rounded-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 bg-[#E81123]/20 border border-[#E81123] text-white p-3 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#E81123]" /> {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-[#107C10]/20 border border-[#107C10] text-white p-3 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-[#107C10]" /> {success}
        </div>
      )}

      {/* Data Table */}
      <div className="flex-1 overflow-auto bg-[var(--bg-panel)] border border-[var(--border-strong)]">
        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--text-muted)]">Loading users...</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-app)] border-b border-[var(--border-strong)] text-[var(--text-secondary)] uppercase text-[10px] tracking-wider sticky top-0">
              <tr>
                <th className="p-3 font-semibold">Employee ID</th>
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Role</th>
                <th className="p-3 font-semibold hidden md:table-cell">Department</th>
                <th className="p-3 font-semibold hidden lg:table-cell">Last Login</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-strong)]">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-[var(--bg-app)]">
                  <td className="p-3 font-bold text-white">{user.employee_id}</td>
                  <td className="p-3 text-[var(--text-primary)]">{user.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase rounded-sm ${
                      user.role === 'Admin' ? 'bg-[#D83B01]/20 text-[#D83B01] border-[#D83B01]/50' :
                      user.role === 'Supervisor' ? 'bg-[#107C10]/20 text-[#107C10] border-[#107C10]/50' :
                      user.role === 'Technician' ? 'bg-[#0078D4]/20 text-[#0078D4] border-[#0078D4]/50' :
                      'bg-[var(--text-secondary)]/20 text-[var(--text-secondary)] border-[var(--text-secondary)]/50'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--text-secondary)] hidden md:table-cell">{user.department || '-'}</td>
                  <td className="p-3 text-[var(--text-muted)] hidden lg:table-cell">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(user)} className="p-1.5 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--border-subtle)] rounded-sm" title="Edit User">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(user.id, user.name)} className="p-1.5 text-[var(--text-secondary)] hover:text-[#E81123] hover:bg-[#E81123]/20 rounded-sm" title="Delete User">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-strong)] bg-[var(--bg-app)]">
              <h3 className="text-sm font-bold uppercase text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-secondary)] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Employee ID</label>
                  <input required type="text" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white focus:outline-none focus:border-[var(--status-info)]" placeholder="EMP-1234" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white focus:outline-none focus:border-[var(--status-info)]" placeholder="John Doe" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">System Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white focus:outline-none focus:border-[var(--status-info)]">
                    <option value="Operator">Operator</option>
                    <option value="Technician">Technician</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Admin">System Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Department</label>
                  <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white focus:outline-none focus:border-[var(--status-info)]" placeholder="Back Cover Dept" />
                </div>
              </div>

              {formData.role === 'Technician' && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Discipline (Technicians Only)</label>
                  <select value={formData.discipline} onChange={e => setFormData({...formData, discipline: e.target.value})} className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white focus:outline-none focus:border-[var(--status-info)]">
                    <option value="">Select Discipline...</option>
                    <option value="Mechanical Maintenance">Mechanical Maintenance</option>
                    <option value="Electrical Maintenance">Electrical Maintenance</option>
                    <option value="Automation Engineer">Automation</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">
                  {editingUser ? 'Reset Password (Leave blank to keep current)' : 'Initial Password'}
                </label>
                <input required={!editingUser} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[var(--bg-app)] border border-[var(--border-strong)] p-2 text-white focus:outline-none focus:border-[var(--status-info)]" placeholder="***" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border-strong)] mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-[var(--bg-app)] text-[var(--text-secondary)] font-bold hover:text-white border border-[var(--border-strong)] rounded-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[var(--status-info)] text-white font-bold hover:opacity-90 rounded-sm">
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
