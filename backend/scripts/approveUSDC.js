require('dotenv').config();
const { ethers, signer } = require("../config/eth");

const USDC_ADDRESS = "0xd35cceead182dcee0f148ebac9447da2c4d449c4"; // all lowercase
const VAULT_ADDRESS = "0x3C9c14a184946642Af10b09890A01fadbD874502";
const ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)"
];

async function main() {
  if (!signer) {
    console.error("❌ Signer not configured. Check your PRIVATE_KEY.");
    return;
  }
  const usdc = new ethers.Contract(USDC_ADDRESS, ABI, signer);
  const amount = ethers.parseUnits("100", 6); // 100 USDC (6 decimals)
  const tx = await usdc.approve(VAULT_ADDRESS, amount);
  console.log("⏳ Approve tx sent:", tx.hash);
  await tx.wait();
  console.log("✅ Approve confirmed!");
}

main().catch(console.error); 