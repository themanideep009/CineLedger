const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      required: true,
      default: 'Hindi',
    },
    durationMin: {
      type: Number,
      required: true,
      default: 150,
    },
    genre: {
      type: String,
      default: 'Action/Drama',
    },
    posterUrl: {
      type: String,
      default: '',
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    producerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
