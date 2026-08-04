import React, { useState } from 'react';
import { DEMO_USERS } from '../mockData';
import { Lock, UserCheck, ShieldAlert, KeyRound, Wrench, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginModal({ onLoginSuccess }) {
  const { login, quickDemoLogin, isAuthLoading, authError, setAuthError } = useAuth();
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

  const handleQuickDemo = (user) => {
    quickDemoLogin(user);
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
          <p className="text-[11px] font-semibold text-blue-400">Back Cover Dept — Titan Industries Pvt. Ltd.</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Enterprise Secure Login — JWT + bcrypt
          </div>
        </div>

        {authError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            {authError}
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
              onChange={(e) => { setEmployeeId(e.target.value); setAuthError(''); }}
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
              onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
              placeholder="Enter your password"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isAuthLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isAuthLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...</>
            ) : (
              <><Lock className="w-4 h-4" /> Secure Plant Login</>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
