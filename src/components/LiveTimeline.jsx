import React from 'react';
import { ShieldAlert, User, Wrench, CheckCircle2, Clock, Check } from 'lucide-react';

export default function LiveTimeline({ complaint }) {
  if (!complaint) return null;

  // Define the standard lifecycle stages
  const STAGES = [
    { id: 'reported', label: 'FAULT REPORTED', icon: ShieldAlert, timeKey: 'createdTime', getDesc: (c) => `By Operator: ${c.operatorName || 'Unknown'}`, color: 'text-[#E81123]', border: 'border-[#E81123]', bg: 'bg-[#E81123]' },
    { id: 'assigned', label: 'TECHNICIAN ASSIGNED', icon: User, timeKey: 'assignedTime', getDesc: (c) => `Assigned to: ${c.assignedTechnician}`, color: 'text-[var(--status-info)]', border: 'border-[var(--status-info)]', bg: 'bg-[var(--status-info)]' },
    { id: 'accepted', label: 'JOB ACCEPTED', icon: CheckCircle2, timeKey: 'acceptedTime', getDesc: () => 'Technician acknowledged assignment.', color: 'text-[#D83B01]', border: 'border-[#D83B01]', bg: 'bg-[#D83B01]' },
    { id: 'progress', label: 'REPAIR IN PROGRESS', icon: Wrench, timeKey: 'repairStartedTime', getDesc: () => 'Active work commenced.', color: 'text-[#D83B01]', border: 'border-[#D83B01]', bg: 'bg-[#D83B01]' },
    { id: 'completed', label: 'REPAIR COMPLETED', icon: CheckCircle2, timeKey: 'completedTime', getDesc: (c) => `Remarks: ${c.remarks || 'None'}\nParts: ${c.partsChanged || 'None'}`, color: 'text-[#107C10]', border: 'border-[#107C10]', bg: 'bg-[#107C10]' },
    { id: 'verified', label: 'SUPERVISOR VERIFIED', icon: ShieldAlert, timeKey: 'verifiedTime', getDesc: () => 'Job officially closed.', color: 'text-[var(--text-muted)]', border: 'border-[var(--text-muted)]', bg: 'bg-[var(--text-muted)]' },
  ];

  const calculateDelta = (start, end) => {
    if (!start || !end) return null;
    const diffMs = new Date(end) - new Date(start);
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="flex flex-col p-2">
      {STAGES?.map((stage, index) => {
        const timeVal = complaint[stage.timeKey];
        const isCompleted = !!timeVal;
        
        // It's the "active" stage if this stage isn't completed, but the previous one IS completed.
        // Or if it's the very first stage and it's somehow not completed (rare).
        const prevTimeVal = index > 0 ? complaint[STAGES[index-1].timeKey] : new Date().toISOString();
        const isActive = !isCompleted && !!prevTimeVal;
        
        // It's "pending" if the previous stage is also not completed.
        const isPending = !isCompleted && !isActive;

        // Calculate time taken from previous step
        let deltaText = null;
        if (isCompleted && index > 0) {
           deltaText = calculateDelta(complaint[STAGES[index-1].timeKey], timeVal);
        } else if (isActive && prevTimeVal) {
           deltaText = calculateDelta(prevTimeVal, new Date());
        }

        const Icon = stage.icon;

        return (
          <div key={stage.id} className="relative flex gap-4">
            
            {/* The Vertical Line Connecting Nodes (don't render on last item) */}
            {index < STAGES.length - 1 && (
              <div 
                className={`absolute left-3.5 top-8 bottom-[-8px] w-[2px] z-0 
                  ${isCompleted ? stage.bg : 'bg-[var(--border-strong)] opacity-30'}
                `} 
              />
            )}

            {/* The Node Icon */}
            <div className="relative z-10 flex flex-col items-center shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${isCompleted ? `${stage.bg} border-transparent text-white shadow-[0_0_8px_rgba(0,0,0,0.5)]` : ''}
                ${isActive ? `${stage.border} bg-[var(--bg-app)] shadow-[0_0_10px_currentColor] animate-pulse ${stage.color}` : ''}
                ${isPending ? 'border-[var(--border-strong)] bg-[var(--bg-panel)] text-[var(--text-muted)] opacity-50' : ''}
              `}>
                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Content Box */}
            <div className={`flex-1 pb-6 pt-0.5 ${isPending ? 'opacity-40' : ''}`}>
              
              {/* Event Details */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isCompleted || isActive ? stage.color : 'text-[var(--text-muted)]'}`}>
                  {stage.label}
                  {isActive && <span className="ml-2 text-[9px] px-1.5 py-0.5 bg-[var(--bg-app)] border border-current opacity-80 animate-pulse">ACTIVE NOW</span>}
                </span>
                
                {isCompleted && (
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] whitespace-nowrap">
                    {new Date(timeVal).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                  </span>
                )}
              </div>
              
              <div className="text-xs text-[var(--text-primary)] break-words whitespace-pre-wrap">
                {isCompleted ? stage.getDesc(complaint) : (isActive ? 'Awaiting action...' : 'Pending')}
              </div>

              {/* Time Delta Analytics */}
              {(deltaText) && (
                <div className={`inline-flex items-center gap-1 mt-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded border 
                  ${isCompleted ? 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border-[var(--border-subtle)]' : 'bg-[#D83B01]/10 text-[#D83B01] border-[#D83B01]/30 animate-pulse'}
                `}>
                  <Clock className="w-3 h-3" />
                  {isCompleted ? `Took ${deltaText}` : `Active for ${deltaText}`}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
