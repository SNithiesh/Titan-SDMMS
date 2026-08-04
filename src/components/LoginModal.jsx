import React, { useState } from 'react';
import { Lock, UserCheck, ShieldAlert, KeyRound, Wrench, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginModal({ onLoginSuccess }) {
  const { login, isAuthLoading, authError, setAuthError } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    const result = await login(employeeId.trim(), password);
    if (result.success) {
      onLoginSuccess(result.user);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center p-4">
      {/* Strict Industrial Login Box */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] w-full max-w-[400px] shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
        
        {/* Header Bar */}
        <div className="h-1 bg-[var(--status-info)] w-full"></div>
        
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[var(--status-info)] flex items-center justify-center text-white shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-wide leading-tight">TITAN SDMMS</h1>
              <p className="text-[11px] text-[var(--text-secondary)] uppercase tracking-widest">Enterprise Access</p>
            </div>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-[#E81123]/10 border border-[#E81123] text-[#E81123] text-xs font-semibold flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Employee ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => { setEmployeeId(e.target.value); setAuthError(''); }}
                  placeholder="EMP-7801"
                  className="block w-full pl-9 pr-3 py-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-primary)] text-sm focus:border-[var(--status-info)] focus:outline-none transition-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 bg-[var(--bg-app)] border border-[var(--border-strong)] text-[var(--text-primary)] text-sm focus:border-[var(--status-info)] focus:outline-none transition-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-2 bg-[var(--status-info)] hover:bg-[#004A99] disabled:bg-[var(--border-subtle)] disabled:text-[var(--text-muted)] text-white font-bold text-sm transition-none flex items-center justify-center gap-2"
              >
                {isAuthLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> AUTHENTICATING...</>
                ) : (
                  <><Lock className="w-4 h-4" /> LOGIN TO SYSTEM</>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="bg-[var(--bg-panel)] px-8 py-3 border-t border-[var(--border-strong)] flex justify-between items-center text-[10px] text-[var(--text-muted)] font-mono">
          <span>v2.0.1 — PROD</span>
          <span>SYSTEM: SECURE</span>
        </div>
      </div>
    </div>
  );
}
