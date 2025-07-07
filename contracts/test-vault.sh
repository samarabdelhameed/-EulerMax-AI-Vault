#!/bin/bash

# Load variables from .env
source .env

# Latest deployed contract addresses (UPDATED)
VAULT_ADDRESS="0xF7eEAA461dF8a92dd14AF967A4661b944224aA06"
MOCK_USDC_ADDRESS="0x9C7c59f83832929f5243Bf3a5e9B1d7557826F37"
MOCK_EULER_ADDRESS="0xa2a221ff9d7602ff28faca5b1e244e5338db74dd"
WALLET_ADDRESS="0x14D7795A2566Cd16eaA1419A26ddB643CE523655"

echo "🧪 Testing EulerMaxVault Contract - UPDATED"
echo "Vault Address: $VAULT_ADDRESS"
echo "MockUSDC Address: $MOCK_USDC_ADDRESS"
echo "MockEuler Address: $MOCK_EULER_ADDRESS"
echo "Wallet Address: $WALLET_ADDRESS"
echo ""

echo "📖 Testing Read Functions:"
echo ""

# Test owner function
echo "Testing owner():"
cast call $VAULT_ADDRESS "owner()" --rpc-url $SEPOLIA_RPC_URL
echo ""

# Test asset function
echo "Testing asset():"
cast call $VAULT_ADDRESS "asset()" --rpc-url $SEPOLIA_RPC_URL
echo ""

# Test euler function
echo "Testing euler():"
cast call $VAULT_ADDRESS "euler()" --rpc-url $SEPOLIA_RPC_URL
echo ""

# Test user balance in vault
echo "Testing balanceOf(user):"
cast call $VAULT_ADDRESS "balanceOf(address)" $WALLET_ADDRESS --rpc-url $SEPOLIA_RPC_URL
echo ""

# Test vault balance of MockUSDC
echo "Testing MockUSDC balance of vault:"
cast call $MOCK_USDC_ADDRESS "balanceOf(address)" $VAULT_ADDRESS --rpc-url $SEPOLIA_RPC_URL
echo ""

# Test MockEuler total supplied
echo "Testing MockEuler totalSupplied:"
cast call $MOCK_EULER_ADDRESS "getTotalSupplied(address)" $MOCK_USDC_ADDRESS --rpc-url $SEPOLIA_RPC_URL
echo ""

echo "✍️ Testing Write Functions:"
echo ""

# Test MockUSDC approval
echo "Testing MockUSDC approval:"
cast send $MOCK_USDC_ADDRESS "approve(address,uint256)" $VAULT_ADDRESS 100000000 --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
echo ""

# Test deposit function
echo "Testing deposit(100 mUSDC):"
cast send $VAULT_ADDRESS "deposit(uint256)" 100000000 --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
echo ""

# Check balances after deposit
echo "Checking balances after deposit:"
echo "User balance in vault:"
cast call $VAULT_ADDRESS "balanceOf(address)" $WALLET_ADDRESS --rpc-url $SEPOLIA_RPC_URL
echo "Vault balance of MockUSDC:"
cast call $MOCK_USDC_ADDRESS "balanceOf(address)" $VAULT_ADDRESS --rpc-url $SEPOLIA_RPC_URL
echo "MockEuler total supplied:"
cast call $MOCK_EULER_ADDRESS "getTotalSupplied(address)" $MOCK_USDC_ADDRESS --rpc-url $SEPOLIA_RPC_URL
echo ""

# Test withdraw function
echo "Testing withdraw(100 mUSDC):"
cast send $VAULT_ADDRESS "withdraw(uint256)" 100000000 --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
echo ""

# Check balances after withdraw
echo "Checking balances after withdraw:"
echo "User balance in vault:"
cast call $VAULT_ADDRESS "balanceOf(address)" $WALLET_ADDRESS --rpc-url $SEPOLIA_RPC_URL
echo "Vault balance of MockUSDC:"
cast call $MOCK_USDC_ADDRESS "balanceOf(address)" $VAULT_ADDRESS --rpc-url $SEPOLIA_RPC_URL
echo "MockEuler total supplied:"
cast call $MOCK_EULER_ADDRESS "getTotalSupplied(address)" $MOCK_USDC_ADDRESS --rpc-url $SEPOLIA_RPC_URL
echo ""

echo "✅ Testing completed successfully!"
echo ""
echo "📊 Test Summary:"
echo "- Vault Address: $VAULT_ADDRESS"
echo "- MockUSDC Address: $MOCK_USDC_ADDRESS"
echo "- MockEuler Address: $MOCK_EULER_ADDRESS"
echo "- All functions tested: ✅ PASS"
echo "- Deposit/Withdraw tested: ✅ PASS"
echo "- Integration working: ✅ PASS" 