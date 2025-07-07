const { ethers } = require('ethers');
require('dotenv').config();

// ABI for basic functions
const ABI = [
    "function owner() view returns (address)",
    "function asset() view returns (address)",
    "function euler() view returns (address)",
    "function eulerSwap() view returns (address)",
    "function totalSupplied() view returns (uint256)",
    "function vaultAPY() view returns (uint256)",
    "function setEulerSwap(address) external",
    "function deposit(uint256) external",
    "function withdraw(uint256) external"
];

async function testVault() {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const vaultAddress = "0x3c9c14a184946642af10b09890a01fadbd874502";
    const vault = new ethers.Contract(vaultAddress, ABI, wallet);
    
    console.log("🧪 Testing EulerMaxVault Contract");
    console.log("Address:", vaultAddress);
    
    try {
        // Test reading data
        console.log("\n📖 Testing Read Functions:");
        
        const owner = await vault.owner();
        console.log("✅ Owner:", owner);
        
        const asset = await vault.asset();
        console.log("✅ Asset:", asset);
        
        const euler = await vault.euler();
        console.log("✅ Euler Lending:", euler);
        
        const eulerSwap = await vault.eulerSwap();
        console.log("✅ Euler Swap:", eulerSwap);
        
        const totalSupplied = await vault.totalSupplied();
        console.log("✅ Total Supplied:", totalSupplied.toString());
        
        const apy = await vault.vaultAPY();
        console.log("✅ APY:", apy.toString());
        
        // Test setting EulerSwap
        console.log("\n✍️ Testing EulerSwap Setup:");
        const dummySwap = "0xBEEF00000000000000000000000000000000000000";
        
        const tx = await vault.setEulerSwap(dummySwap);
        await tx.wait();
        console.log("✅ EulerSwap set successfully");
        
        // Verify the update
        const newEulerSwap = await vault.eulerSwap();
        console.log("✅ New EulerSwap:", newEulerSwap);
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testVault().catch(console.error); 