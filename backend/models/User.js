const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ['EMAIL', 'GOOGLE', 'PHONE'],
      default: 'EMAIL',
    },
    picture: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['CUSTOMER', 'THEATRE_ADMIN', 'PRODUCER', 'SUPER_ADMIN'],
      default: 'CUSTOMER',
      required: true,
    },
    producerCompany: {
      type: String,
      trim: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
