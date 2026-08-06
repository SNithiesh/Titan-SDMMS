import React, { useState, useEffect } from 'react';
import { Download, Monitor, Smartphone } from 'lucide-react';

export default function InstallPromptBar() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("App installation ready! In Chrome/Edge/Safari, click the 'Install App' icon in the browser address bar or Share menu to download as a standalone Mobile/Desktop app.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-900/60 border-b border-blue-500/30 py-2 px-4 text-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-white flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <Monitor className="w-3.5 h-3.5 text-indigo-400" />
          Cross-Platform PWA App Ready
        </span>
        <span className="text-slate-400 hidden md:inline">| Responsive Mobile & Desktop View</span>
      </div>

      <button
        onClick={handleInstallClick}
        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all text-xs"
      >
        <Download className="w-3.5 h-3.5" />
        {isInstalled ? 'App Installed ✅' : 'Download Mobile / Desktop App'}
      </button>
    </div>
  );
}
