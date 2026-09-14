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
  Tv,
  Users,
  Calendar,
  Layers,
  Search,
} from 'lucide-react';

export const CollectionsDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState({ byCity: [], byState: [] });
  const [settlement, setSettlement] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Show Performance Collections State
  const [showsData, setShowsData] = useState([]);
  const [showsSummary, setShowsSummary] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
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

  const fetchCollectionsData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('cineledger_token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Aggregated Summary
      const summaryRes = await fetch('/api/collections/summary', { headers });
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data.summary);
      }

      // 2. Fetch City & State Breakdown
      const breakdownRes = await fetch('/api/collections/breakdown', { headers });
      if (breakdownRes.ok) {
        const data = await breakdownRes.json();
        setBreakdown(data);
      }

      // 3. Fetch Settlement Financials
      const settlementRes = await fetch('/api/collections/settlement', { headers });
      if (settlementRes.ok) {
        const data = await settlementRes.json();
        setSettlement(data);
      }

      // 4. Fetch Detailed Show-level Collections & Location Metrics
      let showUrl = '/api/collections/shows';
      const params = new URLSearchParams();
      if (selectedMovie) params.append('movieId', selectedMovie);
      if (selectedCity) params.append('city', selectedCity);
      if (params.toString()) showUrl += `?${params.toString()}`;

      const showsRes = await fetch(showUrl, { headers });
      if (showsRes.ok) {
        const data = await showsRes.json();
        setShowsData(data.shows || []);
        setShowsSummary(data.summary || null);
      }

      // 5. Fetch Audit Logs
      const auditRes = await fetch('/api/admin/audit-logs', { headers });
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedMovie, selectedCity]);

  useEffect(() => {
    fetchCollectionsData();
  }, [fetchCollectionsData]);

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
        fetchCollectionsData();
      }, 1000);
    } catch (err) {
      setPublishMsg(`Error: ${err.message}`);
    }
  };

  if (loading && !showsSummary) {
    return <div className="text-center py-20 text-slate-400">Loading CineLedger Box-Office Collections Intelligence...</div>;
  }

  const pieData = [
    { name: 'Internal Verified', value: summary?.internalRevenue || 0, color: '#06b6d4' },
    { name: 'External Partner (BookMyShow)', value: summary?.externalRevenue || 0, color: '#f59e0b' },
  ];

  const financials = settlement?.financials || {};
  const auditStatus = settlement?.auditStatus || {};

  // Extract unique cities from breakdown for filter dropdown
  const availableCities = Array.from(new Set(breakdown.byCity.map((item) => item.city)));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> CineLedger Gated Box-Office Intelligence
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {user?.role === 'PRODUCER' ? (user?.producerCompany || 'Producer Collections Portal') : 'Super Admin Movie Collections Hub'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time show analytics, seat occupancy metrics, and transparent net revenue breakdown across all multiplex screens.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user?.role === 'PRODUCER' && (
            <button
              onClick={() => setIsPublishOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Publish New Movie
            </button>
          )}

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
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" /> Live Collection Feed:
        </span>
        <marquee className="text-slate-300 font-mono text-[11px] truncate">
          + Multi-Screen Telemetry Active • Total {showsSummary?.totalShows || 0} Shows Running Across {showsSummary?.cityCount || 0} Hub Cities • Verified Occupancy Rate: {showsSummary?.avgOccupancy || 0}% • Cryptographic Gate Verification Enabled
        </marquee>
      </div>

      {/* Audit Alert Banner */}
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

      {/* Primary Financial & Show Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gross Box Office Collection */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span>Total Gross Box Office</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold gradient-gold">
            ₹{summary?.totalRevenue?.toLocaleString() || '0'}
          </div>
          <div className="text-[11px] text-slate-400">
            {summary?.totalTicketsSold?.toLocaleString() || '0'} tickets sold across all shows
          </div>
        </div>

        {/* Active Running Shows */}
        <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-cyan-300">
            <span className="flex items-center gap-1">
              <Tv className="w-3.5 h-3.5" /> Running Shows Count
            </span>
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">
            {showsSummary?.totalShows || 0} Shows
          </div>
          <div className="text-[11px] text-slate-400">
            Across {showsSummary?.cityCount || 0} cities & multi-screen auditoriums
          </div>
        </div>

        {/* Seats Booked vs Capacity */}
        <div className="glass-card p-6 rounded-2xl border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-300">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Booked Seats & Occupancy
            </span>
          </div>
          <div className="text-3xl font-extrabold text-purple-400">
            {showsSummary?.avgOccupancy || 0}%
          </div>
          <div className="text-[11px] text-slate-400">
            {showsSummary?.totalSeatsBooked || 0} / {showsSummary?.totalCapacity || 0} seats reserved
          </div>
        </div>

        {/* Net Producer Share */}
        <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-300">
            <span>Net Producer Share (55%)</span>
            <Filter className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            ₹{financials.producerShare?.toLocaleString() || '0'}
          </div>
          <div className="text-[11px] text-slate-400">After 18% GST tax settlement pool</div>
        </div>
      </div>

      {/* Show Performance & Location Collections Section */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-400" /> Show Collections & Location Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Detailed tracking of running showtimes, screen locations, booked seats, and revenue. (Read-only analytical view — No ticket booking available)
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-slate-200 outline-none text-xs"
              >
                <option value="" className="bg-slate-900">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city} className="bg-slate-900">
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Shows Table / Grid */}
        {showsData.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs space-y-2">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <div>No running shows matching the selected location filters.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Movie Title</th>
                  <th className="py-3 px-4">Location (City & Theatre)</th>
                  <th className="py-3 px-4">Screen / Hall</th>
                  <th className="py-3 px-4">Showtime</th>
                  <th className="py-3 px-4">Price / Seat</th>
                  <th className="py-3 px-4">Booked Seats / Capacity</th>
                  <th className="py-3 px-4">Occupancy</th>
                  <th className="py-3 px-4 text-right">Show Collections</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {showsData.map((show) => (
                  <tr key={show._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {show.movie?.title}
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <div className="font-semibold text-cyan-300">{show.theatre?.city}</div>
                      <div className="text-[11px] text-slate-400">{show.theatre?.name}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-medium text-[11px]">
                        {show.screen?.name}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        {new Date(show.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">₹{show.price}</td>

                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {show.bookedSeatsCount} / {show.totalCapacity} seats
                    </td>

                    <td className="py-3 px-4">
                      <div className="w-28 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-mono">{show.occupancyRate}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              show.occupancyRate > 50 ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${Math.min(100, show.occupancyRate)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-emerald-400 text-sm font-mono">
                      ₹{show.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Financial Settlement Split Breakdown Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" /> Net Financial Settlement Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400">Total Gross Collection</span>
            <div className="text-lg font-bold text-white">₹{financials.grossRevenue?.toLocaleString() || '0'}</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400">18% GST Tax Deduction</span>
            <div className="text-lg font-bold text-rose-400">- ₹{financials.gstAmount?.toLocaleString() || '0'}</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400">Net Distributable Pool</span>
            <div className="text-lg font-bold text-cyan-400">₹{financials.netRevenue?.toLocaleString() || '0'}</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400">Exhibitor Theatre Share (45%)</span>
            <div className="text-lg font-bold text-amber-300">₹{financials.theatreShare?.toLocaleString() || '0'}</div>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* City Breakdown Bar Chart */}
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

        {/* Source Split Pie Chart */}
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
              <span className="font-bold text-white">₹{summary?.internalRevenue?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" /> External Partner (BookMyShow)
              </span>
              <span className="font-bold text-white">₹{summary?.externalRevenue?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Movie Modal (Producers only) */}
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
