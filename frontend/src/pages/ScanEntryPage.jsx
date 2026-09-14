import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, CheckCircle2, AlertOctagon, XCircle, Camera, Search, Volume2, VolumeX, History, Ticket } from 'lucide-react';
import { audioSynth } from '../utils/AudioSynth';
import { useToast } from '../context/ToastContext';

export const ScanEntryPage = () => {
  const { addToast } = useToast();
  const [inputCode, setInputCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [scanHistory, setScanHistory] = useState([]);
  const scannerRef = useRef(null);

  const stopCameraScanner = useCallback(() => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          setScanning(false);
        })
        .catch((err) => console.error(err));
    } else {
      setScanning(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCameraScanner();
    };
  }, [stopCameraScanner]);

  const verifyTicket = async (codeToVerify) => {
    const code = codeToVerify || inputCode;
    if (!code) return;

    setLoading(true);
    setScanResult(null);

    try {
      const res = await fetch('/api/tickets/verify-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('cineledger_token')}`,
        },
        body: JSON.stringify({ ticketId: code, qrData: code }),
      });

      const data = await res.json();
      const resultObj = {
        status: res.status,
        valid: data.valid,
        message: data.message,
        ticket: data.ticket,
        timestamp: new Date(),
      };

      setScanResult(resultObj);

      if (data.valid) {
        if (audioEnabled) audioSynth.playSuccessChime();
        addToast(`✅ ENTRY GRANTED: ${data.message}`, 'success');
      } else {
        if (audioEnabled) audioSynth.playErrorBuzzer();
        addToast(`❌ ENTRY DENIED: ${data.message}`, 'error');
      }

      // Add to live gate scan history feed
      setScanHistory((prev) => [resultObj, ...prev.slice(0, 9)]);
    } catch {
      setScanResult({
        status: 500,
        valid: false,
        message: 'Network error verifying ticket scan.',
        timestamp: new Date(),
      });
      if (audioEnabled) audioSynth.playErrorBuzzer();
    } finally {
      setLoading(false);
    }
  };

  const startCameraScanner = async () => {
    try {
      setScanResult(null);
      setScanning(true);
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          verifyTicket(decodedText);
          stopCameraScanner();
        },
        () => {
          // ignore frame errors
        }
      );
    } catch (err) {
      console.error('Camera error:', err);
      setScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 p-2 px-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-1">
            <QrCode className="w-4 h-4" /> Live Gate Entry Station
          </div>
          <h1 className="text-2xl font-bold text-white">Gate Scanner & Ticket Verification Engine</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Validate digital or printed QR tickets at entrance gates to prevent duplicate entry reuse.
          </p>
        </div>

        {/* Mute Audio Switch */}
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
            audioEnabled
              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          <span>{audioEnabled ? 'Synth Chime Sound ON' : 'Sound Muted'}</span>
        </button>
      </div>

      {/* Main Grid: Scanner & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scanner Viewport */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
          {/* Camera Scanner Viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 min-h-[220px] flex items-center justify-center p-4">
            <div id="qr-reader" className="w-full max-w-sm overflow-hidden rounded-xl" />

            {!scanning && (
              <div className="text-center space-y-3 py-6">
                <Camera className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="text-xs text-slate-400">Webcam scanner ready</div>
                <button
                  onClick={startCameraScanner}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" /> Start Webcam Scanner
                </button>
              </div>
            )}

            {scanning && (
              <button
                onClick={stopCameraScanner}
                className="absolute top-3 right-3 px-3 py-1 bg-rose-500/80 text-white rounded-lg text-xs font-bold"
              >
                Stop Camera
              </button>
            )}
          </div>

          {/* Manual Input Code Form */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Manual Ticket ID or QR Code String Input
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. CL-MUM-8X91 or paste QR string"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && verifyTicket()}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <button
                onClick={() => verifyTicket()}
                disabled={loading || !inputCode}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Ticket'}
              </button>
            </div>
          </div>

          {/* Quick Test Demo Codes */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Quick Test Codes:</span>
            <button
              onClick={() => {
                setInputCode('CL-MUM-8X91');
                verifyTicket('CL-MUM-8X91');
              }}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 font-mono border border-slate-800"
            >
              CL-MUM-8X91 (Valid)
            </button>
            <button
              onClick={() => {
                setInputCode('CL-CNT-9922');
                verifyTicket('CL-CNT-9922');
              }}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono border border-slate-800"
            >
              CL-CNT-9922 (Already Used)
            </button>
          </div>
        </div>

        {/* Right 1 Col: Live Gate Log History Feed */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" /> Recent Gate Scan Stream
          </h2>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {scanHistory.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs italic">
                No tickets scanned in this gate session yet.
              </div>
            ) : (
              scanHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                    item.valid
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{item.ticket?.ticketId || 'SCAN'}</span>
                    <span className="text-[10px] opacity-75">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[11px] opacity-90 truncate">{item.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Verification Result Flash Banner */}
      {scanResult && (
        <div
          className={`p-6 rounded-3xl border shadow-2xl transition-all ${
            scanResult.valid
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100 glow-emerald'
              : scanResult.status === 'USED'
              ? 'bg-amber-950/80 border-amber-500 text-amber-100'
              : 'bg-rose-950/80 border-rose-500 text-rose-100'
          }`}
        >
          <div className="flex items-start gap-4">
            {scanResult.valid ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-400 shrink-0 mt-1" />
            ) : scanResult.status === 'USED' ? (
              <AlertOctagon className="w-10 h-10 text-amber-400 shrink-0 mt-1" />
            ) : (
              <XCircle className="w-10 h-10 text-rose-400 shrink-0 mt-1" />
            )}

            <div className="space-y-3 flex-1">
              <div>
                <h2 className="text-lg font-extrabold tracking-wide uppercase">
                  {scanResult.valid
                    ? '✅ ENTRY GRANTED — TICKET VALID'
                    : scanResult.status === 'USED'
                    ? '⚠️ DUPLICATE ENTRY DENIED'
                    : '❌ INVALID TICKET'}
                </h2>
                <p className="text-xs opacity-90 mt-0.5">{scanResult.message}</p>
              </div>

              {scanResult.ticket && (
                <div className="p-3 bg-black/40 rounded-xl space-y-1 text-xs font-mono border border-white/10">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-cyan-400" />
                    <span>
                      Ticket ID: <span className="font-bold text-white">{scanResult.ticket.ticketId}</span>
                    </span>
                  </div>
                  <div>
                    Seats:{' '}
                    <span className="font-bold text-white">
                      {scanResult.ticket.bookingId?.seatIds?.join(', ')}
                    </span>
                  </div>
                  <div>
                    Movie:{' '}
                    <span className="text-white">
                      {scanResult.ticket.bookingId?.showId?.movieId?.title}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
