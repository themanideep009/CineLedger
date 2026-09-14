const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrPayload: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['ISSUED', 'USED', 'EXPIRED', 'CANCELLED'],
      default: 'ISSUED',
      required: true,
    },
    scannedAt: {
      type: Date,
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
