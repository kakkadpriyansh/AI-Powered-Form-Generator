const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const formRoutes = require('./src/routes/forms');
const aiRoutes = require('./src/routes/ai');
const uploadRoutes = require('./src/routes/upload');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API running' });
});

app.use('/auth', authRoutes);
app.use('/forms', formRoutes);
app.use('/ai', aiRoutes);
app.use('/upload', uploadRoutes);

const PORT = process.env.PORT || 4000;

// Start the server only after a successful DB connection
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err?.message || err);
    process.exit(1);
  });