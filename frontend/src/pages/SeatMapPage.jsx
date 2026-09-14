import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PaymentModal } from '../components/PaymentModal';
import { SeatFOVInspector } from '../components/SeatFOVInspector';
import {
  Film,
  Building2,
  Clock,
  Ticket,
  AlertTriangle,
  CreditCard,
  Banknote,
  ArrowLeft,
  UserCheck,
  Timer,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';

export const SeatMapPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [bookingMode, setBookingMode] = useState('online'); // 'online' or 'counter'
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [conflictError, setConflictError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [holdTimer, setHoldTimer] = useState(300); // 5 minutes seat hold reservation

  const fetchShowDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/shows/${showId}`);
      if (!res.ok) throw new Error('Failed to load show details');
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      setShow(data);
    } catch (err) {
      console.error('Error fetching show details:', err);
    } finally {
      setLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    fetchShowDetails();
  }, [fetchShowDetails]);

  // Keep email & phone synced when user loads
  useEffect(() => {
    if (user) {
      if (!customerName && user.name) setCustomerName(user.name);
      if (!customerEmail && user.email) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Reservation countdown timer when seats are selected
  useEffect(() => {
    let interval = null;
    if (selectedSeats.length > 0 && holdTimer > 0) {
      interval = setInterval(() => {
        setHoldTimer((prev) => prev - 1);
      }, 1000);
    } else if (holdTimer === 0) {
      setSelectedSeats([]);
      setHoldTimer(300);
      setConflictError('Seat reservation timeout expired. Please select your seats again.');
    }
    return () => clearInterval(interval);
  }, [selectedSeats.length, holdTimer]);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cols = Array.from({ length: 10 }, (_, i) => i + 1);

  const isSeatBooked = (seatCode) => {
    return show?.bookedSeats?.includes(seatCode);
  };

  const isSeatSelected = (seatCode) => {
    return selectedSeats.includes(seatCode);
  };

  const toggleSeat = (seatCode) => {
    if (isSeatBooked(seatCode)) return;
    setConflictError('');
    setHoldTimer(300); // reset 5-min timer
    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatCode));
    } else {
      setSelectedSeats([...selectedSeats, seatCode]);
    }
  };

  const totalAmount = (show?.price || 0) * selectedSeats.length;

  const handleOpenCheckout = (e) => {
    e.preventDefault();
    if (selectedSeats.length === 0) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (bookingMode === 'online') {
      setIsPaymentModalOpen(true);
    } else {
      // Direct submit for Counter mode
      executeBookingSubmit({ paymentMethod });
    }
  };

  const executeBookingSubmit = async (paymentDetails = {}) => {
    setConflictError('');
    setIsSubmitting(true);
    setIsPaymentModalOpen(false);

    try {
      const payload = {
        showId,
        seatIds: selectedSeats,
        customerName: customerName || (user?.name || 'Customer Guest'),
        customerEmail: customerEmail || (user?.email || ''),
        customerPhone: customerPhone || (user?.phone || ''),
        paymentMethod: paymentDetails.paymentMethod || (bookingMode === 'counter' ? paymentMethod : 'MOCK_ONLINE'),
        source: bookingMode,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('cineledger_token')}`,
        },
        body: JSON.stringify(payload),
      });

      // Safe JSON parsing to prevent "Unexpected end of JSON input"
      const resText = await res.text();
      let data = {};
      try {
        if (resText) data = JSON.parse(resText);
      } catch (jsonErr) {
        console.error('Error parsing response JSON:', jsonErr);
      }

      if (!res.ok) {
        if (res.status === 409) {
          setConflictError(data.message || 'One or more selected seats were reserved by another user.');
          setSelectedSeats([]);
          await fetchShowDetails();
        } else {
          throw new Error(data.message || 'Booking execution failed.');
        }
        return;
      }

      addToast({
        title: 'Booking Confirmed! 🎟️',
        message: `Ticket QR Pass dispatched to ${customerEmail || user?.email || 'your email'} & WhatsApp!`,
        type: 'success',
      });

      if (data.ticket?.ticketId) {
        navigate(`/ticket/${data.ticket.ticketId}`);
      } else {
        navigate('/my-bookings');
      }
    } catch (err) {
      setConflictError(err.message || 'Could not complete booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-semibold">Loading seat map layout...</div>;
  }

  if (!show) {
    return <div className="text-center py-20 text-slate-500 font-semibold">Show not found.</div>;
  }

  const activeSeatCode = hoveredSeat || (selectedSeats.length > 0 ? selectedSeats[selectedSeats.length - 1] : null);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Header Info Banner (White & Medium Green Styling) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-md">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-slate-500 hover:text-emerald-700 font-bold flex items-center gap-1 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Movies
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2">
            <Film className="w-6 h-6 text-emerald-600" /> {show.movieId?.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 mt-2">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" /> {show.theatreId?.name} ({show.theatreId?.city})
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />{' '}
              {new Date(show.showTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {show.screenId?.name || 'Audi 1'}
            </span>
          </div>
        </div>

        {/* Counter Mode Switcher for Theatre Admins */}
        {['THEATRE_ADMIN', 'SUPER_ADMIN'].includes(user?.role) && (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setBookingMode('online')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                bookingMode === 'online'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Online Mode
            </button>
            <button
              onClick={() => setBookingMode('counter')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                bookingMode === 'counter'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Counter Sale Mode
            </button>
          </div>
        )}
      </div>

      {/* Double Booking Conflict Alert Banner */}
      {conflictError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs shadow-md">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-extrabold text-sm text-rose-900">Notice</div>
            <div className="font-medium">{conflictError}</div>
          </div>
        </div>
      )}

      {/* 5-Min Reservation Countdown Bar */}
      {selectedSeats.length > 0 && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-sm">
          <span className="flex items-center gap-2 font-bold">
            <Timer className="w-4 h-4 text-emerald-600 animate-spin" /> Live Seat Hold Reservation Active
          </span>
          <span className="font-mono font-extrabold text-sm bg-white text-emerald-700 px-3 py-1 rounded-xl border border-emerald-300 shadow-xs">
            {formatTimer(holdTimer)}
          </span>
        </div>
      )}

      {/* Main Grid & Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Seat Layout (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-8">
          {/* Cinema Screen Curve Visual */}
          <div className="text-center space-y-2">
            <div className="h-3 w-full bg-gradient-to-b from-emerald-500 to-emerald-200 rounded-t-full shadow-md border-t-2 border-emerald-600" />
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">
              Cinema Screen (All Eyes Here)
            </span>
          </div>

          {/* Seat Grid */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[460px] space-y-2.5">
              {rows.map((row) => (
                <div key={row} className="flex items-center justify-center space-x-2">
                  <span className="w-5 text-xs font-black text-slate-400 text-center">{row}</span>
                  <div className="flex space-x-1.5">
                    {cols.map((col) => {
                      const seatCode = `${row}${col}`;
                      const booked = isSeatBooked(seatCode);
                      const selected = isSeatSelected(seatCode);

                      let btnStyle =
                        'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:border-emerald-500 border border-slate-200 font-bold';
                      if (booked) {
                        btnStyle = 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed line-through';
                      } else if (selected) {
                        btnStyle =
                          bookingMode === 'counter'
                            ? 'bg-amber-500 text-white font-extrabold border-amber-600 shadow-md'
                            : 'bg-emerald-600 text-white font-extrabold border-emerald-700 shadow-md shadow-emerald-600/30 scale-105';
                      }

                      return (
                        <button
                          key={seatCode}
                          disabled={booked}
                          onMouseEnter={() => setHoveredSeat(seatCode)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          onClick={() => toggleSeat(seatCode)}
                          className={`w-8 h-8 rounded-lg text-[11px] flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100 text-xs font-bold">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-slate-100 border border-slate-300" />
              <span className="text-slate-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-emerald-600 shadow-xs" />
              <span className="text-slate-900 font-extrabold">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-slate-200 border border-slate-300" />
              <span className="text-slate-400">Sold / Reserved</span>
            </div>
          </div>

          {/* 3D Seat FOV Viewing Optics Inspector */}
          <SeatFOVInspector seatCode={activeSeatCode} />
        </div>

        {/* Booking Summary & Customer Email Panel (Right 1 col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">
              {bookingMode === 'counter' ? 'Counter Sales Desk' : 'Online Booking Summary'}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-emerald-600" /> Ticket Order
            </h2>
          </div>

          <div className="space-y-3 border-y border-slate-100 py-4 text-xs font-semibold">
            <div className="flex justify-between text-slate-600">
              <span>Selected Seats:</span>
              <span className="font-extrabold text-slate-900">
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Price per seat:</span>
              <span className="text-slate-900 font-bold">₹{show.price}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-100">
              <span>Total Payable:</span>
              <span className="text-emerald-700 font-black text-base">₹{totalAmount}</span>
            </div>
          </div>

          <form onSubmit={handleOpenCheckout} className="space-y-4">
            {/* Email & Phone Confirmation Inputs for Ticket Delivery */}
            <div className="space-y-3 p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-xs">
              <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Digital Ticket Dispatch Info
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Customer Email (for Mail Ticket)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  WhatsApp Mobile (for QR Pass)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* If Counter Mode: Input Customer Details */}
            {bookingMode === 'counter' && (
              <div className="space-y-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-600" /> Walk-in Guest Name
                </div>
                <input
                  type="text"
                  placeholder="Customer Name (Optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-semibold"
                />
                <div className="flex items-center gap-2 pt-1 font-semibold">
                  <span className="text-slate-600">Payment:</span>
                  <label className="flex items-center gap-1 text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="CASH"
                      checked={paymentMethod === 'CASH'}
                      onChange={() => setPaymentMethod('CASH')}
                    />{' '}
                    Cash
                  </label>
                  <label className="flex items-center gap-1 text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="UPI"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                    />{' '}
                    UPI
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={selectedSeats.length === 0 || isSubmitting}
              className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedSeats.length === 0
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : bookingMode === 'counter'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
              }`}
            >
              {isSubmitting ? (
                'Locking Seats & Sending Mail...'
              ) : bookingMode === 'counter' ? (
                <>
                  <Banknote className="w-4 h-4" /> Confirm Counter Sale (₹{totalAmount})
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" /> Proceed to Pay Gateway (₹{totalAmount})
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Simulated Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={executeBookingSubmit}
        totalAmount={totalAmount}
        showTitle={show.movieId?.title || 'Movie Ticket'}
        seats={selectedSeats}
      />
    </div>
  );
};
