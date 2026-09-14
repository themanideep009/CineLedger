const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const theatreRoutes = require('./routes/theatreRoutes');
const movieRoutes = require('./routes/movieRoutes');
const showRoutes = require('./routes/showRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiChatRoutes = require('./routes/aiChatRoutes');
const { startAggregationJob } = require('./jobs/aggregationJob');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai-chat', aiChatRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'CineLedger Box-Office & Ticketing Verification Engine',
    version: '1.0.0-production',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cineledger';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`[Database] Connected to MongoDB at ${MONGODB_URI}`);
    // Start scheduled box office aggregation cron job
    startAggregationJob();

    app.listen(PORT, () => {
      console.log(`[CineLedger Backend Server] Running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[Database Connection Error]:', err);
    process.exit(1);
  });

