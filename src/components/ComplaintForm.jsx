import React, { useState, useEffect } from 'react';
import { FAULT_CATEGORIES, MACHINES } from '../mockData';
import { Search, AlertTriangle, CheckCircle, Filter, Command } from 'lucide-react';

export default function ComplaintForm({ onSubmitSuccess, preSelectedMachine }) {
  const [selectedMachine, setSelectedMachine] = useState(preSelectedMachine || MACHINES[0].id);
  const [machineFilter, setMachineFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('mechanical');
  const [selectedFault, setSelectedFault] = useState('m3');
  const [priority, setPriority] = useState('High');
  const [operatorName, setOperatorName] = useState('Rajesh K');
  const [employeeId, setEmployeeId] = useState('EMP-7801');
  const [shift, setShift] = useState('Shift A');
  const [description, setDescription] = useState('');

  // Keyboard shortcut listener: Press '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('realtime-fault-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const allFaults = FAULT_CATEGORIES.flatMap(cat => 
    cat.faults.map(f => ({
      ...f,
      categoryId: cat.id,
      categoryName: cat.name,
      department: cat.department
    }))
  );

  const filteredFaults = searchTerm.trim() 
    ? allFaults.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.desc.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : FAULT_CATEGORIES.find(c => c.id === selectedCategory)?.faults || [];

  const visibleMachines = machineFilter === 'All'
    ? MACHINES
    : MACHINES.filter(m => m.type === machineFilter);

  const handleSelectSearchedFault = (fault) => {
    setSelectedCategory(fault.categoryId);
    setSelectedFault(fault.id);
    setSearchTerm('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const machineObj = MACHINES.find(m => m.id === selectedMachine);
    const categoryObj = FAULT_CATEGORIES.find(c => c.id === selectedCategory);
    const faultObj = allFaults.find(f => f.id === selectedFault);

    const newComplaint = {
      id: `CMP-${Date.now().toString().slice(-4)}`,
      machineId: selectedMachine,
      machineName: machineObj?.name || selectedMachine,
      operatorName,
      employeeId,
      department: 'Back Cover Dept',
      shift,
      categoryId: selectedCategory,
      categoryName: categoryObj?.name || 'Mechanical Maintenance',
      faultName: faultObj?.name || 'Oil Leakage',
      priority,
      description: description || `Reported ${faultObj?.name || 'fault'} on ${machineObj?.name}.`,
      imageUrl: null,
      status: 'New',
      assignedTechnician: 'Unassigned',
      createdTime: new Date().toISOString(),
      assignedTime: null,
      acceptedTime: null,
      repairStartedTime: null,
      completedTime: null,
      verifiedTime: null,
      remarks: '',
      partsChanged: ''
    };

    onSubmitSuccess(newComplaint);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl text-slate-100">
      {/* Professional Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Raise Maintenance Complaint
          </h2>
          <p className="text-xs text-slate-400">Titan Industries Pvt. Ltd. • Back Cover Department</p>
        </div>
        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono font-medium rounded-md">
          20 Plant Assets
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Machine Catalog Selection with Mobile Swipeable Filters */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Select Machine Asset
            </label>

            {/* Clean Swipeable Category Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
              {['All', 'Friction Press', 'Hydraulic Press', 'Crank Press'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setMachineFilter(type)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
                    machineFilter === type
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                  }`}
                >
                  {type} {type === 'Friction Press' ? '(15)' : type === 'Hydraulic Press' ? '(3)' : type === 'Crank Press' ? '(2)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Machine Grid - Touch Target Minimum 44px */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-1.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            {visibleMachines.map((m) => {
              const isSelected = selectedMachine === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setSelectedMachine(m.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all min-h-[48px] flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md ring-1 ring-blue-500/50'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-blue-400">
                      {m.code}
                    </span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <div className="text-[11px] font-medium text-slate-300 truncate mt-1">{m.type}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Fault Search Bar with Keyboard Shortcut Indicator */}
        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              2. Search Fault Option
            </label>
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              <Command className="w-3 h-3" /> Press / to search
            </span>
          </div>

          <div className="relative">
            <input
              id="realtime-fault-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Type fault name (e.g. "wheel", "leak", "button", "sensor", "plc")...'
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Autocomplete Results */}
          {searchTerm.trim() !== '' && (
            <div className="mt-2 max-h-40 overflow-y-auto bg-slate-900 border border-slate-700 rounded-md divide-y divide-slate-800 shadow-lg">
              {filteredFaults.length > 0 ? (
                filteredFaults.map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => handleSelectSearchedFault(f)}
                    className="w-full text-left p-2 hover:bg-amber-500/10 hover:text-amber-300 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{f.name}</div>
                      <div className="text-[10px] text-slate-400">{f.desc}</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                      {f.categoryName}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-2.5 text-xs text-slate-400 text-center">No matching faults found. Select manually below.</div>
              )}
            </div>
          )}
        </div>

        {/* Manual Category & Specific Fault Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Fault Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                const cat = FAULT_CATEGORIES.find(c => c.id === e.target.value);
                if (cat && cat.faults.length > 0) {
                  setSelectedFault(cat.faults[0].id);
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {FAULT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Specific Fault Option
            </label>
            <select
              value={selectedFault}
              onChange={(e) => setSelectedFault(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {(FAULT_CATEGORIES.find(c => c.id === selectedCategory)?.faults || []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority & Operator Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-1">
              {['Low', 'Medium', 'High', 'Critical'].map((p) => {
                const isSelected = priority === p;
                const colors = {
                  Low: 'border-slate-700 bg-slate-800 text-slate-300',
                  Medium: 'border-blue-500/50 bg-blue-500/20 text-blue-400',
                  High: 'border-amber-500/50 bg-amber-500/20 text-amber-400',
                  Critical: 'border-rose-500/50 bg-rose-500/20 text-rose-400'
                };
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-[11px] font-bold rounded border text-center transition-all ${
                      isSelected ? `${colors[p]} ring-1 ring-white/20` : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Operator
            </label>
            <input
              type="text"
              value={`${operatorName} (${employeeId})`}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Shift
            </label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="Shift A">Shift A (06:00 - 14:00)</option>
              <option value="Shift B">Shift B (14:00 - 22:00)</option>
              <option value="Shift C">Shift C (22:00 - 06:00)</option>
            </select>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Remarks / Breakdown Observations
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details regarding machine noise, pressure drop, or component issue..."
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-md shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          <CheckCircle className="w-4 h-4" />
          Submit Maintenance Complaint
        </button>
      </form>
    </div>
  );
}
