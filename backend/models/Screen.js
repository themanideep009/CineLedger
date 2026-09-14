const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema(
  {
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    rows: {
      type: Number,
      required: true,
      default: 8,
    },
    cols: {
      type: Number,
      required: true,
      default: 10,
    },
    vipRows: {
      type: [String], // e.g. ['A', 'B']
      default: ['A'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Screen', screenSchema);
