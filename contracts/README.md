# DeltaNeutralStrategy 🟢

A smart contract implementing a Delta-Neutral DeFi strategy using USDC and WETH on Aave V3.  
Built for capital-efficient hedging with leverage while minimizing market exposure.

---

## 📌 Key Features

- ✅ Deposit USDC as collateral
- ✅ Borrow WETH at 3x leverage via Aave V3
- ✅ Hedge the borrowed WETH by swapping into USDC
- ✅ Rebalancing logic for price movements over 5%
- ✅ Secure, pausable, and owns only access
- ✅ Full test coverage via Foundry

---

## ⚙️ Strategy Flow

1. **Deposit** USDC as initial collateral.
2. **Borrow** WETH from Aave at 3x leverage.
3. **Hedge** the WETH by swapping it back into USDC.
4. **Rebalance** when price drift exceeds threshold (5%).
5. **Close Position** to realize profit/loss and retrieve capital.

---

## 🔐 Security

- Only EOA can interact with key functions (to prevent front-running bots)
- ReentrancyGuard enabled
- Pausable contract for emergency stops
- Emergency withdrawal for admin in edge cases
- Tested against multiple scenarios with full coverage

---

## 🧪 How to Run Tests

```bash
forge test --match-contract DeltaNeutralStrategyTest -vv
```

---

# EulerMax AI Vault - Enhanced Delta Neutral Strategy

## Overview

This repository contains an enhanced Delta Neutral Strategy smart contract that implements advanced DeFi features including Chainlink price feeds, real DEX integration, automated fee collection, and rebalance cooldown protection.

## 🚀 Key Features

### 1. **Chainlink Price Feeds Integration**

- Real-time WETH/USDC price data from Chainlink oracles
- Accurate delta calculations using live market prices
- Automatic price validation and error handling

### 2. **Real DEX Integration**

- **Uniswap V3** as primary DEX for token swaps
- **1inch Aggregator** as fallback for optimal routing
- Automated hedge execution with slippage protection
- Real-time swap execution during rebalancing

### 3. **Automated Fee Collection**

- **0.1% fee** on all position operations
- Automatic fee deduction from deposits and withdrawals
- Fee accumulation in `totalFees` variable
- Owner-only fee collection function

### 4. **Rebalance Cooldown Protection**

- **1-hour cooldown** between rebalance operations
- Prevents excessive trading and gas costs
- Configurable cooldown period via admin function
- Real-time cooldown status tracking

### 5. **Enhanced Security Features**

- **EOA-only** function calls to prevent contract attacks
- Comprehensive error handling with custom error types
- Reentrancy protection on all state-changing functions
- Pausable functionality for emergency situations

## 📋 Contract Architecture

### Core Components

```solidity
contract DeltaNeutralStrategy {
    // Price Feed Integration
    AggregatorV3Interface public immutable wethUsdPriceFeed;

    // DEX Integration
    IUniswapV3Router public immutable uniswapRouter;
    IOneInchAggregator public immutable oneInchAggregator;

    // Fee Management
    uint256 public totalFees;
    uint256 public constant FEE_RATE = 1000; // 0.1%

    // Rebalance Protection
    uint256 public rebalanceCooldown;
    uint256 public lastRebalanceTime;
}
```

### Key Functions

#### Position Management

- `openPosition(uint256 collateralAmount)` - Opens delta-neutral position with fee collection
- `closePosition()` - Closes position and calculates profit/loss with fees
- `rebalance()` - Rebalances position using real prices and DEX integration

#### Price & Fee Functions

- `getWETHPrice()` - Gets current WETH price from Chainlink
- `_calculateFees(uint256 amount)` - Calculates 0.1% fees
- `collectFees()` - Allows owner to collect accumulated fees

#### Admin Functions

- `updateRebalanceCooldown(uint256 newCooldown)` - Updates rebalance cooldown
- `pause()/unpause()` - Emergency pause functionality
- `emergencyWithdraw()` - Emergency token withdrawal

## 🛠️ Deployment

### Prerequisites

- Foundry installed
- Sepolia testnet configured
- Private key set in environment

### Deployment Steps

1. **Set Environment Variables**

```bash
export PRIVATE_KEY="your_private_key_here"
```

2. **Deploy the Contract**

```bash
cd contracts
forge script script/DeployDeltaNeutralStrategy.s.sol --rpc-url https://sepolia.infura.io/v3/YOUR_PROJECT_ID --broadcast --verify
```

3. **Verify Deployment**

