const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const { verifyToken } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');
const { dispatchTicketNotifications } = require('../services/notificationService');

// Atomic Seat Booking Endpoint (Online + Counter)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { showId, seatIds, customerName, customerEmail, customerPhone, paymentMethod, source } = req.body;

    if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ message: 'showId and a non-empty seatIds array are required.' });
    }

    const bookingSource = source === 'counter' ? 'counter' : 'online';

    // Counter bookings require THEATRE_ADMIN or SUPER_ADMIN
    if (bookingSource === 'counter' && !['THEATRE_ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only Theatre Admins can issue counter bookings.' });
    }

    // 1. Fetch Show and compute total amount
    const show = await Show.findById(showId).populate('movieId theatreId screenId');
    if (!show) {
      return res.status(404).json({ message: 'Show not found.' });
    }

    if (show.status !== 'SCHEDULED') {
      return res.status(400).json({ message: 'Cannot book seats for a show that is not active.' });
    }

    const totalAmount = show.price * seatIds.length;
    const clientCustomerName = customerName || req.user.name;

    // 2. ATOMIC SEAT LOCK (Race-Condition Safe)
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        bookedSeats: { $nin: seatIds },
      },
      {
        $push: { bookedSeats: { $each: seatIds } },
      },
      { new: true }
    );

    if (!updatedShow) {
      return res.status(409).json({
        message: 'Double-booking prevented: One or more selected seats were just reserved by another customer or counter operator. Please choose alternative seats.',
        conflict: true,
      });
    }

    // 3. Create Booking Record
    const booking = new Booking({
      showId,
      customerId: req.user._id,
      customerName: clientCustomerName,
      customerPhone: customerPhone || req.user.phone || '',
      seatIds,
      totalAmount,
      paymentMethod: paymentMethod || (bookingSource === 'counter' ? 'CASH' : 'MOCK_ONLINE'),
      paymentStatus: 'COMPLETED',
      source: bookingSource,
      status: 'CONFIRMED',
    });

    await booking.save();

    // 4. Generate QR Ticket
    const ticketId = `CL-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const qrDataObj = {
      ticketId,
      bookingId: booking._id,
      showId,
      movieTitle: show.movieId?.title || 'Movie Ticket',
      seatIds,
      issuedAt: new Date().toISOString(),
    };

    const qrPayload = JSON.stringify(qrDataObj);
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

    const ticket = new Ticket({
      bookingId: booking._id,
      ticketId,
      qrPayload,
      status: 'ISSUED',
    });

    await ticket.save();

    // 5. Log Audit Event
    await logAuditEvent({
      actor: req.user,
      action: 'BOOKING_CREATED',
      entityType: 'Booking',
      entityId: booking._id,
      details: {
        ticketId,
        seats: seatIds,
        totalAmount,
        source: bookingSource,
        showId,
      },
    });

    // 6. DISPATCH EMAIL & WHATSAPP TICKET NOTIFICATIONS
    const notificationResults = await dispatchTicketNotifications({
      user: req.user,
      booking,
      ticket,
      show,
      customerEmail: customerEmail || req.user.email,
      customerPhone: customerPhone || req.user.phone,
    });

    res.status(201).json({
      message: 'Booking confirmed successfully! Email and WhatsApp ticket notifications have been dispatched.',
      booking,
      ticket: {
        id: ticket._id,
        ticketId: ticket.ticketId,
        status: ticket.status,
        qrCodeDataUrl,
      },
      notifications: notificationResults,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing booking.', error: error.message });
  }
});

// POST /api/bookings/:id/send-notifications (Resend Email / WhatsApp Ticket)
router.post('/:id/send-notifications', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'showId',
      populate: [{ path: 'movieId' }, { path: 'theatreId' }, { path: 'screenId' }],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const ticket = await Ticket.findOne({ bookingId: booking._id });

    const notificationResults = await dispatchTicketNotifications({
      user: req.user,
      booking,
      ticket,
      show: booking.showId,
    });

    res.json({
      message: 'Ticket notifications dispatched via Email & WhatsApp!',
      notifications: notificationResults,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error dispatching ticket notifications.', error: error.message });
  }
});

// Get user's own bookings (CUSTOMER / User)
router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate({
        path: 'showId',
        populate: [{ path: 'movieId' }, { path: 'theatreId' }, { path: 'screenId' }],
      })
      .sort({ createdAt: -1 });

    const bookingIds = bookings.map((b) => b._id);
    const tickets = await Ticket.find({ bookingId: { $in: bookingIds } });

    const ticketMap = new Map();
    tickets.forEach((t) => ticketMap.set(t.bookingId.toString(), t));

    const result = bookings.map((b) => ({
      booking: b,
      ticket: ticketMap.get(b._id.toString()) || null,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking history.', error: error.message });
  }
});

// Get single booking detail by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'showId',
      populate: [{ path: 'movieId' }, { path: 'theatreId' }, { path: 'screenId' }],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const ticket = await Ticket.findOne({ bookingId: booking._id });
    let qrCodeDataUrl = null;
    if (ticket) {
      qrCodeDataUrl = await QRCode.toDataURL(ticket.qrPayload);
    }

    res.json({ booking, ticket, qrCodeDataUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking details.', error: error.message });
  }
});

module.exports = router;
