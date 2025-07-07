# EulerMax AI Vault - Smart Contracts

## Overview

EulerMax AI Vault is a comprehensive DeFi vault system built on Ethereum, featuring advanced yield strategies, risk management, and AI-powered decision making. The system includes smart contracts for vault management, delta-neutral strategies, risk oracles, and account abstraction with passkey authentication.

## 🏗️ Architecture

### Core Contracts

- **EulerMaxVault.sol** - Main vault contract for deposits/withdrawals
- **DeltaNeutralStrategy.sol** - Delta-neutral trading strategy implementation
- **RiskOracle.sol** - Real-time risk computation using Chainlink price feeds
- **MockUSDC.sol** - Mock USDC token for testing
- **MockEulerLending.sol** - Mock Euler lending protocol for testing

### Account Abstraction (AA) System

- **SmartAccount.sol** - EIP-4337 Smart Account with Passkey authentication
- **WalletFactory.sol** - Factory for creating smart accounts
- **PasskeyVerifier.sol** - WebAuthn/Passkey signature verification

### Interfaces

- **IEulerLending.sol** - Interface for Euler lending protocol
- **IAaveLendingPool.sol** - Interface for Aave V3 lending pool
- **IEulerSwap.sol** - Interface for Euler swap functionality

## 🚀 Quick Start

### Prerequisites

- Foundry (latest version)
- Node.js 18+
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd contracts

# Install dependencies
forge install

# Build contracts
forge build
```

### Environment Setup

Create a `.env` file in the contracts directory:

```bash
# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here

# Contract Addresses (for production)
USDC=0x...        # USDC address on the network
EULER=0x...       # Lending contract address

# Mock Contract Addresses (for testing)
MOCK_USDC=0x...
MOCK_EULER=0x...
VAULT=0x...
```

## 📋 Deployment

### 1. Deploy Mock Contracts (Testing)

```bash
# Deploy MockUSDC
forge script script/DeployMockUSDC.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify

# Deploy MockEuler
forge script script/DeployMockEuler.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify

# Deploy complete Mock Vault system
forge script script/DeployMockVault.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
```

### 2. Deploy Production Contracts

```bash
# Deploy EulerMaxVault
forge script script/DeployEulerMaxVault.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify

# Deploy DeltaNeutralStrategy
forge script script/DeployDeltaNeutralStrategy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify

# Deploy RiskOracle
forge script script/DeployRiskOracle.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify

# Deploy Smart Account System
forge script script/DeploySmartAccountSystem.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
```

## 🧪 Testing

### Automated Testing

```bash
# Run all tests
forge test

# Run specific test
forge test --match-test testDeposit

# Run with verbose output
forge test -vvv
```

### Manual Testing

```bash
# Test vault functions
forge script script/TestVaultFunctions.s.sol --rpc-url $SEPOLIA_RPC_URL

# Test smart account integration
forge script script/TestSmartAccountIntegration.s.sol --rpc-url $SEPOLIA_RPC_URL
```

### Integration Testing

```bash
# Run the complete vault flow test
bash scripts/test-vault-flow.sh
```

## 💰 Usage Examples

### Deposit to Vault

```bash
# Approve vault to spend tokens
cast send $MOCK_USDC "approve(address,uint256)" $VAULT 100000000 \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY

# Deposit tokens
cast send $VAULT "deposit(uint256)" 100000000 \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
```

### Withdraw from Vault

```bash
# Withdraw tokens
cast send $VAULT "withdraw(uint256)" 100000000 \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
```

### Check Balances

```bash
# Check user balance in vault
cast call $VAULT "balanceOf(address)" $WALLET --rpc-url $SEPOLIA_RPC_URL

# Check vault APY
cast call $VAULT "vaultAPY()" --rpc-url $SEPOLIA_RPC_URL

# Check total supplied
cast call $VAULT "totalSupplied()" --rpc-url $SEPOLIA_RPC_URL
```

## 🔧 Configuration

### Vault Configuration

```bash
# Set Euler lending contract
cast send $VAULT "setEuler(address)" $EULER \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY

# Set Euler swap contract
cast send $VAULT "setEulerSwap(address)" $EULER_SWAP \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
```

### Risk Oracle Configuration

```bash
# Update price feed addresses
cast send $RISK_ORACLE "updateFeedAddresses(address,address)" $ETH_FEED $USDC_FEED \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
```

## 📊 Contract Addresses

### Sepolia Testnet

| Contract      | Address                                      |
| ------------- | -------------------------------------------- |
| MockUSDC      | `0x9C7c59f83832929f5243Bf3a5e9B1d7557826F37` |
| MockEuler     | `0xa2a221ff9d7602ff28faca5b1e244e5338db74dd` |
| EulerMaxVault | `0xF7eEAA461dF8a92dd14AF967A4661b944224aA06` |

## 🔒 Security Features

- **Access Control** - Ownable pattern for admin functions
- **Reentrancy Protection** - ReentrancyGuard for critical functions
- **Input Validation** - Comprehensive parameter validation
- **Emergency Pause** - Pausable functionality for emergency situations
- **Account Abstraction** - EIP-4337 compliant smart accounts
- **Passkey Authentication** - WebAuthn/Passkey support for enhanced security

## 🧠 AI Integration

The system is designed to integrate with AI agents for:

- **Risk Assessment** - Real-time risk metrics from RiskOracle
- **Strategy Optimization** - AI-powered strategy parameter adjustment
- **Market Analysis** - Automated market condition monitoring
- **Portfolio Management** - Intelligent rebalancing decisions

## 📈 Performance

- **Gas Optimization** - Efficient contract design for minimal gas costs
- **Batch Operations** - Support for batch transactions
- **Upgradeable Contracts** - UUPS upgradeable pattern for future improvements
- **Modular Architecture** - Plug-and-play strategy components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation in the `/docs` folder
- Review the test files for usage examples

## 🔄 Updates

Stay updated with the latest features and improvements by:

- Following the release notes
- Checking the deployment logs
- Monitoring the contract addresses for updates

---

**Note**: This is a comprehensive smart contract system for DeFi vault management with AI integration capabilities. Always test thoroughly on testnets before deploying to mainnet.
