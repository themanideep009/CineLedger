/**
 * Request Validation Middleware for CineLedger API
 */
const mongoose = require('mongoose');

const validateObjectId = (paramName) => (req, res, next) => {
  const id = req.params[paramName] || req.body[paramName];
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format for parameter: ${paramName}`,
    });
  }
  next();
};

const validateRequiredFields = (fields) => (req, res, next) => {
  const missing = fields.filter((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required request parameters: ${missing.join(', ')}`,
    });
  }
  next();
};

module.exports = {
  validateObjectId,
  validateRequiredFields,
};
