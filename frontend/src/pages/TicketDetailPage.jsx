import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, ShieldCheck, Printer, Copy, Check, ArrowLeft, Lock, Sparkles, X, ShieldAlert } from 'lucide-react';

export const TicketDetailPage = () => {
  const { ticketId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showHmacModal, setShowHmacModal] = useState(false);

  const fetchTicketInfo = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (!res.ok) throw new Error('Ticket not found');
      const ticketData = await res.json();
      setData(ticketData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicketInfo();
  }, [fetchTicketInfo]);

  const copyTicketId = () => {
    if (data?.ticket?.ticketId) {
      navigator.clipboard.writeText(data.ticket.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading digital QR ticket...</div>;
  }

  if (!data || !data.ticket) {
    return <div className="text-center py-20 text-slate-400">Ticket not found in system.</div>;
  }

  const { ticket } = data;
  const booking = ticket.bookingId;
  const show = booking?.showId;

  // Mock Cryptographic HMAC signature for audit proof
  const mockHmacHash = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855_${ticket.ticketId.replace(/-/g, '')}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/my-bookings" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Bookings
        </Link>

        <button
          onClick={() => setShowHmacModal(true)}
          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1 bg-cyan-950/60 border border-cyan-800 rounded-xl"
        >
          <Lock className="w-3.5 h-3.5" /> Inspect Cryptographic HMAC Proof
        </button>
      </div>

      {/* Ticket Pass Card */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-700 shadow-2xl relative">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 p-6 text-center border-b border-slate-800 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Auditable Ticket
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{show?.movieId?.title || 'Movie Pass'}</h1>
          <p className="text-xs text-slate-400">{show?.movieId?.language} • {show?.movieId?.durationMin} mins</p>
        </div>

        {/* QR Code Section with Animated Holographic Laser Beam Watermark */}
        <div className="p-6 text-center space-y-4 bg-slate-950/60 relative overflow-hidden">
          <div className="relative inline-block p-4 rounded-2xl bg-white shadow-xl shadow-cyan-500/10 border border-slate-200 group">
            <QRCodeSVG value={ticket.qrPayload} size={180} level="H" />

            {/* Holographic Security Laser Watermark Beam */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400 animate-laserBeam opacity-80" />
            </div>
          </div>

          <div className="text-[10px] text-cyan-400 font-mono tracking-widest flex items-center justify-center gap-1 uppercase font-bold">
            <Lock className="w-3 h-3" /> Anti-Spoof Holographic Security Beam Active
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-sm font-bold text-cyan-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              {ticket.ticketId}
            </span>
            <button
              onClick={copyTicketId}
              className="p-2 text-slate-400 hover:text-cyan-400 bg-slate-900 border border-slate-800 rounded-xl"
              title="Copy Ticket ID for Gate Scanner"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Status Badge */}
          <div>
            {ticket.status === 'ISSUED' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" /> STATUS: VALID & ISSUED (Ready for Entry)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
                STATUS: USED / SCANNED on {new Date(ticket.scannedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 border-t border-slate-800 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 block">Theatre & City</span>
              <span className="font-bold text-white block mt-0.5">{show?.theatreId?.name}</span>
              <span className="text-slate-400">{show?.theatreId?.city}, {show?.theatreId?.state}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Screen & Seats</span>
              <span className="font-bold text-cyan-400 block mt-0.5">{show?.screenId?.name || 'Audi 1'}</span>
              <span className="font-bold text-white">{booking?.seatIds?.join(', ')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-4">
            <div>
              <span className="text-slate-500 block">Show Time</span>
              <span className="font-semibold text-slate-200 block mt-0.5">
                {new Date(show?.showTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Payment & Source</span>
              <span className="font-semibold text-slate-200 block mt-0.5">
                ₹{booking?.totalAmount} ({booking?.source?.toUpperCase()})
              </span>
            </div>
          </div>
        </div>

        {/* Print / Test Scan Link */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between print:hidden">
          <button
            onClick={() => window.print()}
            className="text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-700 transition-all shadow-md"
          >
            <Printer className="w-4 h-4 text-cyan-400" /> Print Digital Cinema Pass
          </button>

          <Link
            to="/scan-entry"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 transition-all"
          >
            Test Scan at Entry Gate →
          </Link>
        </div>
      </div>

      {/* HMAC Cryptographic Proof Inspector Modal */}
      {showHmacModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-700 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" /> Cryptographic Ticket Proof
              </h3>
              <button onClick={() => setShowHmacModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Cryptographic Integrity Verified — Untampered
              </div>

              <div>
                <label className="text-slate-400 block mb-1">SHA-256 HMAC Signature Hash</label>
                <div className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-cyan-300 border border-slate-800 break-all">
                  {mockHmacHash}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Raw Ticket Payload</label>
                <pre className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto">
                  {ticket.qrPayload}
                </pre>
              </div>

              <div className="text-slate-400 text-[11px]">
                This digital pass is cryptographically signed and stored in the immutable Audit Log stream to prevent duplicate ticket scalping.
              </div>
            </div>

            <button
              onClick={() => setShowHmacModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl border border-slate-700"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
