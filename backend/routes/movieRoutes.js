const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

// Get all active movies (Public)
router.get('/', async (req, res) => {
  try {
    const { language, genre, search } = req.query;
    const filter = {};
    if (language) filter.language = language;
    if (genre) filter.genre = new RegExp(genre, 'i');
    if (search) filter.title = new RegExp(search, 'i');

    const movies = await Movie.find(filter).populate('producerId', 'name email producerCompany');
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movies.', error: error.message });
  }
});

// Get single movie detail
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate('producerId', 'name email producerCompany');
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movie.', error: error.message });
  }
});

// Add Movie (PRODUCER or SUPER_ADMIN)
router.post('/', verifyToken, requireRole(['PRODUCER', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { title, description, language, durationMin, genre, posterUrl, bannerUrl, releaseDate, producerId } = req.body;

    if (!title || !language || !durationMin) {
      return res.status(400).json({ message: 'Title, language, and durationMin are required.' });
    }

    const assignedProducerId = req.user.role === 'PRODUCER' ? req.user._id : (producerId || req.user._id);

    const movie = new Movie({
      title,
      description: description || '',
      language,
      durationMin,
      genre: genre || 'Action/Drama',
      posterUrl: posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop',
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop',
      releaseDate: releaseDate || new Date(),
      producerId: assignedProducerId,
    });

    await movie.save();

    await logAuditEvent({
      actor: req.user,
      action: 'MOVIE_CREATED',
      entityType: 'Movie',
      entityId: movie._id,
      details: { title: movie.title, producerId: assignedProducerId },
    });

    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error creating movie.', error: error.message });
  }
});

module.exports = router;
