const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');
const { normalizePhone, generateOtp, verifyOtp } = require('../services/otpService');

const JWT_SECRET = process.env.JWT_SECRET || 'cineledger_super_secret_jwt_key_2026_auth_sec';

// Helper to generate JWT Token
function generateAuthToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Sign up (Customer default - Email/Password)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Only allow CUSTOMER self-registration. Admin roles must be created by Super Admin.
    const assignedRole = role === 'CUSTOMER' ? 'CUSTOMER' : 'CUSTOMER';

    const user = new User({
      name,
      email,
      passwordHash,
      role: assignedRole,
      authProvider: 'EMAIL',
    });

    await user.save();

    await logAuditEvent({
      actor: user,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user._id,
      details: { role: user.role, email: user.email, provider: 'EMAIL' },
    });

    const token = generateAuthToken(user);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user.', error: error.message });
  }
});

// Login (Email/Password)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        message: `This account uses ${user.authProvider} login. Please sign in with ${user.authProvider}.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateAuthToken(user);

    await logAuditEvent({
      actor: user,
      action: 'USER_LOGGED_IN',
      entityType: 'User',
      entityId: user._id,
      details: { role: user.role, provider: 'EMAIL' },
    });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        producerCompany: user.producerCompany,
        theatreId: user.theatreId,
        authProvider: user.authProvider,
        picture: user.picture,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in.', error: error.message });
  }
});

// Google Authentication Route
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ message: 'Google ID and Email are required.' });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Link Google ID & picture if not previously attached
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (picture && !user.picture) {
        user.picture = picture;
        updated = true;
      }
      if (updated) await user.save();
    } else {
      // Auto-register new Customer user via Google
      user = new User({
        name: name || email.split('@')[0],
        email,
        googleId,
        picture,
        authProvider: 'GOOGLE',
        role: 'CUSTOMER',
      });
      await user.save();
    }

    const token = generateAuthToken(user);

    await logAuditEvent({
      actor: user,
      action: 'USER_LOGGED_IN_GOOGLE',
      entityType: 'User',
      entityId: user._id,
      details: { role: user.role, provider: 'GOOGLE' },
    });

    res.json({
      message: 'Google login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider,
        picture: user.picture,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error authenticating with Google.', error: error.message });
  }
});

// Send Phone OTP Route
router.post('/phone/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.trim().length < 8) {
      return res.status(400).json({ message: 'A valid phone number is required.' });
    }

    const result = generateOtp(phone);

    res.json({
      message: `OTP sent to ${result.phone}`,
      phone: result.phone,
      expiresInSeconds: result.expiresInSeconds,
      // Pass demo OTP hint for easy developer testing
      testOtp: result.otp,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP.', error: error.message });
  }
});

// Verify Phone OTP & Login/Register Route
router.post('/phone/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP code are required.' });
    }

    const verification = verifyOtp(phone, otp);

    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }

    const normalized = verification.phone;
    let user = await User.findOne({ phone: normalized });

    if (!user) {
      // Auto-register new CUSTOMER user with Phone
      const defaultName = name && name.trim() ? name.trim() : `User (${normalized.slice(-4)})`;
      user = new User({
        name: defaultName,
        phone: normalized,
        authProvider: 'PHONE',
        role: 'CUSTOMER',
      });
      await user.save();
    }

    const token = generateAuthToken(user);

    await logAuditEvent({
      actor: user,
      action: 'USER_LOGGED_IN_PHONE',
      entityType: 'User',
      entityId: user._id,
      details: { role: user.role, provider: 'PHONE', phone: normalized },
    });

    res.json({
      message: 'Phone verification successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP.', error: error.message });
  }
});

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      producerCompany: req.user.producerCompany,
      theatreId: req.user.theatreId,
      authProvider: req.user.authProvider,
      picture: req.user.picture,
    },
  });
});

// Super Admin creation of Theatre Admin & Producer accounts
router.post('/create-user', verifyToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { name, email, password, role, producerCompany, theatreId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      passwordHash,
      role,
      authProvider: 'EMAIL',
      producerCompany: role === 'PRODUCER' ? producerCompany || `${name} Productions` : undefined,
      theatreId: role === 'THEATRE_ADMIN' ? theatreId : undefined,
    });

    await user.save();

    await logAuditEvent({
      actor: req.user,
      action: 'ADMIN_CREATED_USER',
      entityType: 'User',
      entityId: user._id,
      details: { createdUserRole: role, createdUserEmail: email },
    });

    res.status(201).json({
      message: `User created with role ${role}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user account.', error: error.message });
  }
});

module.exports = router;
