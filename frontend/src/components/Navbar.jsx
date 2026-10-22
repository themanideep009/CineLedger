import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import { CustomerProfileDrawer } from './CustomerProfileDrawer';
import { OffersModal } from './OffersModal';
import {
  ShieldAlert,
  TrendingUp,
  QrCode,
  User,
  ChevronDown,
  MapPin,
  Mic,
  Trophy,
  Ticket,
  Sparkles,
  Tag,
} from 'lucide-react';

export const Navbar = () => {
  const { user } = useAuth();
  const { selectedCity, openCityModal } = useCity();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);

  const userName = user?.name || (user?.email ? user.email.split('@')[0] : 'Account');

  // Determine active sub-navbar category
  const activeCategory = searchParams.get('category') || (location.pathname === '/' ? 'PLAYS' : '');

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs transition-colors duration-300">
        {/* Main Navbar Top Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Official Brand Logo */}
            <Link to="/" className="flex items-center space-x-3 cursor-pointer">
              <img
                src="/logo.png"
                alt="CineLedger Logo"
                className="h-10 w-auto object-contain bg-transparent border-0"
              />
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  CINE<span className="gradient-text">LEDGER</span>
                </span>
                <span className="block text-[10px] tracking-widest text-slate-400 uppercase font-medium">
                  SINCE 2026 • TICKETING & BOX OFFICE
                </span>
              </div>
            </Link>

            {/* Right Controls: Location Button + User Profile */}
            <div className="flex items-center space-x-2.5">
              {/* City Location Button */}
              <button
                onClick={openCityModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 text-xs font-extrabold transition-all cursor-pointer shadow-xs group"
                title="Select your city"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="max-w-[110px] truncate">{selectedCity || 'Select City'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>

              {/* Role Actions (Theatre Admin / Producer / Super Admin) */}
              {user?.role === 'THEATRE_ADMIN' && (
                <Link
                  to="/scan-entry"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all"
                >
                  <QrCode className="w-3.5 h-3.5" /> Gate Scan
                </Link>
              )}

              {user ? (
                <div
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center space-x-2.5 p-1 pr-2.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-all shadow-xs group"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
                    {user.picture ? (
                      <img src={user.picture} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="block text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 leading-tight capitalize">
                      Hey, {userName}!
                    </span>
                    <span className="block text-[10px] text-slate-500 font-semibold">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-slate-700 hover:text-emerald-700 px-3.5 py-2 rounded-xl transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Professional Sub-Navbar (Below Header Row) */}
        <div className="bg-slate-900 text-white border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-11 text-xs font-bold overflow-x-auto scrollbar-none">
              {/* Left Main Categories (Plays & Theatre placed first, replacing Movies) */}
              <div className="flex items-center space-x-6 shrink-0">
                <Link
                  to="/?category=PLAYS"
                  className={`flex items-center gap-1.5 hover:text-emerald-400 transition-colors ${
                    activeCategory === 'PLAYS'
                      ? 'text-emerald-400 font-extrabold border-b-2 border-emerald-400 py-2.5'
                      : 'text-slate-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Plays & Theatre
                </Link>

                <Link
                  to="/?category=EVENTS"
                  className={`flex items-center gap-1.5 hover:text-emerald-400 transition-colors ${
                    activeCategory === 'EVENTS'
                      ? 'text-amber-400 font-extrabold border-b-2 border-amber-400 py-2.5'
                      : 'text-slate-300'
                  }`}
                >
                  <Mic className="w-4 h-4 text-amber-400" /> Events & Comedy
                </Link>

                <Link
                  to="/?category=SPORTS"
                  className={`flex items-center gap-1.5 hover:text-emerald-400 transition-colors ${
                    activeCategory === 'SPORTS'
                      ? 'text-cyan-400 font-extrabold border-b-2 border-cyan-400 py-2.5'
                      : 'text-slate-300'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-cyan-400" /> Sports & IPL Cricket
                </Link>

                {user?.role === 'PRODUCER' && (
                  <Link
                    to="/collections-dashboard"
                    className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors font-extrabold"
                  >
                    <TrendingUp className="w-4 h-4 text-amber-400" /> Box-Office Ledger
                  </Link>
                )}

                {user?.role === 'SUPER_ADMIN' && (
                  <Link
                    to="/admin-dashboard"
                    className="flex items-center gap-1.5 text-rose-300 hover:text-rose-200 transition-colors font-extrabold"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-400" /> Admin Control
                  </Link>
                )}
              </div>

              {/* Right Secondary Quick Links */}
              <div className="hidden md:flex items-center space-x-5 text-slate-300 text-[11px]">
                <button
                  onClick={() => setOffersOpen(true)}
                  className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
                >
                  <Tag className="w-3.5 h-3.5 text-emerald-400" /> Offers & Discounts
                </button>
                <Link to="/my-bookings" className="flex items-center gap-1 hover:text-white transition-colors">
                  <Ticket className="w-3.5 h-3.5 text-amber-400" /> My Bookings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BookMyShow Style Customer Profile Drawer */}
      <CustomerProfileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Interactive Offers & Discounts Modal */}
      <OffersModal isOpen={offersOpen} onClose={() => setOffersOpen(false)} />
    </>
  );
};
