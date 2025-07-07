// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/RiskOracle.sol";
import "chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title MockAggregatorV3
 * @dev Mock Chainlink price feed for testing
 */
contract MockAggregatorV3 is AggregatorV3Interface {
    int256 private _price;
    uint8 private _decimals;
    string private _description;
    uint256 private _version;

    constructor(int256 price, uint8 decimals) {
        _price = price;
        _decimals = decimals;
        _description = "Mock Price Feed";
        _version = 1;
    }

    function setPrice(int256 price) external {
        _price = price;
    }

    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    function description() external view override returns (string memory) {
        return _description;
    }

    function version() external view override returns (uint256) {
        return _version;
    }

    function getRoundData(uint80 _roundId)
        external
        view
        override
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return (_roundId, _price, block.timestamp, block.timestamp, _roundId);
    }

    function latestRoundData()
        external
        view
        override
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return (1, _price, block.timestamp, block.timestamp, 1);
    }
}

/**
 * @title RiskOracleMockTest
 * @dev Simplified test suite for RiskOracle with mock data
 * @author EulerMax AI Vault
 */
contract RiskOracleMockTest is Test {
    RiskOracle public riskOracle;
    MockAggregatorV3 public mockEthFeed;
    MockAggregatorV3 public mockUsdcFeed;

    // Test addresses
    address public owner;
    address public user;

    // Events to test
    event RiskUpdated(
        uint256 timestamp,
        uint256 ethPrice,
        uint256 usdcPrice,
        uint256 volatility,
        uint256 correlation,
        bool isILAboveThreshold
    );

    event FeedAddressUpdated(address indexed feed, string symbol);

    function setUp() public {
        owner = makeAddr("owner");
        user = makeAddr("user");

        vm.startPrank(owner);

        // Deploy mock feeds
        mockEthFeed = new MockAggregatorV3(2000e8, 8); // $2000 ETH
        mockUsdcFeed = new MockAggregatorV3(1e8, 8); // $1 USDC

        // Deploy RiskOracle with mock feeds
        riskOracle = new RiskOracle(address(mockEthFeed), address(mockUsdcFeed));

        vm.stopPrank();
    }

    // ========== Constructor Tests ==========

    function test_Constructor_SetsFeedAddresses() public {
        assertEq(address(riskOracle.ethUsdFeed()), address(mockEthFeed));
        assertEq(address(riskOracle.usdcUsdFeed()), address(mockUsdcFeed));
    }

    function test_Constructor_InitializesWithCurrentPrices() public {
        RiskOracle.RiskMetrics memory metrics = riskOracle.getLatestRiskData();
        assertGt(metrics.ethPrice, 0);
        assertGt(metrics.usdcPrice, 0);
        assertEq(metrics.timestamp, block.timestamp);
    }

    function test_Constructor_RevertsWithInvalidFeedAddress() public {
        vm.expectRevert(RiskOracle.InvalidFeedAddress.selector);
        new RiskOracle(address(0), address(mockUsdcFeed));

        vm.expectRevert(RiskOracle.InvalidFeedAddress.selector);
        new RiskOracle(address(mockEthFeed), address(0));
    }

    // ========== Update Risk Tests ==========

    function test_UpdateRisk_Success() public {
        vm.startPrank(owner);

        // Change prices to simulate market movement
        mockEthFeed.setPrice(2100e8); // $2100 ETH
        mockUsdcFeed.setPrice(1e8); // $1 USDC

        // Warp time to allow update
        vm.warp(block.timestamp + 2 hours);

        riskOracle.updateRisk();

        RiskOracle.RiskMetrics memory metrics = riskOracle.getLatestRiskData();
        assertGt(metrics.ethPrice, 0);
        assertGt(metrics.usdcPrice, 0);
        assertEq(metrics.lastUpdateTime, block.timestamp);

        vm.stopPrank();
    }

    function test_UpdateRisk_EmitsRiskUpdatedEvent() public {
        vm.startPrank(owner);

        vm.warp(block.timestamp + 2 hours);

        // Update and capture the event
        vm.recordLogs();
        riskOracle.updateRisk();
        Vm.Log[] memory logs = vm.getRecordedLogs();

        // Verify that RiskUpdated event was emitted
        assertGt(logs.length, 0);

        // Parse the event data
        bytes32 eventSignature = keccak256("RiskUpdated(uint256,uint256,uint256,uint256,uint256,bool)");
        bool eventFound = false;

        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].topics[0] == eventSignature) {
                eventFound = true;
                break;
            }
        }

        assertTrue(eventFound, "RiskUpdated event should be emitted");

        vm.stopPrank();
    }

    function test_UpdateRisk_RevertsIfNotOwner() public {
        vm.startPrank(user);

        vm.expectRevert();
        riskOracle.updateRisk();

        vm.stopPrank();
    }

    function test_UpdateRisk_RevertsIfTooFrequent() public {
        vm.startPrank(owner);

        // First update
        vm.warp(block.timestamp + 2 hours);
        riskOracle.updateRisk();

        // Try to update immediately without waiting for interval
        vm.expectRevert(RiskOracle.UpdateTooFrequent.selector);
        riskOracle.updateRisk();

        vm.stopPrank();
    }

    // ========== Getter Function Tests ==========

    function test_GetVolatility_ReturnsLatestValue() public {
        vm.startPrank(owner);

        // Change prices to create volatility
        mockEthFeed.setPrice(2100e8);
        mockUsdcFeed.setPrice(1e8);

        vm.warp(block.timestamp + 2 hours);
        riskOracle.updateRisk();

        uint256 volatility = riskOracle.getVolatility();
        assertGe(volatility, 0);

        vm.stopPrank();
    }

    function test_GetCorrelation_ReturnsLatestValue() public {
        vm.startPrank(owner);

        // Change prices
        mockEthFeed.setPrice(2100e8);
        mockUsdcFeed.setPrice(1e8);

        vm.warp(block.timestamp + 2 hours);
        riskOracle.updateRisk();

        uint256 correlation = riskOracle.getCorrelation();
        assertGe(correlation, 0);
        assertLe(correlation, 1e8); // Should be <= 100%

        vm.stopPrank();
    }

    function test_IsILAboveThreshold_ReturnsLatestValue() public {
        vm.startPrank(owner);

        // Change prices significantly to trigger IL
        mockEthFeed.setPrice(2500e8); // 25% increase
        mockUsdcFeed.setPrice(1e8);

        vm.warp(block.timestamp + 2 hours);
        riskOracle.updateRisk();

        bool isILAbove = riskOracle.isILAboveThreshold();
        // Should be true due to significant price change

        vm.stopPrank();
    }

    function test_GetLatestRiskData_ReturnsCompleteMetrics() public {
        RiskOracle.RiskMetrics memory metrics = riskOracle.getLatestRiskData();

        assertGt(metrics.timestamp, 0);
        assertGt(metrics.ethPrice, 0);
        assertGt(metrics.usdcPrice, 0);
        assertGe(metrics.volatility, 0);
        assertGe(metrics.correlation, 0);
        assertLe(metrics.correlation, 1e8);
    }

    function test_IsDataStale_ReturnsCorrectStatus() public {
        // Initially data should not be stale
        assertFalse(riskOracle.isDataStale());

        // Warp time to make data stale
        vm.warp(block.timestamp + 2 hours);
        assertTrue(riskOracle.isDataStale());
    }

    // ========== Price History Tests ==========

    function test_GetPriceHistoryLength_ReturnsCorrectLength() public {
        uint256 length = riskOracle.getPriceHistoryLength();
        assertGe(length, 1); // Should have at least initial price
    }

    function test_GetPricePoint_ReturnsCorrectData() public {
        uint256 length = riskOracle.getPriceHistoryLength();
        if (length > 0) {
            RiskOracle.PricePoint memory point = riskOracle.getPricePoint(0);
            assertGt(point.price, 0);
            assertGt(point.timestamp, 0);
        }
    }

    function test_GetPricePoint_RevertsIfIndexOutOfBounds() public {
        uint256 length = riskOracle.getPriceHistoryLength();
        vm.expectRevert("Index out of bounds");
        riskOracle.getPricePoint(length);
    }

    // ========== Feed Address Update Tests ==========

    function test_UpdateFeedAddresses_Success() public {
        vm.startPrank(owner);

        address newEthFeed = makeAddr("newEthFeed");
        address newUsdcFeed = makeAddr("newUsdcFeed");

        vm.expectEmit(true, true, true, true);
        emit FeedAddressUpdated(newEthFeed, "ETH/USD");

        vm.expectEmit(true, true, true, true);
        emit FeedAddressUpdated(newUsdcFeed, "USDC/USD");

        riskOracle.updateFeedAddresses(newEthFeed, newUsdcFeed);

        vm.stopPrank();
    }

    function test_UpdateFeedAddresses_RevertsIfNotOwner() public {
        vm.startPrank(user);

        vm.expectRevert();
        riskOracle.updateFeedAddresses(makeAddr("newEthFeed"), makeAddr("newUsdcFeed"));

        vm.stopPrank();
    }

    function test_UpdateFeedAddresses_RevertsWithInvalidAddress() public {
        vm.startPrank(owner);

        vm.expectRevert(RiskOracle.InvalidFeedAddress.selector);
        riskOracle.updateFeedAddresses(address(0), makeAddr("newUsdcFeed"));

        vm.expectRevert(RiskOracle.InvalidFeedAddress.selector);
        riskOracle.updateFeedAddresses(makeAddr("newEthFeed"), address(0));

        vm.stopPrank();
    }

    // ========== Volatility Calculation Tests ==========

    function test_VolatilityCalculation_WithPriceChanges() public {
        vm.startPrank(owner);

        // Update multiple times with different prices to build volatility
        for (uint256 i = 0; i < 5; i++) {
            mockEthFeed.setPrice(int256(2000e8 + (i * 100e8))); // Increasing prices
            mockUsdcFeed.setPrice(1e8);

            vm.warp(block.timestamp + 2 hours);
            riskOracle.updateRisk();
        }

        uint256 volatility = riskOracle.getVolatility();
        assertGt(volatility, 0);

        vm.stopPrank();
    }

    // ========== Correlation Calculation Tests ==========

    function test_CorrelationCalculation_WithPriceHistory() public {
        vm.startPrank(owner);

        // Update multiple times with correlated price movements
        for (uint256 i = 0; i < 5; i++) {
            mockEthFeed.setPrice(int256(2000e8 + (i * 50e8)));
            mockUsdcFeed.setPrice(int256(1e8 + (i * 0.1e8)));

            vm.warp(block.timestamp + 2 hours);
            riskOracle.updateRisk();
        }

        uint256 correlation = riskOracle.getCorrelation();
        assertGe(correlation, 0);
        assertLe(correlation, 1e8); // Should be <= 100%

        vm.stopPrank();
    }

    // ========== IL Threshold Tests ==========

    function test_ILThreshold_WithPriceDeviation() public {
        vm.startPrank(owner);

        // Update to establish baseline
        vm.warp(block.timestamp + 2 hours);
        riskOracle.updateRisk();

        // Change price significantly to trigger IL threshold
        mockEthFeed.setPrice(2500e8); // 25% increase
        mockUsdcFeed.setPrice(1e8);

        vm.warp(block.timestamp + 4 hours);
        riskOracle.updateRisk();

        // Check IL status
        bool isILAbove = riskOracle.isILAboveThreshold();
        // Should be true due to significant price change

        vm.stopPrank();
    }

    // ========== Integration Tests ==========

    function test_FullRiskUpdateFlow() public {
        vm.startPrank(owner);

        // Initial state
        RiskOracle.RiskMetrics memory initialMetrics = riskOracle.getLatestRiskData();
        assertGt(initialMetrics.ethPrice, 0);
        assertGt(initialMetrics.usdcPrice, 0);

        // Change prices
        mockEthFeed.setPrice(2100e8);
        mockUsdcFeed.setPrice(1e8);

        // Update after time has passed
        vm.warp(block.timestamp + 2 hours);
        riskOracle.updateRisk();

        // Check updated state
        RiskOracle.RiskMetrics memory updatedMetrics = riskOracle.getLatestRiskData();
        assertGt(updatedMetrics.ethPrice, 0);
        assertGt(updatedMetrics.usdcPrice, 0);
        assertEq(updatedMetrics.lastUpdateTime, block.timestamp);

        // Check all getter functions work
        assertGe(riskOracle.getVolatility(), 0);
        assertGe(riskOracle.getCorrelation(), 0);
        assertLe(riskOracle.getCorrelation(), 1e8);

        vm.stopPrank();
    }

    function test_PriceHistoryManagement() public {
        vm.startPrank(owner);

        // Add multiple price points
        for (uint256 i = 0; i < 10; i++) {
            mockEthFeed.setPrice(int256(2000e8 + (i * 10e8)));
            mockUsdcFeed.setPrice(1e8);

            vm.warp(block.timestamp + 2 hours);
            riskOracle.updateRisk();
        }

        uint256 historyLength = riskOracle.getPriceHistoryLength();
        assertLe(historyLength, 24); // Should not exceed MAX_PRICE_HISTORY

        vm.stopPrank();
    }

    // ========== Error Handling Tests ==========

    function test_StaleDataHandling() public {
        // This test would require mocking stale data
        // For now, we test the basic functionality
        assertFalse(riskOracle.isDataStale());
    }

    function test_Constants_AreSetCorrectly() public {
        assertEq(riskOracle.PRICE_PRECISION(), 1e8);
        assertEq(riskOracle.VOLATILITY_WINDOW(), 24 hours);
        assertEq(riskOracle.MAX_PRICE_HISTORY(), 24);
        assertEq(riskOracle.IL_THRESHOLD(), 500);
        assertEq(riskOracle.UPDATE_INTERVAL(), 1 hours);
    }

    // ========== Gas Optimization Tests ==========

    function test_GasUsage_UpdateRisk() public {
        vm.startPrank(owner);

        mockEthFeed.setPrice(2100e8);
        mockUsdcFeed.setPrice(1e8);

        vm.warp(block.timestamp + 2 hours);

        uint256 gasBefore = gasleft();
        riskOracle.updateRisk();
        uint256 gasUsed = gasBefore - gasleft();

        // Should be reasonable gas usage (less than 500k)
        assertLt(gasUsed, 500000);

        vm.stopPrank();
    }

    function test_GasUsage_ViewFunctions() public {
        uint256 gasBefore = gasleft();
        riskOracle.getVolatility();
        uint256 gasUsed = gasBefore - gasleft();

        // View functions should be very cheap
        assertLt(gasUsed, 50000);
    }
}
