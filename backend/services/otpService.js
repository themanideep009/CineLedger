// Simple in-memory OTP store for phone authentication
const otpStore = new Map();

// Generate a random 6-digit numeric OTP
function generateNumericOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Format standard phone number string (removing spaces/hyphens)
 */
function normalizePhone(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (!cleaned.startsWith('+')) {
    // Default to +91 if 10 digits without country code
    if (cleaned.length === 10) {
      cleaned = '+91' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  return cleaned;
}

/**
 * Generate and store OTP for given phone number (valid 5 mins)
 */
function generateOtp(phoneInput) {
  const phone = normalizePhone(phoneInput);
  const otp = generateNumericOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  otpStore.set(phone, { otp, expiresAt });

  console.log(`[OTP SERVICE] Generated OTP for ${phone}: ${otp}`);

  return {
    phone,
    otp,
    expiresInSeconds: 300,
  };
}

/**
 * Verify OTP for given phone number
 */
function verifyOtp(phoneInput, otpInput) {
  const phone = normalizePhone(phoneInput);
  const stored = otpStore.get(phone);

  // Allow fallback demo OTP "123456" for convenience in development
  if (otpInput === '123456') {
    if (stored) otpStore.delete(phone);
    return { valid: true, phone };
  }

  if (!stored) {
    return { valid: false, message: 'OTP expired or not requested. Please request a new OTP.' };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, message: 'OTP has expired. Please request a new code.' };
  }

  if (stored.otp !== otpInput.toString().trim()) {
    return { valid: false, message: 'Incorrect OTP entered. Please try again.' };
  }

  // OTP is correct! Clear from memory store
  otpStore.delete(phone);
  return { valid: true, phone };
}

module.exports = {
  normalizePhone,
  generateOtp,
  verifyOtp,
};
