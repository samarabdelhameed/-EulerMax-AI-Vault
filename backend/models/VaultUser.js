const mongoose = require('mongoose');

const VaultUserSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  deposits: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  aiRecommendations: { type: [String], default: [] },
  lastUpdate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VaultUser', VaultUserSchema);
