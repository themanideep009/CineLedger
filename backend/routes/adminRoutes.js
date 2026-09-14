const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Movie = require('../models/Movie');
const { verifyToken, requireRole } = require('../middleware/auth');
const { runAggregation } = require('../jobs/aggregationJob');

const Theatre = require('../models/Theatre');
const { logAuditEvent } = require('../middleware/audit');

// GET /api/admin/audit-logs (SUPER_ADMIN only)
router.get('/audit-logs', verifyToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { action, actorRole, limit = 100 } = req.query;
    const filter = {};

    if (action) filter.action = new RegExp(action, 'i');
    if (actorRole) filter.actorRole = actorRole;

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs.', error: error.message });
  }
});

// POST /api/admin/trigger-aggregation (SUPER_ADMIN only)
router.post('/trigger-aggregation', verifyToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const result = await runAggregation(req.user);
    res.json({
      message: 'Box-office aggregation sync completed successfully!',
      result,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to run aggregation sync.', error: error.message });
  }
});

// GET /api/admin/users (SUPER_ADMIN only)
router.get('/users', verifyToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users list.', error: error.message });
  }
});

// POST /api/admin/create-theatre (SUPER_ADMIN only)
router.post('/create-theatre', verifyToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { name, village, city, district, state, adminId } = req.body;

    if (!name || !city || !district || !state || !adminId) {
      return res.status(400).json({ message: 'Name, city, district, state, and adminId are required.' });
    }

    const adminUser = await User.findById(adminId);
    if (!adminUser) {
      return res.status(404).json({ message: 'Theatre Admin user not found.' });
    }

    const theatre = new Theatre({
      name,
      village: village || '',
      city,
      district,
      state,
      adminId,
    });

    await theatre.save();

    adminUser.theatreId = theatre._id;
    await adminUser.save();

    await logAuditEvent({
      actor: req.user,
      action: 'ADMIN_CREATED_THEATRE',
      entityType: 'Theatre',
      entityId: theatre._id,
      details: { name, city, state, adminEmail: adminUser.email },
    });

    res.status(201).json({ message: 'Theatre registered successfully.', theatre });
  } catch (error) {
    res.status(500).json({ message: 'Error creating theatre.', error: error.message });
  }
});

module.exports = router;

