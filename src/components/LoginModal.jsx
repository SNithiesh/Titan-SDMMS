import React, { useState } from 'react';
import { DEMO_USERS } from '../mockData';
import { Lock, UserCheck, ShieldAlert, KeyRound, Wrench, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { authenticateUser } from '../services/dbService';

export default function LoginModal({ onLoginSuccess }) {
  const [employeeId, setEmployeeId] = useState('EMP-7801');
  const [password, setPassword] = useState('123');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsAuthenticating(true);

    try {
      const res = await authenticateUser(employeeId, password);
      if (res.success && res.user) {
        // Save logged-in session to localStorage for auto-reconnect
        try {
          localStorage.setItem('titan_sdmms_user', JSON.stringify(res.user));
        } catch (err) {}
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please verify employee ID & password.');
      }
    } catch (err) {
      setErrorMsg('Login server error. Try employee IDs EMP-7801, EMP-4402, or EMP-1001.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSelectQuickRole = (user) => {
    setEmployeeId(user.employeeId);
    setPassword(user.password || '123');
    try {
      localStorage.setItem('titan_sdmms_user', JSON.stringify(user));
    } catch (err) {}
    onLoginSuccess(user);
  };


  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">TITAN SDMMS LOGIN</h1>
          <p className="text-xs text-slate-400 mt-1">Smart Digital Maintenance Management System</p>
          <p className="text-[11px] font-semibold text-blue-400">Back Cover Dept - Titan Industries Pvt. Ltd.</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              Employee ID
            </label>
            <input
              type="text"
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. EMP-7801"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (default: 123)"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" /> Secure Plant Login
              </>
            )}
          </button>
        </form>

        {/* Quick One-Click Demo Role Accounts */}
        <div className="pt-4 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Quick One-Click Demo Login Roles
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {DEMO_USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectQuickRole(user)}
                className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-blue-500/60 hover:bg-blue-600/10 text-left transition-all group"
              >
                <div className="font-bold text-slate-200 group-hover:text-blue-400 flex items-center justify-between">
                  {user.role}
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
                </div>
                <div className="text-[10px] text-slate-400">{user.name} ({user.employeeId})</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
