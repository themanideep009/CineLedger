import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Clock, Building2, QrCode, ArrowRight, Mail, MessageSquare, Send, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const MyBookingsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState(null);
  const { addToast } = useToast();

  const fetchMyBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/bookings/my-bookings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('cineledger_token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  const handleResendNotifications = async (bookingId) => {
    try {
      setResendingId(bookingId);
      const res = await fetch(`/api/bookings/${bookingId}/send-notifications`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('cineledger_token')}`,
        },
      });

      if (!res.ok) throw new Error('Failed to dispatch notifications');
      const data = await res.json();

      addToast({
        title: 'Ticket Dispatched! 🎟️',
        message: 'Ticket details sent to your registered Email & WhatsApp number.',
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Dispatch Failed',
        message: err.message,
        type: 'error',
      });
    } finally {
      setResendingId(null);
    }
  };

  const openWhatsAppShare = (booking, ticket) => {
    const movieTitle = booking.showId?.movieId?.title || 'Movie Ticket';
    const venue = booking.showId?.theatreId?.name || 'PVR Cinema';
    const seats = booking.seatIds ? booking.seatIds.join(', ') : 'Seats';
    const ticketCode = ticket?.ticketId || 'CL-TICKET';

    const waText = `🎬 *CineLedger Ticket Confirmation*\n\nHi! Here is my confirmed movie ticket pass 🎟️\n\n🎥 *Movie*: ${movieTitle}\n📍 *Venue*: ${venue}\n💺 *Seats*: ${seats}\n💵 *Total*: ₹${booking.totalAmount}\n🆔 *Ticket Code*: ${ticketCode}\n\n📲 *View QR Pass*: ${window.location.origin}/ticket/${ticketCode}`;
    const cleanPhone = (booking.customerPhone || '').replace(/[^\d]/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

    window.open(waUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <Ticket className="w-7 h-7 text-emerald-600" /> My Booking History
        </h1>
        <p className="text-sm font-medium text-slate-600 mt-1">
          View confirmed movie tickets and digital WhatsApp & Email QR entry passes
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 font-semibold">Loading your confirmed tickets...</div>
      ) : items.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <Ticket className="w-12 h-12 text-emerald-600/40 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-900">No Bookings Found</h2>
          <p className="text-xs text-slate-500">You haven't reserved any movie tickets yet.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all mt-2"
          >
            Browse Now Showing Movies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map(({ booking, ticket }) => {
            const show = booking.showId;
            return (
              <div
                key={booking._id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg hover:border-emerald-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      {booking.source?.toUpperCase() || 'ONLINE'} BOOKING
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </span>

                    {/* Email & WhatsApp Confirmation Badges */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      <Mail className="w-3 h-3 text-emerald-600" /> Email Sent
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      <MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp Sent
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900">
                    {show?.movieId?.title || 'Movie Booking'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      {show?.theatreId?.name || 'Theatre'} ({show?.theatreId?.city || 'Cinema'})
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      {new Date(show?.showTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 font-medium">
                    Seats: <span className="text-slate-900 font-extrabold">{booking.seatIds.join(', ')}</span> • Total:{' '}
                    <span className="text-emerald-700 font-extrabold">₹{booking.totalAmount}</span>
                  </div>

                  {/* Resend & Share Bar */}
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => openWhatsAppShare(booking, ticket)}
                      className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Send on WhatsApp
                    </button>
                    <button
                      onClick={() => handleResendNotifications(booking._id)}
                      disabled={resendingId === booking._id}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-500" />{' '}
                      {resendingId === booking._id ? 'Sending...' : 'Resend Email Ticket'}
                    </button>
                  </div>
                </div>

                {ticket && (
                  <Link
                    to={`/ticket/${ticket.ticketId}`}
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 self-start md:self-center shrink-0 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-white" /> View QR Pass ({ticket.ticketId}){' '}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
