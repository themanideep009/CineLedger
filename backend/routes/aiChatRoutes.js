const express = require('express');
const router = express.Router();
const { processAiChatMessage } = require('../services/aiChatService');

/**
 * POST /api/ai-chat
 * Process incoming AI chatbot query with live MongoDB context
 */
router.post('/', async (req, res, next) => {
  try {
    const { message, userId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const aiResponse = await processAiChatMessage({ message, userId });
    res.json(aiResponse);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
