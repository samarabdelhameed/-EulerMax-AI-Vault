require("dotenv").config();
const fs = require("fs");
const path = require("path");
const VaultUser = require('../models/VaultUser');
const { ethers } = require('ethers');

// إعداد مزود الشبكة (RPC)
const provider = process.env.RPC_URL ? new ethers.JsonRpcProvider(process.env.RPC_URL) : null;
let signer = null;
if (process.env.PRIVATE_KEY && process.env.RPC_URL) {
  try {
    signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  } catch (e) {
    signer = null;
  }
}

// 🧠 تحميل ABI لعقد EulerMaxVault
const vaultAbiPath = path.join(__dirname, "../../contracts/out/EulerMaxVault.sol/EulerMaxVault.json");
const vaultJson = JSON.parse(fs.readFileSync(vaultAbiPath, "utf8"));
const vaultAbi = vaultJson.abi;

// 📌 عنوان العقد المنشور على Sepolia
const VAULT_ADDRESS = "0x3C9c14a184946642Af10b09890A01fadbD874502";

// 🧾 قراءة بيانات الفولت
const getVaultData = async (req, res) => {
  try {
    if (!provider) throw new Error("Provider not configured");
    const vault = new ethers.Contract(VAULT_ADDRESS, vaultAbi, provider);
    const totalShares = await vault.totalShares();
    const totalSupplied = await vault.totalSupplied();

    res.json({
      totalShares: totalShares.toString(),
      totalSupplied: totalSupplied.toString(),
      message: "✅ Real data from deployed Sepolia contract"
    });
  } catch (err) {
    console.warn("⚠️ Contract access failed, using mock data.");
    res.json({
      totalShares: "1000000000000000000",
      totalSupplied: "1500000000000000000",
      message: "⚠️ Mock data - Contract not accessible"
    });
  }
};

// 💸 إيداع الأموال في العقد
const deposit = async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "❌ Amount is required" });
  }

  if (!signer) {
    return res.status(500).json({ 
      error: "❌ Signer not set", 
      message: "Please check your PRIVATE_KEY and RPC_URL in .env file." 
    });
  }

  try {
    const vault = new ethers.Contract(VAULT_ADDRESS, vaultAbi, signer);
    const parsedAmount = BigInt(Math.floor(parseFloat(amount) * 1e6)); // لـ USDC (6 decimals)

    console.log(`🚀 Sending deposit transaction for ${amount} ETH...`);
    const tx = await vault.deposit(parsedAmount);
    console.log(`📝 Tx hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`✅ Confirmed in block ${receipt.blockNumber}`);

    res.json({
      txHash: tx.hash,
      status: "success",
      amount,
      message: "✅ Deposit successful",
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });
  } catch (err) {
    console.error("❌ Deposit failed:", err);
    res.status(500).json({ 
      error: "❌ Deposit failed", 
      details: err.message 
    });
  }
};

// 🏦 سحب الأموال من العقد
const withdraw = async (req, res) => {
  const { shares } = req.body;

  if (!shares) {
    return res.status(400).json({ error: "❌ Shares amount is required" });
  }

  if (!signer) {
    return res.status(500).json({ 
      error: "❌ Signer not set", 
      message: "Please check your PRIVATE_KEY and RPC_URL in .env file." 
    });
  }

  try {
    const vault = new ethers.Contract(VAULT_ADDRESS, vaultAbi, signer);
    const parsedShares = BigInt(Math.floor(parseFloat(shares) * 1e6)); // USDC shares (6 decimals)

    console.log(`🚀 Sending withdraw transaction for ${shares} shares...`);
    const tx = await vault.withdraw(parsedShares);
    console.log(`📝 Tx hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`✅ Withdraw confirmed in block ${receipt.blockNumber}`);

    res.json({
      txHash: tx.hash,
      status: "success",
      shares,
      message: "✅ Withdraw successful",
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });
  } catch (err) {
    console.error("❌ Withdraw failed:", err);
    res.status(500).json({ 
      error: "❌ Withdraw failed", 
      details: err.message 
    });
  }
};

// عنوان العقد الذكي وABI (ضع الـ ABI المناسب لعقدك)
const VAULT_CONTRACT_ADDRESS = process.env.VAULT_CONTRACT_ADDRESS;
const VAULT_ABI = [
  // مثال: دالة قراءة الرصيد
  "function balanceOf(address) view returns (uint256)"
];

// مثال: قراءة رصيد المستخدم من العقد الذكي
const getOnchainBalance = async (req, res) => {
  try {
    if (!provider) throw new Error("Provider not configured");
    const { walletAddress } = req.params;
    const contract = new ethers.Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, provider);
    const balance = await contract.balanceOf(walletAddress);
    res.json({ walletAddress, onchainBalance: balance.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getVaultData, deposit, withdraw, getOnchainBalance };
