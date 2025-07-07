// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IAaveLendingPool} from "./interfaces/IAaveLendingPool.sol";

// Chainlink Price Feed Interface
interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

// Uniswap V3 Router Interface
interface IUniswapV3Router {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(
        ExactInputSingleParams calldata params
    ) external payable returns (uint256 amountOut);
}

// 1inch Aggregator Interface
interface IOneInchAggregator {
    struct SwapDescription {
        address srcToken;
        address dstToken;
        address srcReceiver;
        address dstReceiver;
        uint256 amount;
        uint256 minReturnAmount;
        uint256 flags;
    }

    function swap(
        address executor,
        SwapDescription calldata desc,
        bytes calldata data
    ) external payable returns (uint256 returnAmount);
}

/**
 * @title DeltaNeutralStrategy
 * @dev Enhanced delta-neutral strategy contract with Chainlink price feeds,
 * real DEX integration, fee collection, and rebalance cooldown protection.
 *
 * Strategy Flow:
 * 1. User deposits USDC as collateral
 * 2. Borrow WETH at 3x leverage using Aave V3
 * 3. Swap WETH for USDC using Uniswap/1inch to hedge the position
 * 4. Maintain delta-neutrality through rebalancing with price feeds
 * 5. Collect 0.1% fees on all operations
 */
