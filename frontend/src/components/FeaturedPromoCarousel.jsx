import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Film, Trophy, Mic, ArrowRight, Play, Star, MapPin, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FeaturedPromoCarousel = ({ shows = [] }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: 'slide-1',
      type: 'MOVIE',
      category: 'FEATURED MOVIE • IMAX 4K LASER',
      icon: <Film className="w-4 h-4 text-emerald-400" />,
      title: 'Kalki 2898 AD',
      tagline: 'The Futuristic Sci-Fi Action Epic of the Century',
      description: 'Experience Kashi 2898 AD with atomic seat locking, 3D laser sound, and anti-scalping cryptographic QR entry passes.',
      rating: '9.4',
      language: 'Telugu / Hindi / Tamil',
      venue: 'PVR IMAX & Dolby Atmos Screens',
      bgImage: '/banners/kalki.jpg',
      posterImage: '/posters/kalki.jpg',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      actionText: 'Book Movie Seats',
      searchQuery: 'Kalki',
      trailerUrl: 'https://www.youtube.com/results?search_query=Kalki+2898+AD+Official+Trailer',
    },
    {
      id: 'slide-2',
      type: 'SPORTS',
      category: 'LIVE SPORTS • IPL 2026 T20 STADIUM MATCH',
      icon: <Trophy className="w-4 h-4 text-cyan-400" />,
      title: 'IPL 2026: SRH vs CSK',
      tagline: 'High-Octane T20 Cricket Stadium Blockbuster',
      description: 'Live at Rajiv Gandhi International Stadium, Hyderabad. Reserve Pavilion, Corporate Box & VIP Stand tickets instantly.',
      rating: '9.8',
      language: 'English / Hindi',
      venue: 'Rajiv Gandhi International Cricket Stadium',
      bgImage: '/posters/ipl_cricket.jpg',
      posterImage: '/posters/ipl_cricket.jpg',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      actionText: 'Book Stadium Stands',
      searchQuery: 'IPL',
      trailerUrl: null,
    },
    {
      id: 'slide-3',
      type: 'EVENTS',
      category: 'STANDUP COMEDY • LIVE TOUR 2026',
      icon: <Mic className="w-4 h-4 text-amber-400" />,
      title: 'Zakir Khan Live',
      tagline: 'Tathastu 2.0 Unfiltered Comedy Tour',
      description: "India's favorite storyteller performing live. Select front-row VIP recliners with real-time seat availability.",
      rating: '9.6',
      language: 'Hindi',
      venue: 'Shilpakala Vedika / Shanmukhananda Hall',
      bgImage: '/posters/zakir_khan.jpg',
      posterImage: '/posters/zakir_khan.jpg',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      actionText: 'Book Comedy Seats',
      searchQuery: 'Zakir',
      trailerUrl: null,
    },
    {
      id: 'slide-4',
      type: 'MOVIE',
      category: 'MASS BLOCKBUSTER • REVOLUTION',
      icon: <Sparkles className="w-4 h-4 text-rose-400" />,
      title: 'Pushpa 2: The Rule',
      tagline: 'The Wild Rule Begins Across All Cinemas',
      description: 'Allu Arjun in high-octane action. Select VIP Lounge seats with field-of-view angle inspector and instant QR entry.',
      rating: '9.5',
      language: 'Telugu / Hindi / Malayalam',
      venue: 'Prasads PCX & Top Multiplexes',
      bgImage: '/banners/pushpa2.jpg',
      posterImage: '/posters/pushpa2.jpg',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      actionText: 'Reserve Premium Seats',
      searchQuery: 'Pushpa',
      trailerUrl: 'https://www.youtube.com/results?search_query=Pushpa+2+The+Rule+Official+Trailer',
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  const handleSlideAction = (slide) => {
    const matchingShow = shows.find((s) =>
      s.movieId?.title?.toLowerCase().includes(slide.searchQuery.toLowerCase())
    );
    if (matchingShow) {
      navigate(`/seat-map/${matchingShow._id}`);
    } else if (shows.length > 0) {
      navigate(`/seat-map/${shows[0]._id}`);
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="space-y-3">
      {/* Header Title for Ads/Promotions */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            Trending Blockbusters, Live Events & Sports
          </h2>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Live Verification Active
        </span>
      </div>

      {/* Main Container Carousel Slider Box */}
      <div
        className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl transition-all duration-500 group text-white"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Top Animated Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900 z-30 overflow-hidden">
          <div
            key={currentIndex}
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all ease-linear"
            style={{
              animation: isPaused ? 'none' : 'progress 5s linear infinite',
            }}
          />
        </div>

        {/* Slide Canvas */}
        <div className="relative min-h-[380px] md:min-h-[420px] w-full flex items-center">
          {/* Background Backdrop Image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={currentSlide.bgImage}
              alt={currentSlide.title}
              className="w-full h-full object-cover object-center transform scale-105 filter blur-xs brightness-30 transition-all duration-700"
            />
            {/* Dark Gradient Layers */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70 z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px] opacity-15 z-10" />
          </div>

          {/* Slide Grid Content */}
          <div className="relative z-20 w-full max-w-7xl mx-auto p-6 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Content Column (8 cols) */}
            <div className="md:col-span-8 space-y-4">
              {/* Category Badge */}
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md ${currentSlide.badgeBg}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {currentSlide.icon}
                <span>{currentSlide.category}</span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
                  {currentSlide.title}
                </h2>
                <p className="text-emerald-400 text-sm sm:text-base font-bold mt-1">
                  {currentSlide.tagline}
                </p>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium line-clamp-2 max-w-2xl">
                {currentSlide.description}
              </p>

              {/* Metadata Pills */}
              <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl font-extrabold shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{currentSlide.rating} / 10 User Rating</span>
                </div>

                <div className="bg-slate-900/90 text-slate-200 border border-slate-700 px-3 py-1 rounded-xl font-bold">
                  {currentSlide.language}
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900/90 text-slate-200 border border-slate-700 px-3 py-1 rounded-xl font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate max-w-[220px]">{currentSlide.venue}</span>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={() => handleSlideAction(currentSlide)}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-emerald-500/25 flex items-center gap-2 transform hover:scale-105 transition-all cursor-pointer"
                >
                  <Ticket className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>{currentSlide.actionText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Show View Trailer ONLY for MOVIES */}
                {currentSlide.type === 'MOVIE' && currentSlide.trailerUrl && (
                  <a
                    href={currentSlide.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span>View YouTube Trailer</span>
                  </a>
                )}
              </div>
            </div>

            {/* Right Poster Card Column (4 cols) */}
            <div className="hidden md:block md:col-span-4 justify-self-end">
              <div className="relative w-48 lg:w-56 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/80 group/poster transform rotate-1 hover:rotate-0 transition-all duration-300">
                <img
                  src={currentSlide.posterImage}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 right-3 text-center">
                  <span className="inline-block px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-[11px] shadow-md uppercase tracking-wider">
                    Instant Booking
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar Inside Slider */}
        <div className="absolute bottom-4 right-6 z-30 flex items-center gap-4">
          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur-md">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev / Next Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevSlide}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 border border-slate-800 transition-all cursor-pointer shadow-md"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 border border-slate-800 transition-all cursor-pointer shadow-md"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
