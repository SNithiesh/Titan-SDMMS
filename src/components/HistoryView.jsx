import React, { useState } from 'react';
import { History, Search, Filter, Calendar, CheckCircle2, Clock, FileText, Download, Eye, Wrench, ShieldCheck } from 'lucide-react';

export default function HistoryView({ complaints }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedHistoryComplaint, setSelectedHistoryComplaint] = useState(null);

  // Filter complaints according to search and dropdown filters
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.faultName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.assignedTechnician && c.assignedTechnician.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const closedCount = complaints.filter(c => c.status === 'Closed').length;
  const inProgressCount = complaints.filter(c => c.status !== 'Closed').length;

  const handleExportCSV = () => {
    const headers = ['Complaint ID', 'Machine', 'Operator', 'Category', 'Fault', 'Priority', 'Status', 'Assigned Tech', 'Created Time', 'Verified Time', 'Parts Changed', 'Remarks'];
    const rows = filteredComplaints.map(c => [
      c.id,
      `"${c.machineName}"`,
      `"${c.operatorName}"`,
      `"${c.categoryName}"`,
      `"${c.faultName}"`,
      c.priority,
      c.status,
      `"${c.assignedTechnician || 'Unassigned'}"`,
      c.createdTime ? new Date(c.createdTime).toLocaleString() : '',
      c.verifiedTime ? new Date(c.verifiedTime).toLocaleString() : '',
      `"${c.partsChanged || ''}"`,
      `"${c.remarks || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `titan_sdmms_maintenance_history_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            Maintenance Complaint History & Audit Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Permanent record of all breakdown reports, maintenance actions, and supervisor verifications</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV Log
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 block">Total Logged</span>
          <span className="text-xl sm:text-2xl font-extrabold text-white">{complaints.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-emerald-400 block">Closed & Verified</span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">{closedCount}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-amber-400 block">In Progress</span>
          <span className="text-xl sm:text-2xl font-extrabold text-amber-400">{inProgressCount}</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ID, Machine, Fault, Tech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 whitespace-nowrap">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Closed">Closed & Verified Only</option>
              <option value="Completed">Completed (Pending Verification)</option>
              <option value="Repair Started">Repair Started</option>
              <option value="Assigned">Assigned</option>
              <option value="New">New / Unassigned</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 whitespace-nowrap">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Only</option>
              <option value="Medium">Medium Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile-Friendly History List & Desktop Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Machine</th>
                <th className="p-3">Fault Category</th>
                <th className="p-3">Operator</th>
                <th className="p-3">Technician</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Logged Date</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-slate-500 italic">
                    No complaint history records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-400">{c.id}</td>
                    <td className="p-3 font-semibold text-white">{c.machineName}</td>
                    <td className="p-3">
                      <div className="text-slate-200 font-medium">{c.faultName}</div>
                      <div className="text-[10px] text-slate-400">{c.categoryName}</div>
                    </td>
                    <td className="p-3 text-slate-300">{c.operatorName}</td>
                    <td className="p-3 font-medium text-slate-300">{c.assignedTechnician || 'Unassigned'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                        c.priority === 'High' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'Closed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        c.status === 'Completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {c.createdTime ? new Date(c.createdTime).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedHistoryComplaint(c)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded text-[11px] inline-flex items-center gap-1 border border-slate-700"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" /> Audit Log
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile-Optimized Cards View */}
        <div className="md:hidden divide-y divide-slate-800">
          {filteredComplaints.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 italic">
              No complaint history records found.
            </div>
          ) : (
            filteredComplaints.map((c) => (
              <div key={c.id} className="p-4 space-y-2 bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400">{c.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === 'Closed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white">{c.machineName}</h4>
                    <p className="text-xs text-amber-400 font-medium">{c.categoryName} ➔ {c.faultName}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {c.priority}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                  <div><span className="text-slate-500">Operator:</span> {c.operatorName}</div>
                  <div><span className="text-slate-500">Technician:</span> {c.assignedTechnician || 'Unassigned'}</div>
                  <div><span className="text-slate-500">Logged:</span> {c.createdTime ? new Date(c.createdTime).toLocaleString() : 'N/A'}</div>
                </div>

                <button
                  onClick={() => setSelectedHistoryComplaint(c)}
                  className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold rounded flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Eye className="w-3.5 h-3.5" /> View Full Breakdown Audit Log
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedHistoryComplaint && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full text-slate-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                  {selectedHistoryComplaint.id}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedHistoryComplaint.machineName}</h3>
              </div>
              <button
                onClick={() => setSelectedHistoryComplaint(null)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block font-semibold mb-1">Fault Description:</span>
                <p className="text-slate-200">{selectedHistoryComplaint.description || 'No description logged.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Operator:</span>
                  <span className="font-semibold text-white">{selectedHistoryComplaint.operatorName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Shift:</span>
                  <span className="font-semibold text-white">{selectedHistoryComplaint.shift || 'Shift A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Assigned Technician:</span>
                  <span className="font-semibold text-blue-400">{selectedHistoryComplaint.assignedTechnician || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Status:</span>
                  <span className="font-semibold text-emerald-400">{selectedHistoryComplaint.status}</span>
                </div>
              </div>

              {/* Maintenance Repair Log */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
                <div>
                  <span className="text-amber-400 font-semibold block">Technician Repair Remarks:</span>
                  <p className="text-slate-300">{selectedHistoryComplaint.remarks || 'No remarks recorded.'}</p>
                </div>
                <div>
                  <span className="text-blue-400 font-semibold block">Spare Parts Replaced:</span>
                  <p className="text-slate-300">{selectedHistoryComplaint.partsChanged || 'None recorded.'}</p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1 font-mono text-slate-400">
                <div>Created: {selectedHistoryComplaint.createdTime ? new Date(selectedHistoryComplaint.createdTime).toLocaleString() : 'N/A'}</div>
                <div>Assigned: {selectedHistoryComplaint.assignedTime ? new Date(selectedHistoryComplaint.assignedTime).toLocaleString() : 'Pending'}</div>
                <div>Repair Started: {selectedHistoryComplaint.repairStartedTime ? new Date(selectedHistoryComplaint.repairStartedTime).toLocaleString() : 'Pending'}</div>
                <div>Work Completed: {selectedHistoryComplaint.completedTime ? new Date(selectedHistoryComplaint.completedTime).toLocaleString() : 'Pending'}</div>
                <div>Verified & Closed: {selectedHistoryComplaint.verifiedTime ? new Date(selectedHistoryComplaint.verifiedTime).toLocaleString() : 'Pending'}</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedHistoryComplaint(null)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
