import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Volume2, VolumeX, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationCenter() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    isAlarmMuted,
    setIsAlarmMuted,
    activeAlarm
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-[#E81123] bg-[#E81123]/10 border-[#E81123]/30';
      case 'High': return 'text-[#D83B01] bg-[#D83B01]/10 border-[#D83B01]/30';
      default: return 'text-[var(--status-info)] bg-[var(--status-info)]/10 border-[var(--status-info)]/30';
    }
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      
      {/* Alarm Mute Toggle (Only shows if alarm is actively ringing or user manually muted it) */}
      {(activeAlarm || isAlarmMuted) && (
        <button
          onClick={() => setIsAlarmMuted(!isAlarmMuted)}
          title={isAlarmMuted ? "Unmute Alarms" : "Mute Alarms"}
          className={`mr-2 flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold rounded-sm border transition-colors ${
            activeAlarm && !isAlarmMuted 
              ? 'bg-[#E81123] text-white border-[#E81123] animate-pulse'
              : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-strong)] hover:text-white'
          }`}
        >
          {isAlarmMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">ALARM</span>
        </button>
      )}

      {/* Bell Icon */}
      <button 
        className="relative p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)] transition-colors rounded-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#E81123] text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 max-h-[80vh] flex flex-col bg-[var(--bg-panel)] border border-[var(--border-strong)] shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-sm z-50 overflow-hidden">
          
          <div className="flex items-center justify-between p-3 border-b border-[var(--border-strong)] bg-[var(--bg-app)]">
            <h3 className="text-xs font-bold uppercase tracking-wider">Alerts & Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] text-[var(--status-info)] hover:text-white font-bold"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-[var(--text-muted)] flex flex-col items-center">
                <Check className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">No active alerts</p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-strong)]">
                {notifications.map(notif => (
                  <li key={notif.id} className="p-3 hover:bg-[var(--bg-app)] transition-colors group relative">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {notif.priority === 'Critical' ? (
                          <AlertTriangle className="w-4 h-4 text-[#E81123]" />
                        ) : (
                          <AlertCircle className={`w-4 h-4 ${notif.priority === 'High' ? 'text-[#D83B01]' : 'text-[var(--status-info)]'}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 border rounded-sm ${getPriorityColor(notif.priority)}`}>
                            {notif.priority}
                          </span>
                          <span className="text-[9px] text-[var(--text-muted)]">
                            {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white mb-0.5 leading-tight">{notif.title}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] leading-snug break-words">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                    {/* Mark as read button (appears on hover) */}
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="absolute right-2 top-2 p-1 text-[var(--text-muted)] hover:text-white hover:bg-[#E81123]/20 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Dismiss Alert"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
