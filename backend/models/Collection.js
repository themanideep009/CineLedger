const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
    },
    theatreName: {
      type: String,
      default: 'External Platform Partner',
    },
    city: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    source: {
      type: String,
      enum: ['internal', 'external_simulated'],
      required: true,
    },
    ticketsSold: {
      type: Number,
      required: true,
      default: 0,
    },
    revenue: {
      type: Number,
      required: true,
      default: 0,
    },
    occupancyRate: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Collection', collectionSchema);
