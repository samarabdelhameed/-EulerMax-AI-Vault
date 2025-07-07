const express = require('express');
const cors = require('cors');
const { getVaultData } = require('./controllers/vaultController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/vault', getVaultData);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'EulerMax AI Vault API is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Vault API: http://localhost:${PORT}/api/vault`);
});
