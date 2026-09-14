const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

// Get single ticket info by ticketId (Public / Customer / Admin)
router.get('/:ticketId', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId }).populate({
      path: 'bookingId',
      populate: {
        path: 'showId',
        populate: [{ path: 'movieId' }, { path: 'theatreId' }, { path: 'screenId' }],
      },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const qrCodeDataUrl = await QRCode.toDataURL(ticket.qrPayload);

    res.json({
      ticket,
      qrCodeDataUrl,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ticket.', error: error.message });
  }
});

// Entry Gate Verification Endpoint (THEATRE_ADMIN or SUPER_ADMIN scan ticket at gate)
router.post('/verify-scan', verifyToken, requireRole(['THEATRE_ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { ticketId, qrData } = req.body;

    let searchId = ticketId;
    if (!searchId && qrData) {
      try {
        const parsed = JSON.parse(qrData);
        searchId = parsed.ticketId;
      } catch (e) {
        searchId = qrData.trim();
      }
    }

    if (!searchId) {
      return res.status(400).json({ message: 'ticketId or qrData input is required.' });
    }

    const ticket = await Ticket.findOne({ ticketId: searchId.trim().toUpperCase() }).populate({
      path: 'bookingId',
      populate: {
        path: 'showId',
        populate: [{ path: 'movieId' }, { path: 'theatreId' }, { path: 'screenId' }],
      },
    });

    if (!ticket) {
      return res.status(404).json({
        valid: false,
        message: 'INVALID TICKET: Ticket ID not found in database system.',
      });
    }

    // Check duplicate scan
    if (ticket.status === 'USED') {
      await logAuditEvent({
        actor: req.user,
        action: 'TICKET_SCAN_REJECTED',
        entityType: 'Ticket',
        entityId: ticket._id,
        details: { ticketId: ticket.ticketId, reason: 'ALREADY_USED', previousScannedAt: ticket.scannedAt },
      });

      return res.status(400).json({
        valid: false,
        status: 'USED',
        message: `DUPLICATE ENTRY REJECTED: Ticket ${ticket.ticketId} was ALREADY scanned and used on ${new Date(ticket.scannedAt).toLocaleString()}`,
        ticket,
      });
    }

    if (ticket.status !== 'ISSUED') {
      return res.status(400).json({
        valid: false,
        status: ticket.status,
        message: `INVALID STATUS: Ticket is ${ticket.status}. Entry denied.`,
        ticket,
      });
    }

    // Mark as USED
    ticket.status = 'USED';
    ticket.scannedAt = new Date();
    ticket.scannedBy = req.user._id;
    await ticket.save();

    await logAuditEvent({
      actor: req.user,
      action: 'TICKET_SCANNED_SUCCESS',
      entityType: 'Ticket',
      entityId: ticket._id,
      details: {
        ticketId: ticket.ticketId,
        movieTitle: ticket.bookingId?.showId?.movieId?.title,
        seats: ticket.bookingId?.seatIds,
      },
    });

    res.json({
      valid: true,
      status: 'USED',
      message: 'ENTRY GRANTED: Ticket validated and marked as USED.',
      ticket,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing ticket verification scan.', error: error.message });
  }
});

module.exports = router;
