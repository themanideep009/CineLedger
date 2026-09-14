import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Film, Ticket, Banknote, QrCode, TrendingUp, Users, PlusCircle, Clock, X, CheckCircle2, Calculator } from 'lucide-react';

export const TheatreDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moviesList, setMoviesList] = useState([]);

  // Modal States
  const [isAddScreenOpen, setIsAddScreenOpen] = useState(false);
  const [isAddShowOpen, setIsAddShowOpen] = useState(false);

  // Screen Form State
  const [screenName, setScreenName] = useState('');
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(10);
  const [screenMsg, setScreenMsg] = useState('');

  // Show Form State
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [showTime, setShowTime] = useState('');
  const [showPrice, setShowPrice] = useState(350);
  const [showMsg, setShowMsg] = useState('');

  // Express POS Tender Calculator State
  const [cashTendered, setCashTendered] = useState(1000);
  const [ticketCount, setTicketCount] = useState(2);

  const fetchTheatreStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/theatres/admin/my-theatre', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('cineledger_token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch theatre stats');
      const statsData = await res.json();
      setData(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMoviesList = async () => {
    try {
      const res = await fetch('/api/movies');
      if (res.ok) {
        const data = await res.json();
        setMoviesList(data);
        if (data.length > 0) setSelectedMovieId(data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTheatreStats();
    fetchMoviesList();
  }, [fetchTheatreStats]);

  const handleCreateScreen = async (e) => {
    e.preventDefault();
    setScreenMsg('');
    try {
      const res = await fetch(`/api/theatres/${data.theatre._id}/screens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('cineledger_token')}`,
        },
        body: JSON.stringify({
          name: screenName || `Audi ${data.screens.length + 1}`,
          rows: Number(rows),
          cols: Number(cols),
          vipRows: ['A', 'B'],
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Failed to add screen');

      setScreenMsg(`Screen "${resData.name}" created successfully!`);
      setScreenName('');
      setTimeout(() => {
        setIsAddScreenOpen(false);
        setScreenMsg('');
      }, 1000);
      fetchTheatreStats();
    } catch (err) {
      setScreenMsg(`Error: ${err.message}`);
    }
  };

  const handleScheduleShow = async (e) => {
    e.preventDefault();
    setShowMsg('');
    try {
      const res = await fetch('/api/shows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('cineledger_token')}`,
        },
        body: JSON.stringify({
          movieId: selectedMovieId,
          screenId: selectedScreenId || data.screens[0]?._id,
          theatreId: data.theatre._id,
          showTime,
          price: Number(showPrice),
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Failed to schedule show');

      setShowMsg('Show scheduled successfully!');
      setTimeout(() => {
        setIsAddShowOpen(false);
        setShowMsg('');
      }, 1000);
      fetchTheatreStats();
    } catch (err) {
      setShowMsg(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading theatre ops metrics...</div>;
  }

  if (!data || !data.theatre) {
    return <div className="text-center py-20 text-slate-400">No theatre assigned to this account.</div>;
  }

  const { theatre, screens, shows, stats } = data;
  const unitPrice = shows.length > 0 ? shows[0].price : 350;
  const totalAmount = unitPrice * ticketCount;
  const changeReturn = Math.max(0, cashTendered - totalAmount);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Theatre Header Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" /> Single-Theatre Admin Access
          </div>
          <h1 className="text-3xl font-extrabold text-white">{theatre.name}</h1>
          <p className="text-xs text-slate-400 mt-1">
            {theatre.village ? `${theatre.village}, ` : ''}
            {theatre.city}, {theatre.district}, {theatre.state}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAddScreenOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" /> Add Screen
          </button>

          <button
            onClick={() => {
              if (screens.length > 0 && !selectedScreenId) setSelectedScreenId(screens[0]._id);
              setIsAddShowOpen(true);
            }}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Schedule Show
          </button>

          <Link
            to="/scan-entry"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
          >
            <QrCode className="w-4 h-4" /> Gate Scan Station
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Occupancy Rate</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.occupancyRate}%</div>
          <div className="text-[11px] text-slate-400">{stats.totalTicketsSold} tickets booked overall</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Theatre Net Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">₹{stats.totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">Internal verified revenue only</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Counter Cash/UPI Sales</span>
            <Banknote className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-300">₹{stats.counterRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">Walk-in counter desk tickets</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Online App Sales</span>
            <Ticket className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-300">₹{stats.onlineRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">Online customer app bookings</div>
        </div>
      </div>

      {/* Express POS Tender Calculator Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" /> Front-Desk Express POS Counter Kiosk
          </h2>
          <span className="text-xs text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
            Walk-in Desk Mode
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Ticket Quantity</label>
            <input
              type="number"
              min={1}
              max={10}
              value={ticketCount}
              onChange={(e) => setTicketCount(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Total Payable Amount</label>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-amber-400 font-bold text-base">
              ₹{totalAmount}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Cash Tendered (₹)</label>
            <input
              type="number"
              step={50}
              value={cashTendered}
              onChange={(e) => setCashTendered(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Change to Return Customer</label>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-bold text-base">
              ₹{changeReturn}
            </div>
          </div>
        </div>
      </div>

      {/* Screens & Scheduled Shows List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Screens */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" /> Screen Configuration
            </h2>
            <span className="text-xs text-slate-400">{screens.length} Screens active</span>
          </div>

          <div className="space-y-3">
            {screens.map((screen) => (
              <div
                key={screen._id}
                className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-white">{screen.name}</h3>
                  <div className="text-xs text-slate-400">
                    Grid: {screen.rows} Rows × {screen.cols} Cols ({screen.capacity} Seats)
                  </div>
                </div>
                <span className="text-xs bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded border border-cyan-800 font-semibold">
                  VIP: {screen.vipRows?.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shows List */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-cyan-400" /> Scheduled Shows
            </h2>
            <span className="text-xs text-slate-400">{shows.length} shows scheduled</span>
          </div>

          <div className="space-y-3">
            {shows.map((show) => (
              <div
                key={show._id}
                className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <h3 className="text-sm font-bold text-white">{show.movieId?.title}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {new Date(show.showTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <span>•</span>
                    <span>₹{show.price}</span>
                  </div>
                </div>

                <Link
                  to={`/seat-map/${show._id}`}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-colors shrink-0"
                >
                  Counter Sale Seat Map →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Screen Modal */}
      {isAddScreenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add New Cinema Screen</h3>
              <button onClick={() => setIsAddScreenOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {screenMsg && (
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {screenMsg}
              </div>
            )}

            <form onSubmit={handleCreateScreen} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Screen / Audi Name</label>
                <input
                  type="text"
                  placeholder="Audi 3 (Laser 3D)"
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Number of Rows</label>
                  <input
                    type="number"
                    min={4}
                    max={12}
                    value={rows}
                    onChange={(e) => setRows(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Seats Per Row</label>
                  <input
                    type="number"
                    min={6}
                    max={16}
                    value={cols}
                    onChange={(e) => setCols(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl text-[11px] text-slate-400">
                Calculated Screen Capacity: <span className="font-bold text-white">{rows * cols} Seats</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition-all"
              >
                Create Screen
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Show Modal */}
      {isAddShowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Schedule New Movie Show</h3>
              <button onClick={() => setIsAddShowOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {showMsg && (
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {showMsg}
              </div>
            )}

            <form onSubmit={handleScheduleShow} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Select Movie</label>
                <select
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                >
                  {moviesList.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.language})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Select Screen</label>
                <select
                  value={selectedScreenId}
                  onChange={(e) => setSelectedScreenId(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                >
                  {screens.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.capacity} Seats)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Show Time</label>
                <input
                  type="datetime-local"
                  value={showTime}
                  onChange={(e) => setShowTime(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Ticket Price (₹)</label>
                <input
                  type="number"
                  value={showPrice}
                  onChange={(e) => setShowPrice(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition-all"
              >
                Confirm Show Schedule
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
