const express = require('express');
const multer = require('multer');
const { cloudinary, configureCloudinary } = require('../utils/cloudinary');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const enabled = configureCloudinary();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!enabled) return res.status(500).json({ error: 'Cloudinary not configured' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const url = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'ai-forms' },
        (error, data) => {
          if (error) return reject(error);
          resolve(data.secure_url);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;