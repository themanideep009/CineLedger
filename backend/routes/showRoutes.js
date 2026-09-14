const express = require('express');
const router = express.Router();
const Show = require('../models/Show');
const Screen = require('../models/Screen');
const Theatre = require('../models/Theatre');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

const { ensureCityTheatres } = require('../services/cityTheatreService');

// List shows with filtering options (Public)
router.get('/', async (req, res) => {
  try {
    const { movieId, theatreId, city, date } = req.query;
    const filter = {};

    if (movieId) filter.movieId = movieId;
    if (theatreId) filter.theatreId = theatreId;

    if (city) {
      // Auto-provision authentic theatres & 6 showtime slots if city isn't populated yet
      await ensureCityTheatres(city);

      const cleanCity = city.replace('-NCR', '').trim();
      const theatres = await Theatre.find({
        $or: [
          { city: new RegExp(`^${cleanCity}$`, 'i') },
          { city: new RegExp(`^${city}$`, 'i') },
          { city: new RegExp(cleanCity, 'i') }
        ]
      }).select('_id');

      if (theatres.length > 0) {
        filter.theatreId = { $in: theatres.map((t) => t._id) };
      }
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.showTime = { $gte: startDate, $lte: endDate };
    }

    let shows = await Show.find(filter)
      .populate('movieId')
      .populate('screenId')
      .populate('theatreId')
      .sort({ showTime: 1 });

    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shows.', error: error.message });
  }
});

// Get single show detail with seat layout & booked seats grid
router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movieId')
      .populate('screenId')
      .populate('theatreId');

    if (!show) {
      return res.status(404).json({ message: 'Show not found.' });
    }

    res.json(show);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching show details.', error: error.message });
  }
});

// Create Show (THEATRE_ADMIN or SUPER_ADMIN)
router.post('/', verifyToken, requireRole(['THEATRE_ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { movieId, screenId, theatreId, showTime, price } = req.body;

    if (!movieId || !screenId || !showTime || !price) {
      return res.status(400).json({ message: 'Movie, screen, showTime, and price are required.' });
    }

    const screen = await Screen.findById(screenId);
    if (!screen) {
      return res.status(404).json({ message: 'Screen not found.' });
    }

    const assignedTheatreId = theatreId || screen.theatreId;

    const show = new Show({
      movieId,
      screenId,
      theatreId: assignedTheatreId,
      showTime: new Date(showTime),
      price: Number(price),
      bookedSeats: [],
    });

    await show.save();

    await logAuditEvent({
      actor: req.user,
      action: 'SHOW_SCHEDULED',
      entityType: 'Show',
      entityId: show._id,
      details: { movieId, screenId, showTime, price },
    });

    res.status(201).json(show);
  } catch (error) {
    res.status(500).json({ message: 'Error creating show.', error: error.message });
  }
});

module.exports = router;
