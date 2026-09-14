import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { PhoneOtpLogin } from '../components/PhoneOtpLogin';
import { Lock, Mail, ArrowRight, Smartphone, ShieldCheck, Ticket, CheckCircle } from 'lucide-react';

export const LoginPage = () => {
  const [authTab, setAuthTab] = useState('EMAIL'); // 'EMAIL' | 'PHONE'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, quickLoginAs } = useAuth();
  const navigate = useNavigate();

  const redirectUser = (role) => {
    if (role === 'SUPER_ADMIN') navigate('/admin-dashboard');
    else if (role === 'PRODUCER') navigate('/producer-dashboard');
    else if (role === 'THEATRE_ADMIN') navigate('/theatre-dashboard');
    else navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed.');

      login(data.token, data.user);
      redirectUser(data.user.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleSelect = async (e) => {
    const selectedRole = e.target.value;
    if (!selectedRole) return;

    const presets = {
      SUPER_ADMIN: { email: 'admin@cineledger.com', pass: 'admin123' },
      PRODUCER: { email: 'producer.karan@cineledger.com', pass: 'producer123' },
      THEATRE_ADMIN: { email: 'admin.pvr@cineledger.com', pass: 'theatre123' },
      CUSTOMER: { email: 'customer@gmail.com', pass: 'customer123' },
    };

    const target = presets[selectedRole];
    if (target) {
      setError('');
      setLoading(true);
      const res = await quickLoginAs(target.email, target.pass);
      setLoading(false);
      if (res.success) {
        redirectUser(res.user.role);
      } else {
        setError(res.error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex mb-3">
          <img src="/logo.png" alt="CineLedger Logo" className="h-20 w-auto object-contain bg-transparent border-0" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Sign In to CineLedger</h1>
        <p className="text-slate-600 text-sm mt-1">
          Access your account via Google, Mobile OTP, or Email Credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Main Interactive Login Panel */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 shadow-xl space-y-5 bg-white">
          {/* Quick Social Auth - Google */}
          <div className="space-y-3">
            <GoogleAuthButton onSuccessRedirect={redirectUser} />

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest absolute">
                or sign in with
              </span>
            </div>
          </div>

          {/* Auth Mode Tabs: Email vs Phone OTP */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setAuthTab('EMAIL')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                authTab === 'EMAIL'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Email & Password
            </button>

            <button
              type="button"
              onClick={() => setAuthTab('PHONE')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                authTab === 'PHONE'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile OTP
            </button>
          </div>

          {authTab === 'EMAIL' ? (
            <div className="space-y-4 animate-fade-in">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@cineledger.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <PhoneOtpLogin onSuccessRedirect={redirectUser} />
          )}

          <p className="text-xs text-slate-500 text-center pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-700 font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Feature Hero Card with Compact Test Role Switcher */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200 shadow-xl bg-white space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Next-Gen Cinema Ledger</h2>
              <p className="text-xs text-slate-500">Auditable Movie Ticketing & Box-Office Verification</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="block text-slate-900 font-bold">Instant Digital Tickets</strong>
                <span>Generate QR pass tickets with real-time seat reservation confirmation.</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="block text-slate-900 font-bold">Tamper-Evident Ledger</strong>
                <span>Atomic ticket booking & role-restricted box office revenue metrics.</span>
              </div>
            </div>
          </div>

          {/* Compact Role Switcher Option */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Test Account Quick Select
            </label>
            <select
              onChange={handleQuickRoleSelect}
              defaultValue=""
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
            >
              <option value="" disabled>
                -- Select Demo Role to Test --
              </option>
              <option value="CUSTOMER">Customer (Online Ticket Booking)</option>
              <option value="THEATRE_ADMIN">Theatre Admin (PVR Gate & Counter)</option>
              <option value="PRODUCER">Producer (Dharma Box Office)</option>
              <option value="SUPER_ADMIN">Super Admin (Full Access)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
