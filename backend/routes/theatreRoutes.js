const express = require('express');
const router = express.Router();
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

const { ensureCityTheatres } = require('../services/cityTheatreService');

// List all theatres (Public / Customer)
router.get('/', async (req, res) => {
  try {
    const { city, state } = req.query;
    if (city) {
      await ensureCityTheatres(city);
    }

    const filter = {};
    if (city) filter.city = new RegExp(city.replace('-NCR', '').trim(), 'i');
    if (state) filter.state = new RegExp(state, 'i');

    const theatres = await Theatre.find(filter).populate('adminId', 'name email');
    res.json(theatres);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching theatres.', error: error.message });
  }
});

// Get logged-in THEATRE_ADMIN's theatre & screen stats
router.get('/admin/my-theatre', verifyToken, requireRole(['THEATRE_ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    let theatre = null;
    if (req.user.role === 'THEATRE_ADMIN') {
      theatre = await Theatre.findOne({ adminId: req.user._id });
    } else {
      theatre = await Theatre.findOne(); // Default first theatre for Super Admin preview
    }

    if (!theatre) {
      return res.status(404).json({ message: 'No theatre assigned to this admin account yet.' });
    }

    const screens = await Screen.find({ theatreId: theatre._id });
    const shows = await Show.find({ theatreId: theatre._id }).populate('movieId screenId');

    // Calculate theatre specific revenue & occupancy (Internal bookings only)
    const showIds = shows.map((s) => s._id);
    const bookings = await Booking.find({ showId: { $in: showIds }, status: 'CONFIRMED' });

    let totalRevenue = 0;
    let totalTicketsSold = 0;
    let onlineRevenue = 0;
    let counterRevenue = 0;

    bookings.forEach((b) => {
      totalRevenue += b.totalAmount;
      totalTicketsSold += b.seatIds.length;
      if (b.source === 'counter') counterRevenue += b.totalAmount;
      else onlineRevenue += b.totalAmount;
    });

    const totalCapacity = screens.reduce((sum, s) => sum + s.capacity, 0) * Math.max(1, shows.length);
    const occupancyRate = totalCapacity > 0 ? Math.min(100, Math.round((totalTicketsSold / totalCapacity) * 100)) : 0;

    res.json({
      theatre,
      screens,
      shows,
      stats: {
        totalRevenue,
        totalTicketsSold,
        onlineRevenue,
        counterRevenue,
        occupancyRate,
        totalScreens: screens.length,
        totalShows: shows.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching theatre dashboard metrics.', error: error.message });
  }
});

// Get single theatre detail
router.get('/:id', async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id).populate('adminId', 'name email');
    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found.' });
    }
    const screens = await Screen.find({ theatreId: theatre._id });
    res.json({ theatre, screens });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching theatre.', error: error.message });
  }
});

// Create Theatre (THEATRE_ADMIN or SUPER_ADMIN)
router.post('/', verifyToken, requireRole(['THEATRE_ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { name, village, city, district, state } = req.body;
    if (!name || !city || !district || !state) {
      return res.status(400).json({ message: 'Name, city, district, and state are required.' });
    }

    const theatre = new Theatre({
      name,
      village: village || '',
      city,
      district,
      state,
      adminId: req.user._id,
    });

    await theatre.save();

    // Link user to theatreId
    req.user.theatreId = theatre._id;
    await req.user.save();

    await logAuditEvent({
      actor: req.user,
      action: 'THEATRE_CREATED',
      entityType: 'Theatre',
      entityId: theatre._id,
      details: { name, city, state },
    });

    res.status(201).json(theatre);
  } catch (error) {
    res.status(500).json({ message: 'Error creating theatre.', error: error.message });
  }
});

// Add Screen to Theatre
router.post('/:id/screens', verifyToken, requireRole(['THEATRE_ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { name, capacity, rows, cols, vipRows } = req.body;
    const theatreId = req.params.id;

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found.' });
    }

    const calculatedCapacity = (rows || 8) * (cols || 10);

    const screen = new Screen({
      theatreId,
      name: name || `Screen ${Date.now() % 10}`,
      capacity: capacity || calculatedCapacity,
      rows: rows || 8,
      cols: cols || 10,
      vipRows: vipRows || ['A'],
    });

    await screen.save();

    await logAuditEvent({
      actor: req.user,
      action: 'SCREEN_ADDED',
      entityType: 'Screen',
      entityId: screen._id,
      details: { theatreId, name: screen.name, capacity: screen.capacity },
    });

    res.status(201).json(screen);
  } catch (error) {
    res.status(500).json({ message: 'Error adding screen.', error: error.message });
  }
});

module.exports = router;
