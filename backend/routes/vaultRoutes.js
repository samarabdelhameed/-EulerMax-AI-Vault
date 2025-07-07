const express = require('express');
const router = express.Router();
const { getVaultData, deposit, withdraw } = require('../controllers/vaultController');

// GET /api/vault - Get vault data
router.get('/', getVaultData);

// POST /api/vault/deposit - Deposit funds
router.post('/deposit', deposit);

// POST /api/vault/withdraw - Withdraw funds
router.post('/withdraw', withdraw);

module.exports = router;