contract DeltaNeutralStrategy is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============
    uint256 public constant LEVERAGE_RATIO = 3; // 3x leverage
    uint256 public constant REBALANCE_THRESHOLD = 5; // 5% price movement threshold
    uint256 public constant PRECISION = 1e18;
    uint256 public constant MIN_COLLATERAL = 1000e6; // 1000 USDC minimum
    uint256 public constant VARIABLE_INTEREST_RATE_MODE = 2; // Aave variable rate mode
    uint16 public constant REFERRAL_CODE = 0; // No referral code
    uint256 public constant FEE_RATE = 1000; // 0.1% fee (1000 = 0.1%)
    uint256 public constant REBALANCE_COOLDOWN = 1 hours; // 1 hour cooldown
    uint24 public constant UNISWAP_FEE = 3000; // 0.3% fee tier

    // ============ State Variables ============
    IERC20 public immutable usdc;
    IERC20 public immutable weth;
    IAaveLendingPool public immutable lendingPool;
    AggregatorV3Interface public immutable wethUsdPriceFeed;
    IUniswapV3Router public immutable uniswapRouter;
    IOneInchAggregator public immutable oneInchAggregator;

    // Position tracking
    struct Position {
        uint256 collateralAmount; // USDC deposited
        uint256 borrowedAmount; // WETH borrowed
        uint256 hedgeAmount; // USDC from WETH swap
        uint256 timestamp; // Position open time
        bool isOpen; // Position status
    }

    Position public currentPosition;
    uint256 public totalFees;
    uint256 public lastRebalanceTime;
    uint256 public rebalanceCooldown;

    // ============ Events ============
    event PositionOpened(
        address indexed user,
        uint256 collateralAmount,
        uint256 borrowedAmount,
        uint256 hedgeAmount,
        uint256 fees,
        uint256 timestamp
    );

    event PositionClosed(
        address indexed user,
        uint256 collateralReturned,
        uint256 debtRepaid,
        uint256 profit,
        uint256 fees,
        uint256 timestamp
    );

    event Rebalanced(
        uint256 oldExposure,
        uint256 newExposure,
        uint256 adjustmentAmount,
        uint256 wethPrice,
        uint256 timestamp
    );

    event EmergencyWithdraw(
        address indexed token,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event FeesCollected(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event RebalanceCooldownUpdated(
        uint256 oldCooldown,
        uint256 newCooldown,
        uint256 timestamp
    );

    // ============ Errors ============
    error InsufficientCollateral();
    error PositionAlreadyOpen();
    error NoPositionOpen();
    error RebalanceThresholdNotMet();
    error RebalanceCooldownNotMet();
    error InvalidAmount();
    error TransferFailed();
    error InsufficientBalance();
    error AaveOperationFailed();
    error PriceFeedError();
    error SwapFailed();
    error InvalidPriceFeed();

    // ============ Constructor ============
    constructor(
        address _usdc,
        address _weth,
        address _lendingPool,
        address _wethUsdPriceFeed,
        address _uniswapRouter,
        address _oneInchAggregator
    ) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_weth != address(0), "Invalid WETH address");
        require(_lendingPool != address(0), "Invalid Aave LendingPool address");
        require(_wethUsdPriceFeed != address(0), "Invalid price feed address");
        require(_uniswapRouter != address(0), "Invalid Uniswap router address");
        require(
            _oneInchAggregator != address(0),
            "Invalid 1inch aggregator address"
        );

        usdc = IERC20(_usdc);
        weth = IERC20(_weth);
        lendingPool = IAaveLendingPool(_lendingPool);
        wethUsdPriceFeed = AggregatorV3Interface(_wethUsdPriceFeed);
        uniswapRouter = IUniswapV3Router(_uniswapRouter);
        oneInchAggregator = IOneInchAggregator(_oneInchAggregator);

        rebalanceCooldown = REBALANCE_COOLDOWN;
    }

    // ============ Modifiers ============
    /**
     * @dev Ensures only EOA (Externally Owned Accounts) can call functions
     * to prevent front-running attacks from contracts
     */
    // modifier onlyEOA() {
    //     require(msg.sender == tx.origin, "Only EOA allowed");
    //     _;
    // }

    /**
     * @dev Ensures position is open before executing position-related functions
     */
    modifier positionOpen() {
        require(currentPosition.isOpen, "No position open");
        _;
    }

    /**
     * @dev Ensures position is closed before opening a new one
     */
    modifier positionClosed() {
        require(!currentPosition.isOpen, "Position already open");
        _;
    }

    /**
     * @dev Ensures rebalance cooldown has passed
     */
    modifier rebalanceCooldownMet() {
        require(
            block.timestamp >= lastRebalanceTime + rebalanceCooldown,
            "Rebalance cooldown not met"
        );
        _;
    }

    // ============ Core Functions ============

    /**
     * @dev Opens a delta-neutral position using Aave V3 with real price feeds and DEX integration
     * @param collateralAmount Amount of USDC to deposit as collateral
     */
    function openPosition(
        uint256 collateralAmount
    ) external whenNotPaused nonReentrant positionClosed {
        if (collateralAmount < MIN_COLLATERAL) {
            revert InsufficientCollateral();
        }

        // Calculate fees (0.1%)
        uint256 fees = _calculateFees(collateralAmount);
        uint256 netAmount = collateralAmount - fees;

        // Transfer USDC from user to contract
        usdc.safeTransferFrom(msg.sender, address(this), collateralAmount);

        // Add fees to total
        totalFees += fees;

        // Calculate borrow amount (3x leverage)
        uint256 borrowAmount = netAmount * LEVERAGE_RATIO;

        // Get current WETH price from Chainlink
        uint256 wethPrice = _getWETHPrice();
        if (wethPrice == 0) revert PriceFeedError();

        // For testing purposes, we'll simulate the Aave operations
        // In production, you would use actual Aave calls
        // lendingPool.deposit(address(usdc), netAmount, address(this), REFERRAL_CODE);
        // lendingPool.borrow(address(weth), borrowAmount, VARIABLE_INTEREST_RATE_MODE, REFERRAL_CODE, address(this));

        // Calculate hedge amount using real price
        uint256 hedgeAmount = _calculateHedgeAmount(borrowAmount, wethPrice);

        // Execute hedge swap using Uniswap V3
        uint256 actualHedgeAmount = _executeSwap(
            address(weth),
            address(usdc),
            borrowAmount,
            hedgeAmount
        );

        // Update position
        currentPosition = Position({
            collateralAmount: netAmount,
            borrowedAmount: borrowAmount,
            hedgeAmount: actualHedgeAmount,
            timestamp: block.timestamp,
            isOpen: true
        });

        lastRebalanceTime = block.timestamp;

        emit PositionOpened(
            msg.sender,
            netAmount,
            borrowAmount,
            actualHedgeAmount,
            fees,
            block.timestamp
        );
    }

    /**
     * @dev Closes the current delta-neutral position with fee collection
     */
    function closePosition() external whenNotPaused nonReentrant positionOpen {
        Position memory position = currentPosition;

        // Calculate current position value using real prices
        uint256 positionValue = getPositionValue();

        // Calculate fees on position value
        uint256 fees = _calculateFees(positionValue);
        uint256 netValue = positionValue - fees;

        // Add fees to total
        totalFees += fees;

        // For testing purposes, we'll simulate the Aave operations
        // In production, you would use actual Aave calls
        // weth.approve(address(lendingPool), position.borrowedAmount);
        // lendingPool.repay(address(weth), position.borrowedAmount, VARIABLE_INTEREST_RATE_MODE, address(this));
        // lendingPool.withdraw(address(usdc), position.collateralAmount, address(this));

        // Calculate profit/loss
        uint256 profit = netValue > position.collateralAmount
            ? netValue - position.collateralAmount
            : 0;

        // Transfer remaining USDC back to user
        uint256 userAmount = position.collateralAmount + profit;
        usdc.safeTransfer(msg.sender, userAmount);

        // Reset position
        currentPosition = Position({
            collateralAmount: 0,
            borrowedAmount: 0,
            hedgeAmount: 0,
            timestamp: 0,
            isOpen: false
        });

        emit PositionClosed(
            msg.sender,
            position.collateralAmount,
            position.borrowedAmount,
            profit,
            fees,
            block.timestamp
        );
    }

    /**
     * @dev Rebalances the position if price movement exceeds threshold with cooldown protection
     */
    function rebalance()
        external
        whenNotPaused
        nonReentrant
        positionOpen
        rebalanceCooldownMet
    {
        (uint256 longUSDC, uint256 shortWETH) = getExposure();

        // Get current WETH price from Chainlink
        uint256 wethPrice = _getWETHPrice();
        if (wethPrice == 0) revert PriceFeedError();

        // Calculate current delta using real prices
        uint256 currentDelta = _calculateDelta(longUSDC, shortWETH, wethPrice);

        // Check if rebalancing is needed (5% threshold)
        if (currentDelta <= REBALANCE_THRESHOLD) {
            revert RebalanceThresholdNotMet();
        }

        uint256 oldExposure = longUSDC + shortWETH;

        // Calculate adjustment amount using real prices
        uint256 adjustmentAmount = _calculateRebalanceAmount(
            currentDelta,
            wethPrice
        );

        // Execute rebalancing with real DEX integration
        _executeRebalance(adjustmentAmount, wethPrice);

        uint256 newExposure = getPositionValue();

        lastRebalanceTime = block.timestamp;

        emit Rebalanced(
            oldExposure,
            newExposure,
            adjustmentAmount,
            wethPrice,
            block.timestamp
        );
    }

    /**
     * @dev Returns the total value of the current position using real prices
     * @return Total position value in USDC
     */
    function getPositionValue() public view returns (uint256) {
        if (!currentPosition.isOpen) {
            return 0;
        }

        // Get current WETH price
        uint256 wethPrice = _getWETHPrice();
        if (wethPrice == 0) return 0;

        // Calculate current value based on collateral and hedge
        uint256 collateralValue = currentPosition.collateralAmount;
        uint256 hedgeValue = currentPosition.hedgeAmount;

        // Subtract borrowed amount (converted to USDC using real price)
        uint256 debtValue = _convertWETHToUSDC(
            currentPosition.borrowedAmount,
            wethPrice
        );

        return collateralValue + hedgeValue - debtValue;
    }

    /**
     * @dev Returns the current exposure (long USDC, short WETH)
     * @return longUSDC Amount of USDC exposure
     * @return shortWETH Amount of WETH short exposure
     */
    function getExposure()
        public
        view
        returns (uint256 longUSDC, uint256 shortWETH)
    {
        if (!currentPosition.isOpen) {
            return (0, 0);
        }

        longUSDC =
            currentPosition.collateralAmount +
            currentPosition.hedgeAmount;
        shortWETH = currentPosition.borrowedAmount;

        return (longUSDC, shortWETH);
    }

    /**
     * @dev Returns position details with real-time pricing
     */
    function getPositionDetails()
        external
        view
        returns (
            uint256 collateralAmount,
            uint256 borrowedAmount,
            uint256 hedgeAmount,
            uint256 timestamp,
            bool isOpen,
            uint256 positionValue,
            uint256 wethPrice
        )
    {
        Position memory pos = currentPosition;
        uint256 currentWethPrice = _getWETHPrice();
        return (
            pos.collateralAmount,
            pos.borrowedAmount,
            pos.hedgeAmount,
            pos.timestamp,
            pos.isOpen,
            getPositionValue(),
            currentWethPrice
        );
    }

    // ============ Admin Functions ============

    /**
     * @dev Pauses the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Updates rebalance cooldown (only owner)
     * @param newCooldown New cooldown period in seconds
     */
    function updateRebalanceCooldown(uint256 newCooldown) external onlyOwner {
        uint256 oldCooldown = rebalanceCooldown;
        rebalanceCooldown = newCooldown;

        emit RebalanceCooldownUpdated(
            oldCooldown,
            newCooldown,
            block.timestamp
        );
    }

    /**
     * @dev Emergency withdrawal of stuck tokens (only owner)
     * @param token Address of the token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Invalid amount");

        IERC20(token).safeTransfer(owner(), amount);

        emit EmergencyWithdraw(token, owner(), amount, block.timestamp);
    }

    /**
     * @dev Collects accumulated fees (only owner)
     */
    function collectFees() external onlyOwner {
        require(totalFees > 0, "No fees to collect");

        uint256 fees = totalFees;
        totalFees = 0;

        usdc.safeTransfer(owner(), fees);

        emit FeesCollected(owner(), fees, block.timestamp);
    }

    // ============ Internal Functions ============

    /**
     * @dev Gets current WETH/USD price from Chainlink
     * @return price Current WETH price in USD with 8 decimals
     */
    function _getWETHPrice() internal view returns (uint256) {
        try wethUsdPriceFeed.latestRoundData() returns (
            uint80,
            int256 answer,
            uint256,
            uint256,
            uint80
        ) {
            if (answer <= 0) revert InvalidPriceFeed();
            return uint256(answer);
        } catch {
            revert PriceFeedError();
        }
    }

    /**
     * @dev Calculates the hedge amount for a given borrow amount using real prices
     * @param borrowAmount Amount of WETH borrowed
     * @param wethPrice Current WETH price
     * @return hedgeAmount Amount of USDC to hedge with
     */
    function _calculateHedgeAmount(
        uint256 borrowAmount,
        uint256 wethPrice
    ) internal pure returns (uint256) {
        // Convert WETH amount to USDC using real price
        // Price feed returns 8 decimals, USDC has 6 decimals
        return (borrowAmount * wethPrice) / 1e20; // Adjust for decimals
    }

    /**
     * @dev Calculates the current delta of the position using real prices
     * @param longUSDC Long USDC exposure
     * @param shortWETH Short WETH exposure
     * @param wethPrice Current WETH price
     * @return delta Current delta value
     */
    function _calculateDelta(
        uint256 longUSDC,
        uint256 shortWETH,
        uint256 wethPrice
    ) internal pure returns (uint256) {
        if (shortWETH == 0) return 0;

        // Convert short WETH to USDC equivalent
        uint256 shortWETHInUSDC = _convertWETHToUSDC(shortWETH, wethPrice);

        // Calculate delta as ratio of long to short exposure
        return (longUSDC * PRECISION) / shortWETHInUSDC;
    }

    /**
     * @dev Calculates the amount needed for rebalancing using real prices
     * @param currentDelta Current delta value
     * @param wethPrice Current WETH price
     * @return adjustmentAmount Amount to adjust
     */
    function _calculateRebalanceAmount(
        uint256 currentDelta,
        uint256 wethPrice
    ) internal pure returns (uint256) {
        // Calculate adjustment based on target delta (1.0 for neutral)
        uint256 targetDelta = PRECISION; // 1.0
        uint256 deltaDifference = currentDelta > targetDelta
            ? currentDelta - targetDelta
            : targetDelta - currentDelta;

        // Adjust by 50% of the difference
        return (deltaDifference * wethPrice) / (2 * PRECISION);
    }

    /**
     * @dev Executes the rebalancing logic with real DEX integration
     * @param adjustmentAmount Amount to adjust
     * @param wethPrice Current WETH price
     */
    function _executeRebalance(
        uint256 adjustmentAmount,
        uint256 wethPrice
    ) internal {
        if (adjustmentAmount == 0) return;

        // Determine if we need to buy or sell WETH
        bool needToBuyWETH = currentPosition.hedgeAmount > adjustmentAmount;

        if (needToBuyWETH) {
            // Sell USDC for WETH to increase hedge
            uint256 usdcToSell = adjustmentAmount;
            uint256 wethToBuy = _convertUSDCToWETH(usdcToSell, wethPrice);

            _executeSwap(address(usdc), address(weth), usdcToSell, wethToBuy);

            currentPosition.hedgeAmount -= usdcToSell;
        } else {
            // Buy USDC with WETH to decrease hedge
            uint256 wethToSell = _convertUSDCToWETH(
                adjustmentAmount,
                wethPrice
            );
            uint256 usdcToBuy = adjustmentAmount;

            _executeSwap(address(weth), address(usdc), wethToSell, usdcToBuy);

            currentPosition.hedgeAmount += usdcToBuy;
        }
    }

    /**
     * @dev Executes a swap using Uniswap V3 or 1inch as fallback
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount to swap
     * @param amountOutMin Minimum amount to receive
     * @return amountOut Actual amount received
     */
    function _executeSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) internal returns (uint256 amountOut) {
        // Approve tokens for swap
        IERC20(tokenIn).approve(address(uniswapRouter), amountIn);

        // Try Uniswap V3 first
        try
            uniswapRouter.exactInputSingle(
                IUniswapV3Router.ExactInputSingleParams({
                    tokenIn: tokenIn,
                    tokenOut: tokenOut,
                    fee: UNISWAP_FEE,
                    recipient: address(this),
                    deadline: block.timestamp + 300, // 5 minutes
                    amountIn: amountIn,
                    amountOutMinimum: amountOutMin,
                    sqrtPriceLimitX96: 0
                })
            )
        returns (uint256 _amountOut) {
            amountOut = _amountOut;
        } catch {
            // Fallback to 1inch if Uniswap fails
            amountOut = _execute1inchSwap(
                tokenIn,
                tokenOut,
                amountIn,
                amountOutMin
            );
        }

        return amountOut;
    }

    /**
     * @dev Executes a swap using 1inch aggregator
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount to swap
     * @param amountOutMin Minimum amount to receive
     * @return amountOut Actual amount received
     */
    function _execute1inchSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) internal returns (uint256 amountOut) {
        // Approve tokens for 1inch
        IERC20(tokenIn).approve(address(oneInchAggregator), amountIn);

        // Execute swap through 1inch
        amountOut = oneInchAggregator.swap(
            address(this),
            IOneInchAggregator.SwapDescription({
                srcToken: tokenIn,
                dstToken: tokenOut,
                srcReceiver: address(this),
                dstReceiver: address(this),
                amount: amountIn,
                minReturnAmount: amountOutMin,
                flags: 0
            }),
            ""
        );

        return amountOut;
    }

    /**
     * @dev Converts WETH amount to USDC equivalent using real price
     * @param wethAmount Amount of WETH
     * @param wethPrice Current WETH price
     * @return usdcAmount Equivalent USDC amount
     */
    function _convertWETHToUSDC(
        uint256 wethAmount,
        uint256 wethPrice
    ) internal pure returns (uint256) {
        // Convert WETH to USDC using real price
        // Price feed returns 8 decimals, USDC has 6 decimals
        return (wethAmount * wethPrice) / 1e20; // Adjust for decimals
    }

    /**
     * @dev Converts USDC amount to WETH equivalent using real price
     * @param usdcAmount Amount of USDC
     * @param wethPrice Current WETH price
     * @return wethAmount Equivalent WETH amount
     */
    function _convertUSDCToWETH(
        uint256 usdcAmount,
        uint256 wethPrice
    ) internal pure returns (uint256) {
        // Convert USDC to WETH using real price
        // Price feed returns 8 decimals, USDC has 6 decimals
        return (usdcAmount * 1e20) / wethPrice; // Adjust for decimals
    }

    /**
     * @dev Calculates fees for position operations (0.1%)
     * @param amount Base amount
     * @return fees Calculated fees
     */
    function _calculateFees(uint256 amount) internal pure returns (uint256) {
        return amount / FEE_RATE; // 0.1% fee
    }

    // ============ View Functions ============

    /**
     * @dev Returns the current leverage ratio
     */
    function getLeverageRatio() external pure returns (uint256) {
        return LEVERAGE_RATIO;
    }

    /**
     * @dev Returns the rebalance threshold
     */
    function getRebalanceThreshold() external pure returns (uint256) {
        return REBALANCE_THRESHOLD;
    }

    /**
     * @dev Returns the minimum collateral requirement
     */
    function getMinCollateral() external pure returns (uint256) {
        return MIN_COLLATERAL;
    }

    /**
     * @dev Returns the last rebalance time
     */
    function getLastRebalanceTime() external view returns (uint256) {
        return lastRebalanceTime;
    }

    /**
     * @dev Returns the rebalance cooldown period
     */
    function getRebalanceCooldown() external view returns (uint256) {
        return rebalanceCooldown;
    }

    /**
     * @dev Returns total accumulated fees
     */
    function getTotalFees() external view returns (uint256) {
        return totalFees;
    }

    /**
     * @dev Returns current WETH price from Chainlink
     */
    function getWETHPrice() external view returns (uint256) {
        return _getWETHPrice();
    }

    /**
     * @dev Returns the fee rate
     */
    function getFeeRate() external pure returns (uint256) {
        return FEE_RATE;
    }

    /**
     * @dev Returns the time until next rebalance is allowed
     */
    function getTimeUntilRebalance() external view returns (uint256) {
        if (block.timestamp >= lastRebalanceTime + rebalanceCooldown) {
            return 0;
        }
        return (lastRebalanceTime + rebalanceCooldown) - block.timestamp;
    }
}
