import React from 'react';
import { ShieldAlert, CheckCircle2, Lock, FileText, AlertOctagon, X } from 'lucide-react';

export const DisputeResolutionDrawer = ({ isOpen, onClose, settlement, auditLogs }) => {
  if (!isOpen) return null;

  const financials = settlement?.financials || {};
  const auditStatus = settlement?.auditStatus || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl h-full glass-panel border-l border-slate-700 p-6 md:p-8 space-y-6 overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-bold mb-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Cryptographic Box-Office Audit Trail
            </div>
            <h2 className="text-xl font-bold text-white">Audit Proof & Dispute Resolution Drawer</h2>
            <p className="text-xs text-slate-400">
              Side-by-side comparative inspection between verified gate scan audit logs and external partner sales feeds.
            </p>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Audit Status Banner */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
          <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-amber-300">
              Audit Status: {auditStatus.status || 'VARIANCE_FLAGGED'} (Variance Ratio: {auditStatus.varianceRatio}%)
            </div>
            <div>{auditStatus.message}</div>
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Left Column: Internal Verified Gate Scans */}
          <div className="p-4 bg-cyan-950/40 rounded-2xl border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-800/60 pb-2">
              <h3 className="font-bold text-cyan-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Internal Gate Scan Audit Logs
              </h3>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">100% VERIFIED</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Internal Gate Gross:</span>
                <span className="font-bold text-white">₹{financials.internalRev?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Source Method:</span>
                <span className="text-cyan-300 font-mono">Counter POS + App Tickets</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Cryptographic Proof:</span>
                <span className="text-emerald-400 font-mono">HMAC SHA-256 Validated</span>
              </div>
            </div>
          </div>

          {/* Right Column: External Partner Reported Feed */}
          <div className="p-4 bg-amber-950/40 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-800/60 pb-2">
              <h3 className="font-bold text-amber-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" /> BookMyShow Aggregator Feed
              </h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">SIMULATED FEED</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>External Reported Gross:</span>
                <span className="font-bold text-white">₹{financials.externalRev?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Source Method:</span>
                <span className="text-amber-300 font-mono">External Partner API Sync</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Variance Threshold:</span>
                <span className="text-rose-400 font-mono">Max 15% Tolerance Exceeded</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log Events List Stream */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" /> Recent Audit Event Statements
          </h3>

          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {auditLogs && auditLogs.length > 0 ? (
              auditLogs.slice(0, 6).map((log) => (
                <div key={log._id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-cyan-300">{log.action}</span>
                    <span className="text-slate-400 text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Actor: <span className="text-slate-200">{log.actorName}</span> ({log.actorRole})
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-xs italic">No specific audit log entries found for this report.</div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
          >
            Close Audit Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
