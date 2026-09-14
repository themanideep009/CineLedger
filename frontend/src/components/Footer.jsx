import React from 'react';
import { ShieldCheck, Database, Lock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-8 px-4 mt-auto text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="CineLedger Logo"
            className="h-7 w-auto object-contain bg-transparent border-0"
          />
          <span className="font-bold text-slate-200">CINELEDGER</span>
          <span className="text-slate-500">|</span>
          <span>Unified & Auditable Movie Ticketing Engine (Since 2026)</span>
        </div>

        <div className="flex items-center space-x-6 text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Tamper-Evident Audit Logging
          </span>
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-cyan-400" /> Atomic Concurrency Locked
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Role Gated Financials
          </span>
        </div>
      </div>
    </footer>
  );
};
