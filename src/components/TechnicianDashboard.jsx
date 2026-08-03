import React, { useState } from 'react';
import { Wrench, CheckCircle2, Clock, UserCheck, AlertCircle, FileText } from 'lucide-react';
import { TECHNICIANS } from '../mockData';

export default function TechnicianDashboard({ complaints, onUpdateStatus }) {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [partsChanged, setPartsChanged] = useState('');

  // Filter complaints assigned or unassigned for maintenance
  const activeJobs = complaints.filter(c => c.status !== 'Closed');

  const handleAction = (complaint, nextStatus) => {
    onUpdateStatus(complaint.id, {
      status: nextStatus,
      remarks: remarks || complaint.remarks,
      partsChanged: partsChanged || complaint.partsChanged,
      assignedTechnician: complaint.assignedTechnician === 'Unassigned' ? 'Suresh V (Mechanical)' : complaint.assignedTechnician,
      acceptedTime: nextStatus === 'Accepted' ? new Date().toISOString() : complaint.acceptedTime,
      repairStartedTime: nextStatus === 'Repair Started' ? new Date().toISOString() : complaint.repairStartedTime,
      completedTime: nextStatus === 'Completed' ? new Date().toISOString() : complaint.completedTime,
    });
    setSelectedComplaint(null);
    setRemarks('');
    setPartsChanged('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-400" />
            Maintenance Technician Work Orders Queue
          </h2>
          <p className="text-xs text-slate-400">Back Cover Dept Maintenance Team - Mechanical / Electrical / Automation</p>
        </div>
        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold rounded-full">
          {activeJobs.length} Active Jobs
        </span>
      </div>

      {/* Active Work Order Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeJobs.map((cmp) => (
          <div key={cmp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                  {cmp.id}
                </span>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                  cmp.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {cmp.priority}
                </span>
              </div>

              <h3 className="font-bold text-slate-100 text-base">{cmp.machineName}</h3>
              <p className="text-xs text-amber-400 font-semibold mb-2">{cmp.categoryName} ➔ {cmp.faultName}</p>
              <p className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded border border-slate-800/80 mb-3">
                {cmp.description}
              </p>

              {cmp.imageUrl && (
                <div className="mb-3">
                  <img src={cmp.imageUrl} alt="Fault Evidence" className="w-full h-32 object-cover rounded-lg border border-slate-700" />
                </div>
              )}

              <div className="text-xs text-slate-400 space-y-1 mb-4">
                <div><span className="text-slate-500">Operator:</span> {cmp.operatorName} ({cmp.shift})</div>
                <div><span className="text-slate-500">Assigned Tech:</span> {cmp.assignedTechnician}</div>
                <div><span className="text-slate-500">Current Status:</span> <span className="font-bold text-emerald-400">{cmp.status}</span></div>
              </div>
            </div>

            {/* Quick Action Button Workflow */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2">
              {cmp.status === 'New' || cmp.status === 'Assigned' ? (
                <button
                  onClick={() => handleAction(cmp, 'Accepted')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded transition-all flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" /> Accept Job Work Order
                </button>
              ) : cmp.status === 'Accepted' ? (
                <button
                  onClick={() => handleAction(cmp, 'Repair Started')}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded transition-all flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-4 h-4" /> Start Maintenance Repair
                </button>
              ) : cmp.status === 'Repair Started' ? (
                <button
                  onClick={() => setSelectedComplaint(cmp)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Log Spares & Complete Repair
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-semibold italic">Awaiting Supervisor Verification</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Complete Repair Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold mb-1 text-white">Complete Repair Log</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedComplaint.machineName} - {selectedComplaint.faultName}</p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Root Cause / Repair Remarks</label>
                <textarea
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Describe cause (e.g. worn out cylinder seal replaced, flange bolts re-torqued)..."
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 placeholder-slate-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Spare Parts Changed</label>
                <input
                  type="text"
                  value={partsChanged}
                  onChange={(e) => setPartsChanged(e.target.value)}
                  placeholder="e.g. Polyurethane O-Ring Seal 120mm"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(selectedComplaint, 'Completed')}
                className="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded"
              >
                Mark Work Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
