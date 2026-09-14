const AuditLog = require('../models/AuditLog');

const logAuditEvent = async ({ actor, action, entityType, entityId, details = {} }) => {
  try {
    const logEntry = new AuditLog({
      actorId: actor?._id || actor?.id || null,
      actorName: actor?.name || 'System / Anonymous',
      actorRole: actor?.role || 'SYSTEM',
      action,
      entityType,
      entityId: entityId ? String(entityId) : null,
      details,
      timestamp: new Date(),
    });
    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error('Failed to save audit log entry:', error);
  }
};

module.exports = {
  logAuditEvent,
};
