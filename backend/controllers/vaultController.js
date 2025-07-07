require("dotenv").config();
const { ethers, provider, signer } = require("../config/eth");
const fs = require("fs");
const path = require("path");

// 🧠 تحميل ABI لعقد EulerMaxVault
const vaultAbiPath = path.join(__dirname, "../../contracts/out/EulerMaxVault.sol/EulerMaxVault.json");
const vaultJson = JSON.parse(fs.readFileSync(vaultAbiPath, "utf8"));
const vaultAbi = vaultJson.abi;

// 📌 عنوان العقد المنشور على Sepolia
const VAULT_ADDRESS = "0x3C9c14a184946642Af10b09890A01fadbD874502";

// 🧾 قراءة بيانات الفولت
const getVaultData = async (req, res) => {
  try {
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

  if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY.includes("ضع")) {
    return res.status(500).json({ 
      error: "❌ Private key not set", 
      message: "Please add your PRIVATE_KEY to .env file." 
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

  if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY.includes("ضع")) {
    return res.status(500).json({ 
      error: "❌ Private key not set", 
      message: "Please add your PRIVATE_KEY to .env file." 
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

module.exports = { getVaultData, deposit, withdraw };