```bash
# Check contract address and parameters
forge script script/DeployDeltaNeutralStrategy.s.sol --rpc-url https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

### Contract Addresses (Sepolia)

| Component           | Address                                      |
| ------------------- | -------------------------------------------- |
| USDC Token          | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| WETH Token          | `0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9` |
| Aave LendingPool    | `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951` |
| WETH/USD Price Feed | `0x694AA1769357215DE4FAC081bf1f309aDC325306` |
| Uniswap V3 Router   | `0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E` |
| 1inch Aggregator    | `0x1111111254EEB25477B68fb85Ed929f73A960582` |

## 🧪 Testing

### Run All Tests

```bash
forge test
```

### Run Specific Test

```bash
forge test --match-test test_OpenPosition
```

### Test Coverage

```bash
forge coverage
```

### Key Test Scenarios

1. **Position Management**

   - Open position with fee collection
   - Close position with profit calculation
   - Insufficient collateral handling

2. **Price Feed Integration**

   - Real-time price fetching
   - Price change impact on calculations
   - Error handling for invalid prices

3. **DEX Integration**

   - Uniswap V3 swap execution
   - 1inch fallback mechanism
   - Slippage protection

4. **Rebalance Protection**

   - Cooldown enforcement
   - Rebalance threshold validation
   - Time-based restrictions

5. **Fee Management**
   - Automatic fee calculation
   - Fee accumulation tracking
   - Owner fee collection

## 📊 Strategy Mechanics

### Delta-Neutral Position Flow

1. **Position Opening**

   ```
   User deposits USDC → Calculate fees → Borrow WETH (3x leverage) →
   Get WETH price → Calculate hedge amount → Execute swap → Update position
   ```

2. **Position Rebalancing**

   ```
   Check cooldown → Get current prices → Calculate delta →
   Determine adjustment → Execute DEX swap → Update position
   ```

3. **Position Closing**
   ```
   Calculate position value → Apply fees → Calculate profit/loss →
   Return funds to user → Reset position
   ```

### Fee Structure

- **Entry Fee**: 0.1% on deposit amount
- **Exit Fee**: 0.1% on position value
- **Rebalance Fee**: 0.1% on adjustment amount
- **Total Fees**: Accumulated in `totalFees` variable

### Rebalance Logic

- **Threshold**: 5% price movement triggers rebalance
- **Cooldown**: 1 hour minimum between rebalances
- **Target Delta**: 1.0 (neutral position)
- **Adjustment**: 50% of delta difference

## 🔧 Configuration

### Constants

```solidity
uint256 public constant LEVERAGE_RATIO = 3;           // 3x leverage
uint256 public constant REBALANCE_THRESHOLD = 5;      // 5% threshold
uint256 public constant FEE_RATE = 1000;              // 0.1% fee
uint256 public constant REBALANCE_COOLDOWN = 1 hours; // 1 hour cooldown
uint24 public constant UNISWAP_FEE = 3000;           // 0.3% fee tier
```

### Admin Functions

- `updateRebalanceCooldown()` - Update cooldown period
- `pause()/unpause()` - Emergency controls
- `collectFees()` - Fee collection
- `emergencyWithdraw()` - Emergency withdrawal

## 🛡️ Security Features

### Access Control

- **Owner-only** functions for admin operations
- **EOA-only** restrictions on user functions
- **Position validation** for state-dependent operations

### Error Handling

- Custom error types for specific failure modes
- Comprehensive input validation
- Graceful failure handling for external calls

### Emergency Controls

- Pausable functionality
- Emergency withdrawal capability
- Fee collection controls

## 📈 Performance Optimizations

### Gas Efficiency

- Immutable variables for frequently accessed addresses
- Optimized storage layout
- Efficient event emission

### Price Feed Integration

- Single oracle call per operation
- Cached price data where possible
- Fallback mechanisms for oracle failures

### DEX Integration

- Primary/fallback DEX routing
- Slippage protection
- Gas-optimized swap execution

## 🔄 Integration Points

### External Protocols

- **Chainlink**: Price feed data
- **Uniswap V3**: Primary DEX for swaps
- **1inch**: Aggregator for optimal routing
- **Aave V3**: Lending and borrowing operations

### Internal Components

- **EulerMax Vault**: Main vault contract
- **Smart Account System**: Account abstraction
- **Risk Oracle**: Risk management system

## 📝 Events

### Position Events

```solidity
event PositionOpened(address indexed user, uint256 collateralAmount, uint256 borrowedAmount, uint256 hedgeAmount, uint256 fees, uint256 timestamp);
event PositionClosed(address indexed user, uint256 collateralReturned, uint256 debtRepaid, uint256 profit, uint256 fees, uint256 timestamp);
event Rebalanced(uint256 oldExposure, uint256 newExposure, uint256 adjustmentAmount, uint256 wethPrice, uint256 timestamp);
```

### Admin Events

```solidity
event FeesCollected(address indexed recipient, uint256 amount, uint256 timestamp);
event RebalanceCooldownUpdated(uint256 oldCooldown, uint256 newCooldown, uint256 timestamp);
event EmergencyWithdraw(address indexed token, address indexed recipient, uint256 amount, uint256 timestamp);
```

## 🚨 Error Types

```solidity
error InsufficientCollateral();
error PositionAlreadyOpen();
error NoPositionOpen();
error RebalanceThresholdNotMet();
error RebalanceCooldownNotMet();
error PriceFeedError();
error SwapFailed();
error InvalidPriceFeed();
```

## 📊 Monitoring & Analytics

### Key Metrics

- Position value tracking
- Fee accumulation
- Rebalance frequency
- Price impact analysis
- Gas cost optimization

### View Functions

- `getPositionDetails()` - Complete position information
- `getWETHPrice()` - Current price data
- `getTotalFees()` - Fee accumulation
- `getTimeUntilRebalance()` - Cooldown status

## 🔮 Future Enhancements

### Planned Features

- **Multi-asset support** for additional tokens
- **Advanced risk management** with dynamic thresholds
- **Automated rebalancing** based on market conditions
- **Performance analytics** and reporting
- **Governance integration** for parameter updates

### Technical Improvements

- **Batch operations** for gas optimization
- **Flash loan integration** for capital efficiency
- **Cross-chain compatibility** for multi-chain strategies
- **MEV protection** mechanisms

## 📞 Support

For technical support or questions about the enhanced Delta Neutral Strategy:

- **Documentation**: This README and inline code comments
- **Testing**: Comprehensive test suite in `test/` directory
- **Deployment**: Automated deployment scripts in `script/` directory
- **Issues**: GitHub issues for bug reports and feature requests

---

**Note**: This enhanced contract is designed for production use with real DeFi protocols. Always test thoroughly on testnets before mainnet deployment.

---

## 🚀 Deployment & Verification Log

### آخر عملية نشر وتوثيق ناجحة

| العنصر                     | القيمة                                       |
| -------------------------- | -------------------------------------------- |
| 📦 **العقد**               | `DeltaNeutralStrategy`                       |
| 🏠 **العنوان**             | `0x82B31417956553455Ed2Fea85562e6731F3023aC` |
| 🪙 **USDC Token**          | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| 💧 **WETH Token**          | `0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9` |
| 🏦 **AAVE Lending Pool**   | `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951` |
| 📈 **Price Feed**          | `0x694AA1769357215DE4FAC081bf1f309aDC325306` |
| 🔄 **Uniswap V3 Router**   | `0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E` |
| 🔀 **1inch Aggregator**    | `0x1111111254EEB25477B68fb85Ed929f73A960582` |
| 👛 **المالك**              | `0x14D7795A2566Cd16eaA1419A26ddB643CE523655` |
| 📊 **Leverage Ratio**      | `3x`                                         |
| ⚖️ **Rebalance Threshold** | `5`                                          |
| 💵 **Fee Rate**            | `1000`                                       |
| 🧊 **Cooldown**            | `3600 ثانية` (1 ساعة)                        |

- **Hash:** `0x2d88432f9f6f8be60b6671630dd4d887b3fda5bd9eadef62b2b8b832cf837c1f`
- **Block:** `8710539`
- **Paid:** `0.000005960963616972 ETH (2632524 gas * avg 0.002264353 gwei)`

### التوثيق على Etherscan

- [رابط العقد على Sepolia Etherscan](https://sepolia.etherscan.io/address/0x82b31417956553455ed2fea85562e6731f3023ac#code)
- **Contract verification status:** Pass - Verified

---

## 📊 نتائج دوال القراءة (Read Contract Results)

| الدالة                      | القيمة (Hex)            | القيمة (عشري/شرح)                  |
| --------------------------- | ----------------------- | ---------------------------------- |
| FEE_RATE                    | 0x000...03e8            | 1000 (0.1% عمولة)                  |
| LEVERAGE_RATIO              | 0x000...0003            | 3 (رافعة مالية 3x)                 |
| MIN_COLLATERAL              | 0x000...3b9aca00        | 1,000,000,000 (الحد الأدنى للضمان) |
| PRECISION                   | 0x000...de0b6b3a7640000 | 1,000,000,000,000,000,000 (1e18)   |
| REBALANCE_COOLDOWN          | 0x000...0e10            | 3600 ثانية (ساعة واحدة)            |
| REBALANCE_THRESHOLD         | 0x000...0005            | 5 (نسبة إعادة التوازن 5%)          |
| REFERRAL_CODE               | 0x000...0000            | 0 (كود الإحالة)                    |
| UNISWAP_FEE                 | 0x000...0bb8            | 3000 (0.3% عمولة Uniswap V3)       |
| VARIABLE_INTEREST_RATE_MODE | 0x000...0002            | 2 (وضع الفائدة المتغيرة)           |
| currentPosition             | 0x000...0000            | لا يوجد مركز مفتوح حالياً          |

**ملاحظة:**

- جميع القيم تم قراءتها مباشرة من العقد على شبكة Sepolia باستخدام أوامر cast call.
- currentPosition كلها أصفار لأن لم يتم فتح أي مركز بعد.

---

## 📽️ Project Presentation

[🔗 View the EulerMax AI Vault Presentation on Canva](https://www.canva.com/design/DAGseiKn93o/RuKDxhpaLCKjqK8w4znunw/edit?utm_content=DAGseiKn93o&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)
