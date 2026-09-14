const cron = require('node-cron');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Collection = require('../models/Collection');
const MockBookMyShowAdapter = require('../adapters/MockBookMyShowAdapter');
const { logAuditEvent } = require('../middleware/audit');

const mockAdapter = new MockBookMyShowAdapter();

const runAggregation = async (triggeredBy = null) => {
  try {
    console.log('[Aggregation Engine] Running box office aggregation...');

    // 1. Process Internal Bookings
    const bookings = await Booking.find({ status: 'CONFIRMED' }).populate({
      path: 'showId',
      populate: [{ path: 'movieId' }, { path: 'theatreId' }],
    });

    const internalMap = new Map();

    for (const b of bookings) {
      if (!b.showId || !b.showId.movieId || !b.showId.theatreId) continue;

      const movie = b.showId.movieId;
      const theatre = b.showId.theatreId;
      const bookingDate = new Date(b.createdAt);
      bookingDate.setHours(0, 0, 0, 0);
      const dateStr = bookingDate.toISOString().split('T')[0];

      const key = `${movie._id}_${theatre._id}_${dateStr}`;

      if (!internalMap.has(key)) {
        internalMap.set(key, {
          movieId: movie._id,
          theatreId: theatre._id,
          theatreName: theatre.name,
          city: theatre.city,
          district: theatre.district,
          state: theatre.state,
          date: bookingDate,
          source: 'internal',
          ticketsSold: 0,
          revenue: 0,
        });
      }

      const item = internalMap.get(key);
      item.ticketsSold += b.seatIds.length;
      item.revenue += b.totalAmount;
    }

    // Save internal aggregated records
    for (const data of internalMap.values()) {
      await Collection.findOneAndUpdate(
        {
          movieId: data.movieId,
          theatreId: data.theatreId,
          date: data.date,
          source: 'internal',
        },
        data,
        { upsert: true, new: true }
      );
    }

    // 2. Process External Adapter (Simulated BookMyShow) Data
    const activeMovies = await Movie.find();
    let externalRecordsCount = 0;

    for (const movie of activeMovies) {
      const extData = await mockAdapter.fetchShowData(movie._id);
      for (const rec of extData) {
        await Collection.findOneAndUpdate(
          {
            movieId: rec.movieId,
            city: rec.city,
            date: rec.date,
            source: 'external_simulated',
          },
          rec,
          { upsert: true, new: true }
        );
        externalRecordsCount++;
      }
    }

    console.log(
      `[Aggregation Engine] Successfully synchronized ${internalMap.size} internal theatre rollups and ${externalRecordsCount} external adapter records.`
    );

    // Audit log entry
    await logAuditEvent({
      actor: triggeredBy || { name: 'Cron Job Scheduler', role: 'SYSTEM' },
      action: 'AGGREGATION_SYNCED',
      entityType: 'Collection',
      details: {
        internalRecordsUpdated: internalMap.size,
        externalRecordsSynced: externalRecordsCount,
        moviesProcessed: activeMovies.length,
      },
    });

    return {
      success: true,
      internalRecords: internalMap.size,
      externalRecords: externalRecordsCount,
    };
  } catch (error) {
    console.error('[Aggregation Engine] Error during box office aggregation:', error);
    throw error;
  }
};

// Schedule job to run every hour
const startAggregationJob = () => {
  cron.schedule('0 * * * *', () => {
    runAggregation();
  });
  console.log('[Aggregation Engine] Cron job scheduled (hourly).');
};

module.exports = {
  runAggregation,
  startAggregationJob,
};
