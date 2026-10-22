import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Clock, ChevronDown, Building2, Ticket, Sparkles, Mic, Trophy, Star, ShieldCheck, Play } from 'lucide-react';
import { useCity } from '../context/CityContext';
import { useAuth } from '../context/AuthContext';
import { FeaturedPromoCarousel } from '../components/FeaturedPromoCarousel';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const { selectedCity, openCityModal, selectCity } = useCity();
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);

  const isPrivilegedUser = user && ['THEATRE_ADMIN', 'PRODUCER', 'SUPER_ADMIN'].includes(user.role);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeGenre, setActiveGenre] = useState('ALL');
  
  // View mode defaults to PLAYS ('PLAYS', 'EVENTS', 'SPORTS', 'THEATRES')
  const [viewMode, setViewMode] = useState(() => {
    const cat = searchParams.get('category');
    if (cat === 'EVENTS') return 'EVENTS';
    if (cat === 'SPORTS') return 'SPORTS';
    if (cat === 'THEATRES') return 'THEATRES';
    return 'PLAYS';
  });

  // Keep viewMode synced with searchParams category query
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat === 'EVENTS') setViewMode('EVENTS');
    else if (cat === 'SPORTS') setViewMode('SPORTS');
    else if (cat === 'THEATRES') setViewMode('THEATRES');
    else if (cat === 'PLAYS') setViewMode('PLAYS');
  }, [searchParams]);

  const fetchMoviesAndShows = useCallback(async () => {
    try {
      setLoading(true);
      const moviesRes = await fetch('/api/movies');
      const moviesData = await moviesRes.json();
      setMovies(moviesData);

      const showsQuery = selectedCity ? `/api/shows?city=${encodeURIComponent(selectedCity)}` : '/api/shows';
      const showsRes = await fetch(showsQuery);
      const showsData = await showsRes.json();
      setShows(showsData);
    } catch (err) {
      console.error('Error fetching catalog data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    fetchMoviesAndShows();
  }, [fetchMoviesAndShows]);

  // Filter listings based on search query, genre, and viewMode
  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.language.toLowerCase().includes(search.toLowerCase()) ||
      m.genre.toLowerCase().includes(search.toLowerCase());

    let matchesViewMode = true;
    if (viewMode === 'PLAYS') {
      // Show plays, theatre, drama, musical, or general shows excluding standup & sports
      matchesViewMode =
        m.genre.toLowerCase().includes('play') ||
        m.genre.toLowerCase().includes('theatre') ||
        m.genre.toLowerCase().includes('drama') ||
        m.genre.toLowerCase().includes('musical') ||
        (!m.genre.toLowerCase().includes('sports') && !m.genre.toLowerCase().includes('standup'));
    } else if (viewMode === 'EVENTS') {
      const isStree = m.title.toLowerCase().includes('stree');
      matchesViewMode =
        !isStree &&
        (m.genre.toLowerCase().includes('standup') ||
          m.genre.toLowerCase().includes('event') ||
          (m.genre.toLowerCase().includes('comedy') && !m.genre.toLowerCase().includes('horror')));
    } else if (viewMode === 'SPORTS') {
      matchesViewMode = m.genre.toLowerCase().includes('sports') || m.genre.toLowerCase().includes('cricket');
    }

    const matchesGenre = activeGenre === 'ALL' || m.genre.toLowerCase().includes(activeGenre.toLowerCase());

    return matchesSearch && matchesViewMode && matchesGenre;
  });

  const getShowsForMovie = (movieId) => {
    return shows.filter((s) => s.movieId?._id === movieId || s.movieId === movieId);
  };

  // Group shows by Theatre for "By Theatre" view
  const showsByTheatre = useMemo(() => {
    const map = {};
    shows.forEach((show) => {
      const theatreName = show.theatreId?.name || 'Local Multiplex';
      const theatreId = show.theatreId?._id || theatreName;
      if (!map[theatreId]) {
        map[theatreId] = {
          id: theatreId,
          name: theatreName,
          village: show.theatreId?.village || 'Main Center',
          city: show.theatreId?.city || selectedCity,
          state: show.theatreId?.state || '',
          shows: [],
        };
      }
      map[theatreId].shows.push(show);
    });
    return Object.values(map);
  }, [shows, selectedCity]);

  const handleTabChange = (mode) => {
    setViewMode(mode);
    setSearchParams({ category: mode });
    setActiveGenre('ALL');
  };

  const [selectedDate, setSelectedDate] = useState('TODAY');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* ========================================================
         0. LIVE VERIFIED BOX-OFFICE TICKER BAR (Privileged Roles ONLY)
         ======================================================== */}
      {isPrivilegedUser && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 px-4 text-xs text-slate-300 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none shadow-lg animate-fade-in">
          <div className="flex items-center gap-2 font-bold shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 uppercase tracking-wider text-[11px] font-black">Internal Live Stream ({user.role})</span>
          </div>
          <div className="flex items-center gap-6 font-medium shrink-0 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <strong className="text-white font-extrabold">4,820</strong> QR Passes Verified Today
            </span>
            <span className="flex items-center gap-1.5 text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <strong className="text-white font-extrabold">₹18.4L</strong> Gross Aggregate Box-Office
            </span>
            <span className="flex items-center gap-1.5 text-slate-200">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <strong className="text-white font-extrabold">{showsByTheatre.length}</strong> Operating Venues
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
         1. HERO HEADER SECTION (Illuminated Grand Theatre Stage Background)
         ======================================================== */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-8 md:p-12 shadow-2xl border border-slate-700/80 group">
        {/* Illuminated Grand Theatre Stage Background Picture */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/banners/theatre_hero.jpg"
            alt="Illuminated Grand Theatre Stage"
            className="w-full h-full object-cover object-center transform scale-105 filter brightness-75 contrast-120 group-hover:scale-110 transition-transform duration-1000 opacity-90"
          />
          {/* Vibrant Gradient Overlays for High Contrast Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/55 to-slate-950/30 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40 z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 z-10" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Next-Gen Ticketing & Box Office Verification Engine</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Every Seat. Every Ticket. <br />
            <span className="text-emerald-400">Every Verified Stage & Collection.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed font-medium">
            Real-time seat mapping with atomic double-booking protection, instant QR code passes, and auditable stage & show box-office reporting.
          </p>

          {/* Search Controls (Clean & Full-Width inside First Card) */}
          <div className="pt-3 max-w-2xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
              <input
                type="text"
                placeholder="Search plays, theatre, events, language, genre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-sm font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 shadow-inner transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
         2. FEATURED PROMOTIONAL BANNER SLIDER
         ======================================================== */}
      <FeaturedPromoCarousel shows={shows} />

      {/* ========================================================
         3. CATEGORY VIEW TABS, GENRE STRIP & CITY SELECTOR
         ======================================================== */}
      <div className="space-y-4 border-b border-slate-200 pb-5">
        {/* Row 1: Main View Mode Toggle Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-full border border-slate-200/80 shadow-inner overflow-x-auto max-w-full scrollbar-none">
          <button
            onClick={() => handleTabChange('PLAYS')}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              viewMode === 'PLAYS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600/20'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-200" /> Plays & Theatre
          </button>

          <button
            onClick={() => handleTabChange('EVENTS')}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              viewMode === 'EVENTS'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-600/20'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Mic className="w-4 h-4 text-amber-500" /> Standup Comedy & Events
          </button>

          <button
            onClick={() => handleTabChange('SPORTS')}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              viewMode === 'SPORTS'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 ring-2 ring-cyan-600/20'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Trophy className="w-4 h-4 text-cyan-500" /> IPL Cricket & Sports
          </button>

          <button
            onClick={() => handleTabChange('THEATRES')}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              viewMode === 'THEATRES'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/30 ring-2 ring-slate-900/20'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" /> Theatres in {selectedCity} ({showsByTheatre.length})
          </button>
        </div>

        {/* Row 2: Genre Tags Filter Line */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full scrollbar-none pt-1">
          <span className="text-xs text-slate-500 font-bold mr-1 shrink-0">Genre:</span>
          {['ALL', 'Plays & Theatre', 'Drama', 'Musical', 'Comedy', 'Action', 'Sci-Fi', 'Sports / Cricket', 'Standup Comedy'].map((g) => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeGenre === g
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-500 hover:text-emerald-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Row 3: Select Cities Option (Placed Perfectly Below the Genre Line) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full scrollbar-none py-0.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-extrabold mr-1 shrink-0">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Select City:</span>
            </div>

            {/* Popular City Quick Select Pills */}
            {['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur'].map((cityName) => {
              const isSelected = selectedCity === cityName;
              return (
                <button
                  key={cityName}
                  onClick={() => selectCity(cityName)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30 font-extrabold'
                      : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/80'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  {cityName}
                </button>
              );
            })}
          </div>

          {/* More Cities Modal Trigger Button */}
          <button
            onClick={openCityModal}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 hover:bg-emerald-600 text-white text-xs font-extrabold transition-all cursor-pointer shadow-xs shrink-0 group self-start sm:self-auto"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
            <span>More Cities ({selectedCity || 'All'})</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
          </button>
        </div>

        {/* Row 4: Interactive Showtime Date Filter Line */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full scrollbar-none pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-extrabold mr-1 shrink-0">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Show Date:</span>
          </div>

          {[
            { id: 'TODAY', label: 'Today', dateStr: '15 Sep' },
            { id: 'TOMORROW', label: 'Tomorrow', dateStr: '16 Sep' },
            { id: 'THU', label: 'Thu', dateStr: '17 Sep' },
            { id: 'FRI', label: 'Fri', dateStr: '18 Sep' },
            { id: 'SAT', label: 'Sat', dateStr: '19 Sep' },
            { id: 'SUN', label: 'Sun', dateStr: '20 Sep' },
          ].map((item) => {
            const isSelected = selectedDate === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedDate(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/30 font-extrabold'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{item.label}</span>
                <span className={`text-[10px] ${isSelected ? 'text-emerald-300 font-bold' : 'text-slate-400'}`}>
                  ({item.dateStr})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
         4. MAIN CONTENT DISPLAY AREA
         ======================================================== */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 font-bold space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm">Fetching verified showtimes & theatre halls in {selectedCity}...</p>
        </div>
      ) : viewMode === 'THEATRES' ? (
        /* ----------------------------------------------------
           A. THEATRES & CINEMA HALLS VIEW
           ---------------------------------------------------- */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" /> Active Theatre Halls & Multiplexes in {selectedCity}
            </h2>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              {showsByTheatre.length} Theatre Halls Operating
            </span>
          </div>

          {showsByTheatre.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No Theatres Currently Listed in {selectedCity}</h3>
              <p className="text-xs text-slate-500">Try selecting another city from the city selector menu above.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {showsByTheatre.map((theatre) => (
                <div
                  key={theatre.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 space-y-5"
                >
                  {/* Theatre Header Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-600" /> {theatre.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {theatre.village}, {theatre.city}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200 self-start sm:self-auto">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 4K Dolby Atmos & Live Stage Sound
                    </div>
                  </div>

                  {/* Movies, Plays & Showtimes under this Theatre */}
                  <div className="space-y-4">
                    {Object.values(
                      theatre.shows.reduce((acc, show) => {
                        const mId = show.movieId?._id || show.movieId;
                        if (!acc[mId]) {
                          acc[mId] = {
                            movie: show.movieId,
                            shows: [],
                          };
                        }
                        acc[mId].shows.push(show);
                        return acc;
                      }, {})
                    ).map(({ movie, shows: movieShows }) => (
                      <div
                        key={movie?._id || Math.random()}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        {/* Poster & Details */}
                        <div className="flex items-center gap-3.5 min-w-[240px]">
                          <img
                            src={movie?.posterUrl || '/posters/kalki.jpg'}
                            alt={movie?.title || 'Show'}
                            className="w-14 h-20 object-cover rounded-xl shadow-sm border border-slate-200"
                          />
                          <div>
                            <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                              {movie?.genre || 'Drama'}
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 mt-1 line-clamp-1">
                              {movie?.title || 'Featured Show'}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {movie?.language} • {movie?.durationMin} mins
                            </p>

                            {/* View Teaser link */}
                            <a
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent((movie?.title || 'Show') + ' Official Teaser')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 mt-1"
                            >
                              <Play className="w-3 h-3 fill-rose-600" /> Watch Teaser / Trailer
                            </a>
                          </div>
                        </div>

                        {/* Showtimes Slots */}
                        <div className="flex-1">
                          <span className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
                            Daily Showtimes Slots:
                          </span>
                          <div className="flex flex-wrap items-center gap-2.5">
                            {movieShows.map((s) => {
                              const d = new Date(s.showTime);
                              const timeStr = d.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              });
                              const hours = d.getHours();
                              let slotLabel = 'Show';
                              if (hours >= 8 && hours < 11) slotLabel = 'Morning';
                              else if (hours >= 11 && hours < 14) slotLabel = 'Matinee';
                              else if (hours >= 14 && hours < 17) slotLabel = 'Afternoon';
                              else if (hours >= 17 && hours < 20) slotLabel = 'Evening';
                              else if (hours >= 20 && hours < 23) slotLabel = 'Night';
                              else slotLabel = 'Midnight';

                              return (
                                <Link
                                  key={s._id}
                                  to={`/seat-map/${s._id}`}
                                  className="group px-3.5 py-2 bg-white hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 rounded-xl transition-all shadow-xs flex flex-col items-center min-w-[100px] cursor-pointer"
                                >
                                  <span className="text-xs font-black group-hover:text-white text-slate-900 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-emerald-600 group-hover:text-white" />
                                    {timeStr}
                                  </span>
                                  <div className="flex items-center gap-1 mt-0.5 text-[10px]">
                                    <span className="font-semibold text-slate-400 group-hover:text-emerald-200">{slotLabel}</span>
                                    <span className="text-slate-300 group-hover:text-emerald-300">•</span>
                                    <span className="font-bold text-emerald-700 group-hover:text-white">₹{s.price}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ----------------------------------------------------
           B. CATALOG GRID (Plays & Theatre, Comedy, Sports)
           ---------------------------------------------------- */
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              {viewMode === 'PLAYS' && <Sparkles className="w-5 h-5 text-emerald-600" />}
              {viewMode === 'EVENTS' && <Mic className="w-5 h-5 text-amber-500" />}
              {viewMode === 'SPORTS' && <Trophy className="w-5 h-5 text-cyan-500" />}
              <span>
                {viewMode === 'PLAYS' && `Verified Plays & Theatre Performances in ${selectedCity}`}
                {viewMode === 'EVENTS' && `Live Standup Comedy & Events in ${selectedCity}`}
                {viewMode === 'SPORTS' && `IPL Cricket & Sports Tickets in ${selectedCity}`}
              </span>
            </h2>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Showing {filteredMovies.length} items
            </span>
          </div>

          {filteredMovies.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <Sparkles className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No Stage Listings Found</h3>
              <p className="text-xs text-slate-500">Try changing your genre filter or selecting another city.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMovies.map((movie) => {
                const movieShows = getShowsForMovie(movie._id);

                return (
                  <div
                    key={movie._id}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col group"
                  >
                    {/* Poster Card Header */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                      <img
                        src={movie.posterUrl || '/posters/kalki.jpg'}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-slate-950/80 text-white text-[11px] font-extrabold shadow-md backdrop-blur-md border border-slate-700">
                        {movie.language}
                      </div>

                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase shadow-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" /> 9.5 Rating
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mb-1.5">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                            {movie.genre}
                          </span>
                          <span>•</span>
                          <span>{movie.durationMin} mins</span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {movie.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {movie.description}
                        </p>
                      </div>

                      {/* Teaser / Trailer Link */}
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' Official Teaser')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 text-xs font-bold transition-all border border-slate-200 group/trailer"
                      >
                        <Play className="w-3.5 h-3.5 text-rose-600 group-hover/trailer:text-white fill-current" />
                        <span>Watch Teaser / Trailer</span>
                      </a>

                      {/* Showtimes & Booking Buttons */}
                      <div className="border-t border-slate-100 pt-3.5 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                          <span>Today's Showtimes:</span>
                          <span className="text-emerald-700 font-bold">{movieShows.length} available</span>
                        </div>

                        {movieShows.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {movieShows.slice(0, 4).map((s) => (
                              <Link
                                key={s._id}
                                to={`/seat-map/${s._id}`}
                                className="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all group/btn shadow-xs cursor-pointer"
                              >
                                <span className="flex items-center gap-1 font-black">
                                  <Clock className="w-3 h-3 text-emerald-600 group-hover/btn:text-white" />
                                  {new Date(s.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 group-hover/btn:text-emerald-100">
                                  ₹{s.price}
                                </span>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic text-center py-2 bg-slate-50 rounded-xl">
                            No active shows scheduled today
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
