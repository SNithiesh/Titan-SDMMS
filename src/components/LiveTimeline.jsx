import React from 'react';
import { ShieldAlert, User, Wrench, CheckCircle2 } from 'lucide-react';

export default function LiveTimeline({ complaint }) {
  if (!complaint) return null;

  const events = [];
  
  if (complaint.createdTime) {
    events.push({
      time: complaint.createdTime,
      title: 'FAULT REPORTED',
      desc: `Reported by Operator: ${complaint.operatorName || 'Unknown'}`,
      icon: ShieldAlert,
      color: 'text-[#E81123]',
      bg: 'bg-[#E81123]/20'
    });
  }

  if (complaint.assignedTime) {
    events.push({
      time: complaint.assignedTime,
      title: 'TECHNICIAN ASSIGNED',
      desc: `Assigned to: ${complaint.assignedTechnician}`,
      icon: User,
      color: 'text-[var(--status-info)]',
      bg: 'bg-[var(--status-info)]/20'
    });
  }

  if (complaint.acceptedTime) {
    events.push({
      time: complaint.acceptedTime,
      title: 'JOB ACCEPTED',
      desc: 'Technician acknowledged the assignment.',
      icon: CheckCircle2,
      color: 'text-[#D83B01]',
      bg: 'bg-[#D83B01]/20'
    });
  }

  if (complaint.repairStartedTime) {
    events.push({
      time: complaint.repairStartedTime,
      title: 'REPAIR IN PROGRESS',
      desc: 'Technician started work on the asset.',
      icon: Wrench,
      color: 'text-[#D83B01]',
      bg: 'bg-[#D83B01]/20'
    });
  }

  if (complaint.completedTime) {
    events.push({
      time: complaint.completedTime,
      title: 'REPAIR COMPLETED',
      desc: `Remarks: ${complaint.remarks || 'None'} | Parts: ${complaint.partsChanged || 'None'}`,
      icon: CheckCircle2,
      color: 'text-[#107C10]',
      bg: 'bg-[#107C10]/20'
    });
  }

  if (complaint.verifiedTime) {
    events.push({
      time: complaint.verifiedTime,
      title: 'SUPERVISOR VERIFIED & CLOSED',
      desc: 'Job officially closed in system.',
      icon: ShieldAlert,
      color: 'text-[var(--text-muted)]',
      bg: 'bg-[var(--border-subtle)]'
    });
  }

  // Sort events chronologically
  events.sort((a, b) => new Date(a.time) - new Date(b.time));

  return (
    <div className="flex flex-col gap-2">
      {events.map((event, index) => {
        const Icon = event.icon;
        return (
          <div key={index} className="flex gap-3 bg-[var(--bg-app)] border border-[var(--border-strong)] p-2">
            <div className={`w-8 h-8 shrink-0 flex items-center justify-center border border-[var(--border-strong)] ${event.bg}`}>
              <Icon className={`w-4 h-4 ${event.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${event.color}`}>
                  {event.title}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] whitespace-nowrap">
                  {new Date(event.time).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-[var(--text-primary)] mt-1 break-words">
                {event.desc}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
