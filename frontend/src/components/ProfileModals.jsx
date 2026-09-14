import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Check,
  Bell,
  Heart,
  MessageSquare,
  Settings,
  Gift,
  Copy,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShieldCheck,
  Send,
  Trash2,
  Ticket,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AiChatbotPanel } from './AiChatbotWidget';

/* ==========================================
   1. EDIT PROFILE MODAL
   ========================================== */
export const EditProfileModal = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateUser({ name, phone, email });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-emerald-300" />
            <h3 className="text-lg font-extrabold">Edit Profile Details</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Mobile Number (WhatsApp)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Ticket booking confirmation QR will be sent to this number.</p>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saved}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-white" /> Profile Saved Successfully!
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==========================================
   2. NOTIFICATIONS MODAL
   ========================================== */
export const NotificationsModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Ticket Confirmed! 🎟️',
      desc: 'Pushpa 2: The Rule at PVR Grand Phoenix. Seats C1, C2.',
      time: '10 mins ago',
      read: false,
      type: 'booking',
    },
    {
      id: 2,
      title: 'Exclusive Offer unlocked! 🍿',
      desc: 'Get 50% cashback on popcorn combo with promo CINEGREEN50.',
      time: '2 hours ago',
      read: false,
      type: 'offer',
    },
    {
      id: 3,
      title: 'Upcoming Show Alert ⏰',
      desc: 'Kalki 2898 AD starts in 3 hours at PVR Grand Phoenix.',
      time: 'Yesterday',
      read: true,
      type: 'alert',
    },
  ]);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-emerald-300" />
            <h3 className="text-lg font-extrabold">Notifications & Alerts</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between text-xs font-bold px-5">
          <button onClick={markAllRead} className="text-emerald-700 hover:underline">
            Mark all as read
          </button>
          <button onClick={clearAll} className="text-slate-500 hover:text-rose-600">
            Clear all
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">No notifications right now</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.read
                    ? 'bg-white border-slate-100 text-slate-600'
                    : 'bg-emerald-50/60 border-emerald-200/80 text-slate-900 font-medium'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold">{item.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   3. WISHLIST MODAL
   ========================================== */
export const WishlistModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([
    {
      id: 'w1',
      title: 'Pushpa 2: The Rule',
      genre: 'Action • Telugu/Hindi',
      rating: '9.4',
      poster: '/posters/pushpa2.jpg',
    },
    {
      id: 'w2',
      title: 'Kalki 2898 AD',
      genre: 'Sci-Fi • Hindi/Telugu',
      rating: '9.1',
      poster: '/posters/kalki.jpg',
    },
  ]);

  if (!isOpen) return null;

  const removeItem = (id) => {
    setWishlist(wishlist.filter((item) => item.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-emerald-300 fill-emerald-300" />
            <h3 className="text-lg font-extrabold">Your Saved Wishlist</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {wishlist.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Heart className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">Your wishlist is empty</p>
              <p className="text-xs text-slate-400">Save movies to watch them later!</p>
            </div>
          ) : (
            wishlist.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3.5 hover:border-emerald-400 transition-all"
              >
                <img src={item.poster} alt={item.title} className="w-14 h-18 object-cover rounded-xl shadow-sm" />
                <div className="flex-1">
                  <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">{item.genre}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/');
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Book Ticket
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   4. HELP & SUPPORT MODAL
   ========================================== */
export const HelpSupportModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('faq'); // 'faq', 'chat'
  const [expandedFaq, setExpandedFaq] = useState(null);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How do I download my QR Pass?',
      a: 'Go to Your Orders from the side menu, click on your active booking card, and press "View QR Pass". You can also save it directly to your phone gallery.',
    },
    {
      q: 'What is the refund policy for cancelled tickets?',
      a: 'Cancellations initiated at least 2 hours before showtime qualify for a 90% instant refund back to your payment method or CineLedger wallet.',
    },
    {
      q: 'Can I get my tickets delivered on WhatsApp?',
      a: 'Yes! Ensure your phone number is saved in your profile. QR ticket passes are automatically dispatched via WhatsApp & SMS.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[540px]">
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-emerald-300" />
            <h3 className="text-lg font-extrabold">Help & Support Assistant</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Frequently Asked Queries
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            🤖 CineBot AI Live Chat
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'faq' ? (
            <div className="p-4 overflow-y-auto h-full space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full p-4 text-left text-xs font-extrabold text-slate-900 flex justify-between items-center hover:bg-slate-100 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {expandedFaq === idx ? <ChevronUp className="w-4 h-4 text-emerald-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedFaq === idx && (
                    <div className="p-4 bg-white border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <AiChatbotPanel onClose={null} isFloating={false} />
          )}
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   5. ACCOUNTS & SETTINGS MODAL
   ========================================== */
export const SettingsModal = ({ isOpen, onClose }) => {
  const [city, setCity] = useState('Mumbai');
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-emerald-300" />
            <h3 className="text-lg font-extrabold">Accounts & Preferences</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          <div>
            <label className="block font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Default Preferred City
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wider">Communication Preferences</h4>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <strong className="block text-slate-900 font-bold">WhatsApp Ticket Dispatch</strong>
                <span className="text-slate-500 text-[11px]">Instant QR delivery after booking</span>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <strong className="block text-slate-900 font-bold">Email Statements & Updates</strong>
                <span className="text-slate-500 text-[11px]">Promotional discounts & invoices</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-600 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Theme locked to CineLedger White & Emerald Light Mode</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer text-center"
          >
            {saved ? 'Preferences Updated!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   6. REWARDS MODAL
   ========================================== */
export const RewardsModal = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  if (!isOpen) return null;

  const coupons = [
    { code: 'CINEGREEN50', desc: 'Flat 50% Off up to ₹150 on Food & Beverages', valid: 'Valid till 30 Sep' },
    { code: 'WEEKEND20', desc: 'Flat ₹100 Off on 2 or more Movie Tickets', valid: 'Valid on Weekends' },
  ];

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-emerald-300" />
            <h3 className="text-lg font-extrabold">CineRewards & Vouchers</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Balance Banner */}
          <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block">CineCoins Balance</span>
              <span className="text-3xl font-black">450 PTS</span>
            </div>
            <Ticket className="w-10 h-10 text-white/30" />
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Available Promo Codes</h4>

            {coupons.map((c) => (
              <div
                key={c.code}
                className="p-4 bg-emerald-50/50 border border-dashed border-emerald-400 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-600 text-white font-mono text-xs font-extrabold rounded-md mb-1">
                    {c.code}
                  </span>
                  <p className="text-xs font-bold text-slate-800">{c.desc}</p>
                  <span className="text-[10px] text-slate-500 font-semibold">{c.valid}</span>
                </div>
                <button
                  onClick={() => handleCopy(c.code)}
                  className="px-3 py-1.5 bg-white border border-emerald-500 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  {copiedCode === c.code ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
