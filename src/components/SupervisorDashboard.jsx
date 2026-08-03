import React, { useState } from 'react';
import { ShieldCheck, UserPlus, CheckSquare, AlertOctagon, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { TECHNICIANS } from '../mockData';

export default function SupervisorDashboard({ complaints, onAssignTechnician, onVerifyComplaint }) {
  const [selectedComplaintForAssign, setSelectedComplaintForAssign] = useState(null);
  const [selectedTech, setSelectedTech] = useState('Suresh V (Mechanical)');

  const totalComplaints = complaints.length;
  const openComplaints = complaints.filter(c => c.status !== 'Closed').length;
  const completedToday = complaints.filter(c => c.status === 'Completed' || c.status === 'Closed').length;
  const criticalCount = complaints.filter(c => c.priority === 'Critical' && c.status !== 'Closed').length;

  const handleAssign = () => {
    if (selectedComplaintForAssign) {
      onAssignTechnician(selectedComplaintForAssign.id, selectedTech);
      setSelectedComplaintForAssign(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-semibold mb-1">Total Complaints</div>
          <div className="text-2xl font-extrabold text-white">{totalComplaints}</div>
          <div className="text-[10px] text-slate-500 mt-1">Back Cover Line</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-amber-400 font-semibold mb-1">Open Active</div>
          <div className="text-2xl font-extrabold text-amber-400">{openComplaints}</div>
          <div className="text-[10px] text-amber-500/70 mt-1">In progress repairs</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-emerald-400 font-semibold mb-1">Completed Today</div>
          <div className="text-2xl font-extrabold text-emerald-400">{completedToday}</div>
          <div className="text-[10px] text-emerald-500/70 mt-1">Ready for verification</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-rose-400 font-semibold mb-1">Critical Priority</div>
          <div className="text-2xl font-extrabold text-rose-400">{criticalCount}</div>
          <div className="text-[10px] text-rose-500/70 mt-1">Line stoppage alerts</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-blue-400 font-semibold mb-1">Avg Response</div>
          <div className="text-2xl font-extrabold text-blue-400">4.2 min</div>
          <div className="text-[10px] text-blue-500/70 mt-1">Target: &lt; 5 min</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-purple-400 font-semibold mb-1">Avg MTTR</div>
          <div className="text-2xl font-extrabold text-purple-400">28 min</div>
          <div className="text-[10px] text-purple-500/70 mt-1">Mean Repair Duration</div>
        </div>
      </div>

      {/* Complaint Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Supervisor Maintenance Oversight & Verification
          </h3>
          <span className="text-xs text-slate-400">Shift A Back Cover Supervisory View</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Complaint ID</th>
                <th className="p-3">Machine</th>
                <th className="p-3">Category & Fault</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Technician</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-blue-400">{c.id}</td>
                  <td className="p-3 font-semibold text-white">{c.machineName}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-200">{c.faultName}</div>
                    <div className="text-[10px] text-slate-400">{c.categoryName}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-300">{c.assignedTechnician}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      {c.status === 'New' && (
                        <button
                          onClick={() => setSelectedComplaintForAssign(c)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-1 transition-all shadow-sm"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Assign Tech
                        </button>
                      )}

                      {c.status !== 'Closed' && (
                        <button
                          onClick={() => onVerifyComplaint(c.id)}
                          title="Verify quality and close work order"
                          className={`px-2.5 py-1 text-white font-bold rounded flex items-center gap-1 transition-all shadow-sm ${
                            c.status === 'Completed' 
                              ? 'bg-emerald-600 hover:bg-emerald-500 animate-pulse' 
                              : 'bg-slate-800 hover:bg-emerald-700 text-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verify & Close
                        </button>
                      )}

                      {c.status === 'Closed' && (
                        <span className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-[11px] font-bold rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Closed & Verified
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Technician Modal */}
      {selectedComplaintForAssign && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold mb-1 text-white">Assign Maintenance Technician</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedComplaintForAssign.machineName} - {selectedComplaintForAssign.faultName}</p>

            <div className="mb-4 text-xs">
              <label className="block text-slate-300 font-semibold mb-1">Select Technician</label>
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100"
              >
                {TECHNICIANS.map((t) => (
                  <option key={t.id} value={`${t.name} (${t.role.split(' ')[0]})`}>
                    {t.name} - {t.role} ({t.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedComplaintForAssign(null)}
                className="w-1/2 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="w-1/2 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
