import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { DisputeResolutionDrawer } from '../components/DisputeResolutionDrawer';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  ShieldCheck,
  Film,
  MapPin,
  Database,
  Filter,
  PlusCircle,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Radio,
  Eye,
} from 'lucide-react';

export const ProducerDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState({ byCity: [], byState: [] });
  const [settlement, setSettlement] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isDisputeDrawerOpen, setIsDisputeDrawerOpen] = useState(false);

  // Publish Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [durationMin, setDurationMin] = useState(150);
  const [genre, setGenre] = useState('Action / Thriller');
  const [posterUrl, setPosterUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [publishMsg, setPublishMsg] = useState('');

  const fetchProducerCollections = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('cineledger_token');

      const summaryRes = await fetch('/api/collections/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data.summary);
      }

      const breakdownRes = await fetch('/api/collections/breakdown', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (breakdownRes.ok) {
        const data = await breakdownRes.json();
        setBreakdown(data);
      }

      const settlementRes = await fetch('/api/collections/settlement', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (settlementRes.ok) {
        const data = await settlementRes.json();
        setSettlement(data);
      }

      const auditRes = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducerCollections();
  }, [fetchProducerCollections]);

  const handlePublishMovie = async (e) => {
    e.preventDefault();
    setPublishMsg('');
    try {
      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('cineledger_token')}`,
        },
        body: JSON.stringify({
          title,
          description,
          language,
          durationMin: Number(durationMin),
          genre,
          posterUrl: posterUrl || '/posters/kalki.jpg',
          bannerUrl: bannerUrl || '/banners/kalki.jpg',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to publish movie');

      setPublishMsg(`Movie "${data.title}" published successfully!`);
      setTitle('');
      setDescription('');
      setTimeout(() => {
        setIsPublishOpen(false);
        setPublishMsg('');
      }, 1000);
    } catch (err) {
      setPublishMsg(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading box-office collection analytics...</div>;
  }

  const pieData = [
    { name: 'Internal Verified', value: summary?.internalRevenue || 0, color: '#06b6d4' },
    { name: 'External Partner (BookMyShow)', value: summary?.externalRevenue || 0, color: '#f59e0b' },
  ];

  const financials = settlement?.financials || {};
  const auditStatus = settlement?.auditStatus || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Producer Header Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Gated Financial Collections Intelligence
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {user?.producerCompany || 'Producer Box-Office Portal'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated box office reporting strictly for movies owned by your production house
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsPublishOpen(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Publish New Movie
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4 text-amber-400" /> Export Settlement Statement
          </button>
        </div>
      </div>

      {/* Live Ticker Bar */}
      <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex items-center justify-between text-xs text-cyan-300 overflow-hidden">
        <span className="flex items-center gap-2 shrink-0 font-bold">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" /> Live Ticker Feed:
        </span>
        <marquee className="text-slate-300 font-mono text-[11px] truncate">
          +2 Tickets Booked at PVR Phoenix Mumbai • Kalki 2898 AD Gross: ₹7,00,000 • Inox Delhi Gate Scan Audit Synchronized • Internal Verified Ratio: 64%
        </marquee>
      </div>

      {/* Audit & Dispute Status Alert Banner */}
      {auditStatus.status === 'VARIANCE_FLAGGED' ? (
        <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-300 text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-sm text-amber-200">Discrepancy Variance Flagged</div>
              <div>{auditStatus.message}</div>
            </div>
          </div>

          <button
            onClick={() => setIsDisputeDrawerOpen(true)}
            className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all"
          >
            <Eye className="w-4 h-4" /> Inspect Audit Proof & Dispute
          </button>
        </div>
      ) : (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs">
          <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-sm text-emerald-200">Audited & Verified Settlement</div>
            <div>{auditStatus.message}</div>
          </div>
        </div>
      )}

      {/* Financial Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Gross Box Office</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold gradient-gold">
            ₹{summary?.totalRevenue?.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">{summary?.totalTicketsSold?.toLocaleString()} tickets sold</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-cyan-300">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Internal Collection
            </span>
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">
            ₹{summary?.internalRevenue?.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Direct theatre counter & app bookings</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5" /> External Simulated Adapter
            </span>
          </div>
          <div className="text-3xl font-extrabold text-amber-400">
            ₹{summary?.externalRevenue?.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">BookMyShow / Paytm integration feed</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-300">
            <span>Net Producer Share (55%)</span>
            <Filter className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            ₹{financials.producerShare?.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">After 18% GST tax deduction</div>
        </div>
      </div>

      {/* Financial Revenue Split & Tax Settlement Breakdown Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" /> Net Financial Settlement Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400">Total Gross Collection</span>
            <div className="text-lg font-bold text-white">₹{financials.grossRevenue?.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400">18% GST Tax Deduction</span>
            <div className="text-lg font-bold text-rose-400">- ₹{financials.gstAmount?.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400">Net Distributable Pool</span>
            <div className="text-lg font-bold text-cyan-400">₹{financials.netRevenue?.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400">Exhibitor Theatre Share (45%)</span>
            <div className="text-lg font-bold text-amber-300">₹{financials.theatreShare?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* City Breakdown Bar Chart (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" /> City-wise Collection Breakdown (Top Markets)
          </h2>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdown.byCity.slice(0, 8)}>
                <XAxis dataKey="city" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Split Pie Chart (1 col) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" /> Verified vs Estimated Split
          </h2>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  formatter={(val) => `₹${val.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400" /> Internal (Verified)
              </span>
              <span className="font-bold text-white">₹{summary?.internalRevenue?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" /> BookMyShow (Estimated)
              </span>
              <span className="font-bold text-white">₹{summary?.externalRevenue?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Movie Modal */}
      {isPublishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-400" /> Publish New Movie Title
              </h3>
              <button onClick={() => setIsPublishOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {publishMsg && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {publishMsg}
              </div>
            )}

            <form onSubmit={handlePublishMovie} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Movie Title</label>
                <input
                  type="text"
                  placeholder="Dhoom 4: Reborn"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Kannada">Kannada</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={durationMin}
                    onChange={(e) => setDurationMin(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Genre</label>
                <input
                  type="text"
                  placeholder="Action / Thriller"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Synopsis / Description</label>
                <textarea
                  rows={2}
                  placeholder="High-octane action spectacle..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Poster Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Banner Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20"
              >
                Publish Movie Title
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Proof Inspector Drawer */}
      <DisputeResolutionDrawer
        isOpen={isDisputeDrawerOpen}
        onClose={() => setIsDisputeDrawerOpen(false)}
        settlement={settlement}
        auditLogs={auditLogs}
      />
    </div>
  );
};
