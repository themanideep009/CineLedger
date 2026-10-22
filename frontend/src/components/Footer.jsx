import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Database, Lock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-3.5 px-6 md:px-12 mt-auto text-slate-400 text-xs">
      <div className="w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Official Brand Logo & App Name (Wider & Smaller) */}
        <Link to="/" className="flex items-center space-x-2.5 cursor-pointer group shrink-0">
          <img
            src="/logo.png"
            alt="CineLedger Logo"
            className="h-6 w-auto object-contain bg-transparent border-0 group-hover:scale-105 transition-transform"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-tight text-white flex items-center gap-1">
              CINE<span className="gradient-text">LEDGER</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium border-l border-slate-800 pl-2 hidden sm:inline">
              SINCE 2026 • TICKETING & BOX OFFICE
            </span>
          </div>
        </Link>

        {/* Security Badges (Compact & Horizontal) */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-semibold">
          <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800/80">
            <Lock className="w-3 h-3 text-emerald-400" /> Cryptographic QR Security
          </span>
          <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800/80">
            <Database className="w-3 h-3 text-cyan-400" /> Atomic Seat Lock
          </span>
          <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800/80">
            <ShieldCheck className="w-3 h-3 text-amber-400" /> Auditable Box-Office Ledger
          </span>
        </div>

        {/* Copyright */}
        <div className="text-center sm:text-right text-[10px] text-slate-500 font-medium shrink-0">
          <p>© 2026 CineLedger Engine</p>
        </div>
      </div>
    </footer>
  );
};
