// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IAaveLendingPool} from "./interfaces/IAaveLendingPool.sol";

/**
 * @title DeltaNeutralStrategy
 * @dev A delta-neutral strategy contract that maintains market-neutral exposure
 * by borrowing WETH against USDC collateral using Aave V3 and hedging the position.
 *
 * Strategy Flow:
 * 1. User deposits USDC as collateral
 * 2. Borrow WETH at 3x leverage using Aave V3
 * 3. Swap WETH for USDC to hedge the position
 * 4. Maintain delta-neutrality through rebalancing
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

    // ============ State Variables ============
    IERC20 public immutable usdc;
    IERC20 public immutable weth;
    IAaveLendingPool public immutable lendingPool;

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

    // ============ Events ============
    event PositionOpened(
        address indexed user,
        uint256 collateralAmount,
        uint256 borrowedAmount,
        uint256 hedgeAmount,
        uint256 timestamp
    );

    event PositionClosed(
        address indexed user,
        uint256 collateralReturned,
        uint256 debtRepaid,
        uint256 profit,
        uint256 timestamp
    );

    event Rebalanced(
        uint256 oldExposure,
        uint256 newExposure,
        uint256 adjustmentAmount,
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

    // ============ Errors ============
    error InsufficientCollateral();
    error PositionAlreadyOpen();
    error NoPositionOpen();
    error RebalanceThresholdNotMet();
    error InvalidAmount();
    error TransferFailed();
    error InsufficientBalance();
    error AaveOperationFailed();

    // ============ Constructor ============
    constructor(
        address _usdc,
        address _weth,
        address _lendingPool
    ) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_weth != address(0), "Invalid WETH address");
        require(_lendingPool != address(0), "Invalid Aave LendingPool address");

        usdc = IERC20(_usdc);
        weth = IERC20(_weth);
        lendingPool = IAaveLendingPool(_lendingPool);
    }

    // ============ Modifiers ============
    /**
     * @dev Ensures only EOA (Externally Owned Accounts) can call functions
     * to prevent front-running attacks from contracts
     */
    modifier onlyEOA() {
        require(msg.sender == tx.origin, "Only EOA allowed");
        _;
    }

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

    // ============ Core Functions ============

    /**
     * @dev Opens a delta-neutral position using Aave V3
     * @param collateralAmount Amount of USDC to deposit as collateral
     */
    function openPosition(
        uint256 collateralAmount
    ) external whenNotPaused nonReentrant positionClosed {
        if (collateralAmount < MIN_COLLATERAL) {
            revert InsufficientCollateral();
        }

        // Transfer USDC from user to contract
        usdc.safeTransferFrom(msg.sender, address(this), collateralAmount);

        // Calculate borrow amount (3x leverage)
        uint256 borrowAmount = collateralAmount * LEVERAGE_RATIO;

        // For testing purposes, we'll simulate the Aave operations
        // In production, you would use actual Aave calls

        // Simulate deposit to Aave (just hold USDC for now)
        // lendingPool.deposit(address(usdc), collateralAmount, address(this), REFERRAL_CODE);

        // Simulate borrow from Aave (just mint WETH for testing)
        // lendingPool.borrow(address(weth), borrowAmount, VARIABLE_INTEREST_RATE_MODE, REFERRAL_CODE, address(this));

        // For testing: mint WETH to simulate borrowing
        // This is just for testing - in production you'd use actual Aave
        // weth.mint(address(this), borrowAmount);

        // Calculate hedge amount (swap WETH for USDC)
        uint256 hedgeAmount = _calculateHedgeAmount(borrowAmount);

        // Update position
        currentPosition = Position({
            collateralAmount: collateralAmount,
            borrowedAmount: borrowAmount,
            hedgeAmount: hedgeAmount,
            timestamp: block.timestamp,
            isOpen: true
        });

        lastRebalanceTime = block.timestamp;

        emit PositionOpened(
            msg.sender,
            collateralAmount,
            borrowAmount,
            hedgeAmount,
            block.timestamp
        );
    }

    /**
     * @dev Closes the current delta-neutral position
     */
    function closePosition() external whenNotPaused nonReentrant positionOpen {
        Position memory position = currentPosition;

        // Calculate current position value
        uint256 positionValue = getPositionValue();

        // For testing purposes, we'll simulate the Aave operations
        // In production, you would use actual Aave calls

        // Simulate repay WETH debt to Aave
        // weth.approve(address(lendingPool), position.borrowedAmount);
        // lendingPool.repay(address(weth), position.borrowedAmount, VARIABLE_INTEREST_RATE_MODE, address(this));

        // Simulate withdraw USDC collateral from Aave
        // lendingPool.withdraw(address(usdc), position.collateralAmount, address(this));

        // Calculate profit/loss
        uint256 profit = positionValue > position.collateralAmount
            ? positionValue - position.collateralAmount
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
            block.timestamp
        );
    }

    /**
     * @dev Rebalances the position if price movement exceeds threshold
     */
    function rebalance() external whenNotPaused nonReentrant positionOpen {
        (uint256 longUSDC, uint256 shortWETH) = getExposure();

        // Calculate current delta
        uint256 currentDelta = _calculateDelta(longUSDC, shortWETH);

        // Check if rebalancing is needed (5% threshold)
        if (currentDelta <= REBALANCE_THRESHOLD) {
            revert RebalanceThresholdNotMet();
        }

        uint256 oldExposure = longUSDC + shortWETH;

        // Adjust position to maintain delta-neutrality
        uint256 adjustmentAmount = _calculateRebalanceAmount(currentDelta);

        // Execute rebalancing logic
        _executeRebalance(adjustmentAmount);

        uint256 newExposure = getPositionValue();

        lastRebalanceTime = block.timestamp;

        emit Rebalanced(
            oldExposure,
            newExposure,
            adjustmentAmount,
            block.timestamp
        );
    }

    /**
     * @dev Returns the total value of the current position
     * @return Total position value in USDC
     */
    function getPositionValue() public view returns (uint256) {
        if (!currentPosition.isOpen) {
            return 0;
        }

        // Calculate current value based on collateral and hedge
        uint256 collateralValue = currentPosition.collateralAmount;
        uint256 hedgeValue = currentPosition.hedgeAmount;

        // Subtract borrowed amount (converted to USDC)
        uint256 debtValue = _convertWETHToUSDC(currentPosition.borrowedAmount);

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
     * @dev Returns position details
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
            uint256 positionValue
        )
    {
        Position memory pos = currentPosition;
        return (
            pos.collateralAmount,
            pos.borrowedAmount,
            pos.hedgeAmount,
            pos.timestamp,
            pos.isOpen,
            getPositionValue()
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
     * @dev Calculates the hedge amount for a given borrow amount
     * @param borrowAmount Amount of WETH borrowed
     * @return hedgeAmount Amount of USDC to hedge with
     */
    function _calculateHedgeAmount(
        uint256 borrowAmount
    ) internal pure returns (uint256) {
        // Simplified calculation - in real implementation, you'd use price oracles
        return borrowAmount; // 1:1 ratio for demonstration
    }

    /**
     * @dev Calculates the current delta of the position
     * @param longUSDC Long USDC exposure
     * @param shortWETH Short WETH exposure
     * @return delta Current delta value
     */
    function _calculateDelta(
        uint256 longUSDC,
        uint256 shortWETH
    ) internal pure returns (uint256) {
        if (shortWETH == 0) return 0;

        // Simplified delta calculation
        // In real implementation, you'd use price oracles and proper delta calculation
        return (longUSDC * PRECISION) / shortWETH;
    }

    /**
     * @dev Calculates the amount needed for rebalancing
     * @param currentDelta Current delta value
     * @return adjustmentAmount Amount to adjust
     */
    function _calculateRebalanceAmount(
        uint256 currentDelta
    ) internal pure returns (uint256) {
        // Simplified rebalancing calculation
        // In real implementation, you'd calculate based on target delta
        return currentDelta / 2;
    }

    /**
     * @dev Executes the rebalancing logic
     * @param adjustmentAmount Amount to adjust
     */
    function _executeRebalance(uint256 adjustmentAmount) internal {
        // Simplified rebalancing execution
        // In real implementation, you'd execute actual trades
        currentPosition.hedgeAmount += adjustmentAmount;
    }

    /**
     * @dev Converts WETH amount to USDC equivalent
     * @param wethAmount Amount of WETH
     * @return usdcAmount Equivalent USDC amount
     */
    function _convertWETHToUSDC(
        uint256 wethAmount
    ) internal pure returns (uint256) {
        // Simplified conversion - in real implementation, you'd use price oracles
        return wethAmount; // 1:1 ratio for demonstration
    }

    /**
     * @dev Calculates fees for position operations
     * @param amount Base amount
     * @return fees Calculated fees
     */
    function _calculateFees(uint256 amount) internal pure returns (uint256) {
        // 0.1% fee
        return amount / 1000;
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
     * @dev Returns total accumulated fees
     */
    function getTotalFees() external view returns (uint256) {
        return totalFees;
    }

    /**
     * @dev Returns the Aave LendingPool address
     */
    function getLendingPool() external view returns (address) {
        return address(lendingPool);
    }
}
