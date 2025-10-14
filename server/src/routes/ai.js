const express = require('express');
const auth = require('../middleware/auth');
const { generateSchemaFromPrompt } = require('../utils/ai');

const router = express.Router();

router.post('/generate-schema', auth, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });
    const schema = await generateSchemaFromPrompt(prompt);
    res.json({ schema });
  } catch (err) {
    res.status(500).json({ error: 'AI error', details: err.message });
  }
});

module.exports = router;