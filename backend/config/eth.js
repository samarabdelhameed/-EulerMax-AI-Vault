require('dotenv').config({ path: __dirname + '/../.env' });
const { ethers } = require("ethers");

// شبكة Sepolia عبر Infura
const RPC_URL = "https://sepolia.infura.io/v3/e909ef7e3aaa4a2cbb627fbee4ffd000";

// إعداد المزود (provider)
const provider = new ethers.JsonRpcProvider(RPC_URL);

// إعداد الـ signer (إذا كان private key موجود وصحيح)
let signer = null;
if (process.env.PRIVATE_KEY && 
    process.env.PRIVATE_KEY !== 'ضع_هنا_المفتاح_الخاص_بمحفظتك' &&
    process.env.PRIVATE_KEY.startsWith('0x')) {
  try {
    signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log('✅ Signer configured successfully');
  } catch (error) {
    console.log('❌ Invalid private key, signer not configured');
  }
} else {
  console.log('⚠️ Private key not configured, deposit functionality disabled');
}

module.exports = {
  ethers,
  provider,
  signer,
}; 