import React, { useState } from 'react';
import { FAULT_CATEGORIES, MACHINES } from '../mockData';
import { CheckCircle2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function ComplaintForm({ onSubmitSuccess }) {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    categoryId: '',
    machineId: '',
    faultName: '',
    priority: 'Medium',
    shift: 'Shift 1 (06:00 - 14:00)',
    description: ''
  });
  const [status, setStatus] = useState(null);

  const [machineSearch, setMachineSearch] = useState('');
  const [faultSearch, setFaultSearch] = useState('');

  // Allow selection of any machine regardless of fault category
  const availableMachines = MACHINES;
  
  // Get available faults based on selected category
  const selectedCategoryData = FAULT_CATEGORIES.find(c => c.id === formData.categoryId);
  const availableFaults = selectedCategoryData ? selectedCategoryData.faults : [];

  const handleMachineSearch = () => {
    if (!machineSearch) return;
    const match = availableMachines.find(m => m.name.toLowerCase().includes(machineSearch.toLowerCase()) || m.code.toLowerCase().includes(machineSearch.toLowerCase()));
    if (match) {
      setFormData({ ...formData, machineId: match.id });
    } else {
      alert("No machine found matching: " + machineSearch);
    }
  };

  const handleFaultSearch = () => {
    if (!faultSearch) return;
    const match = availableFaults.find(f => f.name.toLowerCase().includes(faultSearch.toLowerCase()));
    if (match) {
      setFormData({ ...formData, faultName: match.name });
    } else {
      alert("No fault found matching: " + faultSearch);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.machineId || !formData.faultName) return;

    const machine = MACHINES.find((m) => m.id === formData.machineId);
    const category = FAULT_CATEGORIES.find((c) => c.id === machine?.categoryId);

    const newComplaint = {
      id: `CMP-${Date.now().toString().slice(-6)}`,
      categoryId: category?.id,
      categoryName: category?.name,
      machineId: machine?.id,
      machineName: machine?.name,
      faultName: formData.faultName,
      priority: formData.priority,
      shift: formData.shift,
      status: 'Open',
      operatorName: currentUser?.name || 'Unknown',
      operatorEmployeeId: currentUser?.employeeId || 'EMP-0000',
      description: formData.description,
      timestamp: new Date().toISOString()
    };

    onSubmitSuccess(newComplaint);
    setStatus('success');
    
    // Reset form after short delay
    setTimeout(() => {
      setStatus(null);
      setFormData({
        categoryId: '',
        machineId: '',
        faultName: '',
        priority: 'Medium',
        shift: 'Shift 1 (06:00 - 14:00)',
        description: ''
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)]">
      <div className="px-4 py-2 border-b border-[var(--border-strong)] bg-[var(--bg-panel)] flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
          New Maintenance Request
        </h2>
        {status === 'success' && (
          <span className="flex items-center gap-1 text-[10px] text-[#107C10] font-bold uppercase bg-[#107C10]/10 px-2 py-0.5 border border-[#107C10]">
            <CheckCircle2 className="w-3 h-3" /> Request Submitted
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        
        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase mb-1">
              Machine / Asset <span className="text-[#E81123]">*</span>
            </label>
            <div className="flex flex-col gap-2">
              <select
                required
                value={formData.machineId}
                onChange={(e) => {
                  const mId = e.target.value;
                  const machine = availableMachines.find(m => m.id === mId);
                  setFormData({ ...formData, machineId: mId, categoryId: machine ? machine.categoryId : formData.categoryId });
                }}
                className="w-full p-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs focus:border-[var(--status-info)] outline-none"
              >
                <option value="">-- Select Machine/Asset --</option>
                {availableMachines.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                ))}
              </select>
              
              <div className="flex items-center gap-1">
                <input 
                  type="text" 
                  placeholder="Or search by name/code..."
                  value={machineSearch}
                  onChange={(e) => setMachineSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleMachineSearch())}
                  className="flex-1 p-1.5 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-primary)] text-[10px] focus:border-[var(--status-info)] outline-none"
                />
                <button 
                  type="button"
                  onClick={handleMachineSearch}
                  disabled={!machineSearch}
                  className="px-3 py-1.5 bg-[var(--border-strong)] hover:bg-[var(--text-secondary)] text-white text-[10px] font-bold disabled:opacity-50"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase mb-1">
              Asset Category <span className="text-[#E81123]">*</span>
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full p-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs focus:border-[var(--status-info)] outline-none"
            >
              <option value="">-- Select Category --</option>
              {FAULT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase mb-1">
              Fault/Issue Summary <span className="text-[#E81123]">*</span>
            </label>
            <div className="flex flex-col gap-2">
              <select
                required
                disabled={!formData.categoryId}
                value={formData.faultName}
                onChange={(e) => setFormData({ ...formData, faultName: e.target.value })}
                className="w-full p-2 bg-[var(--bg-panel)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs focus:border-[var(--status-info)] outline-none disabled:opacity-50"
              >
                <option value="">-- Standard Selection (All Faults) --</option>
                {availableFaults.map((f) => (
                  <option key={f.id} value={f.name}>{f.name}</option>
                ))}
              </select>
              
              <div className="flex items-center gap-1">
                <input 
                  type="text" 
                  placeholder="Or search by fault name..."
                  value={faultSearch}
                  onChange={(e) => setFaultSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleFaultSearch())}
                  className="flex-1 p-1.5 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-primary)] text-[10px] focus:border-[var(--status-info)] outline-none disabled:opacity-50"
                  disabled={!formData.categoryId}
                />
                <button 
                  type="button"
                  onClick={handleFaultSearch}
                  disabled={!formData.categoryId || !faultSearch}
                  className="px-3 py-1.5 bg-[var(--border-strong)] hover:bg-[var(--text-secondary)] text-white text-[10px] font-bold disabled:opacity-50"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs focus:border-[var(--status-info)] outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase mb-1">
                Shift
              </label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full p-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs focus:border-[var(--status-info)] outline-none"
              >
                <option value="Shift 1 (06:00 - 14:00)">Shift 1</option>
                <option value="Shift 2 (14:00 - 22:00)">Shift 2</option>
                <option value="Shift 3 (22:00 - 06:00)">Shift 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* ROW 3 */}
        <div>
          <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase mb-1">
            Detailed Description (Optional)
          </label>
          <textarea
            rows="3"
            placeholder="Add any specific observations, error codes, or context..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs focus:border-[var(--status-info)] outline-none resize-none"
          ></textarea>
        </div>

        <div className="mt-auto pt-4 border-t border-[var(--border-strong)] flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setFormData({ categoryId: '', machineId: '', faultName: '', priority: 'Medium', shift: 'Shift 1 (06:00 - 14:00)', description: '' })}
            className="px-4 py-1.5 bg-[var(--border-subtle)] hover:bg-[var(--border-strong)] text-[var(--text-secondary)] hover:text-white text-xs font-bold flex items-center gap-2 border border-[var(--border-strong)]"
          >
            <X className="w-3.5 h-3.5" />
            CLEAR
          </button>
          <button
            type="submit"
            className="px-6 py-1.5 bg-[var(--status-info)] hover:bg-[#004A99] text-white text-xs font-bold flex items-center gap-2 border border-[var(--status-info)]"
          >
            <Save className="w-3.5 h-3.5" />
            SUBMIT REQUEST
          </button>
        </div>
      </form>
    </div>
  );
}
