require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// const connectDB = require('./config/db'); // تم التعطيل مؤقتًا
const vaultRoutes = require('./routes/vaultRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Connect to DB
// connectDB(); // تم التعطيل مؤقتًا

// API Routes
app.use('/api/vault', vaultRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
