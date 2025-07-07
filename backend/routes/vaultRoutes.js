const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vaultController');

// قراءة بيانات الفولت
router.get('/data', vaultController.getVaultData);
// إيداع
router.post('/deposit', vaultController.deposit);
// سحب
router.post('/withdraw', vaultController.withdraw);
// قراءة رصيد المستخدم من العقد الذكي
router.get('/onchain-balance/:walletAddress', vaultController.getOnchainBalance);

// يمكنك إضافة المزيد من الراوتات هنا (CRUD, AI, إلخ)

module.exports = router;
