import React from 'react';
import { CheckCircle2, Clock, Wrench, ShieldCheck, CheckSquare, FileText, ChevronRight } from 'lucide-react';

export default function LiveTimeline({ complaint }) {
  if (!complaint) return null;

  const STEPS = [
    { key: 'New', label: 'Submitted', time: complaint.createdTime, icon: FileText, desc: 'Complaint registered by Operator' },
    { key: 'Assigned', label: 'Assigned', time: complaint.assignedTime, icon: Clock, desc: `Assigned to ${complaint.assignedTechnician || 'Technician'}` },
    { key: 'Accepted', label: 'Accepted', time: complaint.acceptedTime, icon: CheckCircle2, desc: 'Technician acknowledged work order' },
    { key: 'Repair Started', label: 'Repair Started', time: complaint.repairStartedTime, icon: Wrench, desc: 'Active maintenance work in progress' },
    { key: 'Completed', label: 'Completed', time: complaint.completedTime, icon: CheckSquare, desc: 'Work finished by Technician' },
    { key: 'Closed', label: 'Verified & Closed', time: complaint.verifiedTime, icon: ShieldCheck, desc: 'Supervisor quality check complete' }
  ];

  const getStepStatus = (stepKey) => {
    const order = ['New', 'Assigned', 'Accepted', 'Repair Started', 'Completed', 'Closed'];
    const currentIndex = order.indexOf(complaint.status);
    const stepIndex = order.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-slate-100 mb-6">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold">
              {complaint.id}
            </span>
            <span className="font-bold text-base text-white">{complaint.machineName}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              {complaint.faultName}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Operator: {complaint.operatorName} ({complaint.shift})</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
            complaint.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' :
            complaint.priority === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}>
            {complaint.priority} Priority
          </span>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
            Status: {complaint.status}
          </span>
        </div>
      </div>

      {/* Timeline Steps Horizontal Bar */}
      <div className="relative my-6">
        <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-slate-800 -z-0"></div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative z-10">
          {STEPS.map((step, idx) => {
            const status = getStepStatus(step.key);
            const Icon = step.icon;

            let circleClass = 'bg-slate-800 border-slate-700 text-slate-500';
            if (status === 'completed') circleClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/20';
            if (status === 'active') circleClass = 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/50 ring-4 ring-blue-500/20 animate-bounce';

            return (
              <div key={step.key} className="flex md:flex-col items-center md:items-center text-left md:text-center gap-3 md:gap-2">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${circleClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${status === 'pending' ? 'text-slate-500' : 'text-slate-200'}`}>
                    {step.label}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {step.time ? new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '⏳ Pending'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 max-w-[120px] hidden md:block">
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Repair details log section */}
      {(complaint.remarks || complaint.partsChanged) && (
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-950/40 p-3 rounded-lg">
          <div>
            <span className="font-semibold text-amber-400 block mb-1">Technician Remarks:</span>
            <p className="text-slate-300">{complaint.remarks || 'No remarks added yet.'}</p>
          </div>
          <div>
            <span className="font-semibold text-blue-400 block mb-1">Parts Changed:</span>
            <p className="text-slate-300">{complaint.partsChanged || 'None recorded.'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
