const express = require('express');
const { nanoid } = require('nanoid');
const Form = require('../models/Form');
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');

const router = express.Router();

// List forms for current user
router.get('/', auth, async (req, res) => {
  const forms = await Form.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ forms });
});

// Create new form
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, fields } = req.body;
    if (!title || !Array.isArray(fields)) return res.status(400).json({ error: 'Invalid schema' });
    const publicId = nanoid(10);
    const form = await Form.create({ userId: req.user.id, title, description, fields, publicId });
    res.json({ form });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get public form by id (publicId)
router.get('/:id', async (req, res) => {
  const form = await Form.findOne({ publicId: req.params.id });
  if (!form) return res.status(404).json({ error: 'Form not found' });
  res.json({ form: { title: form.title, description: form.description, fields: form.fields, publicId: form.publicId } });
});

// Submit response to a form (public)
router.post('/:id/submissions', async (req, res) => {
  try {
    const form = await Form.findOne({ publicId: req.params.id });
    if (!form) return res.status(404).json({ error: 'Form not found' });
    const submission = await Submission.create({ formId: form._id, data: req.body });
    res.json({ submission });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// List submissions (owner only)
router.get('/:id/submissions', auth, async (req, res) => {
  const form = await Form.findOne({ publicId: req.params.id });
  if (!form) return res.status(404).json({ error: 'Form not found' });
  if (String(form.userId) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
  const submissions = await Submission.find({ formId: form._id }).sort({ createdAt: -1 });
  res.json({ submissions });
});

module.exports = router;