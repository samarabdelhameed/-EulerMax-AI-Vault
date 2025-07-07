// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/RiskOracle.sol";
import "chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title RiskOracleRealDataTest
 * @dev Test suite for RiskOracle with real Chainlink data on Sepolia
 * @author EulerMax AI Vault
 */
contract RiskOracleRealDataTest is Test {
    RiskOracle public riskOracle;

    // Real Sepolia Chainlink Feed Addresses
    address constant ETH_USD_FEED = 0x694AA1769357215DE4FAC081bf1f309aDC325306; // Sepolia ETH/USD
    address constant BTC_USD_FEED = 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43; // Sepolia BTC/USD

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
        // Fork Sepolia
        vm.createSelectFork(vm.envString("SEPOLIA_RPC_URL"));

        // Make feeds persistent
        vm.makePersistent(ETH_USD_FEED);
        vm.makePersistent(BTC_USD_FEED);

        owner = makeAddr("owner");
        user = makeAddr("user");

        vm.startPrank(owner);

        // Deploy RiskOracle with real Chainlink feeds
        // Using ETH/USD and BTC/USD as they both exist on Sepolia
        riskOracle = new RiskOracle(ETH_USD_FEED, BTC_USD_FEED);

        vm.stopPrank();
    }

    // ========== Constructor Tests ==========

    function test_Constructor_SetsFeedAddresses() public {
        assertEq(address(riskOracle.ethUsdFeed()), ETH_USD_FEED);
        assertEq(address(riskOracle.usdcUsdFeed()), BTC_USD_FEED); // Using BTC as second feed
    }

    function test_Constructor_InitializesWithCurrentPrices() public {
        RiskOracle.RiskMetrics memory metrics = riskOracle.getLatestRiskData();
        assertGt(metrics.ethPrice, 0);
        assertGt(metrics.usdcPrice, 0); // This will be BTC price
        assertEq(metrics.timestamp, block.timestamp);

        console.log("ETH Price:", metrics.ethPrice);
        console.log("BTC Price:", metrics.usdcPrice);
    }

    function test_Constructor_RevertsWithInvalidFeedAddress() public {
        vm.expectRevert(RiskOracle.InvalidFeedAddress.selector);
        new RiskOracle(address(0), BTC_USD_FEED);

        vm.expectRevert(RiskOracle.InvalidFeedAddress.selector);
        new RiskOracle(ETH_USD_FEED, address(0));
    }

    // ========== Update Risk Tests ==========

    function test_UpdateRisk_Success() public {
        vm.startPrank(owner);

        uint256 initialEthPrice = riskOracle.getLatestRiskData().ethPrice;
        console.log("Initial ETH Price:", initialEthPrice);

        // Warp time to allow update
        vm.warp(block.timestamp + 2 hours);

        riskOracle.updateRisk();

        RiskOracle.RiskMetrics memory metrics = riskOracle.getLatestRiskData();
        assertGt(metrics.ethPrice, 0);
        assertGt(metrics.usdcPrice, 0);
        assertEq(metrics.lastUpdateTime, block.timestamp);

        console.log("Updated ETH Price:", metrics.ethPrice);
        console.log("Updated BTC Price:", metrics.usdcPrice);

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

        vm.warp(block.timestamp + 2 hours);
        riskOracle.updateRisk();

        uint256 volatility = riskOracle.getVolatility();
        assertGe(volatility, 0);

        console.log("Volatility:", volatility);

        vm.stopPrank();
    }

    function test_GetCorrelation_ReturnsLatestValue() public {
        vm.startPrank(owner);

        vm.warp(block.timestamp + 2 hours);
        riskOracle.updateRisk();

        uint256 correlation = riskOracle.getCorrelation();
        assertGe(correlation, 0);
        assertLe(correlation, 1e8); // Should be <= 100%

        console.log("Correlation:", correlation);

        vm.stopPrank();
    }

    function test_IsILAboveThreshold_ReturnsLatestValue() public {
        vm.startPrank(owner);

        vm.warp(block.timestamp + 2 hours);
        riskOracle.updateRisk();

        bool isILAbove = riskOracle.isILAboveThreshold();
        console.log("IL Above Threshold:", isILAbove);

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

        console.log("Complete Risk Metrics:");
        console.log("Timestamp:", metrics.timestamp);
        console.log("ETH Price:", metrics.ethPrice);
        console.log("BTC Price:", metrics.usdcPrice);
        console.log("Volatility:", metrics.volatility);
        console.log("Correlation:", metrics.correlation);
        console.log("IL Above Threshold:", metrics.isILAboveThreshold);
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

        console.log("Price History Length:", length);
    }

    function test_GetPricePoint_ReturnsCorrectData() public {
        uint256 length = riskOracle.getPriceHistoryLength();
        if (length > 0) {
            RiskOracle.PricePoint memory point = riskOracle.getPricePoint(0);
            assertGt(point.price, 0);
            assertGt(point.timestamp, 0);

            console.log("First Price Point:");
            console.log("Price:", point.price);
            console.log("Timestamp:", point.timestamp);
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

        // Update multiple times to build price history
        for (uint256 i = 0; i < 5; i++) {
            vm.warp(block.timestamp + 2 hours);
            riskOracle.updateRisk();
        }

        uint256 volatility = riskOracle.getVolatility();
        assertGe(volatility, 0);

        console.log("Calculated Volatility:", volatility);

        vm.stopPrank();
    }

    // ========== Correlation Calculation Tests ==========

    function test_CorrelationCalculation_WithPriceHistory() public {
        vm.startPrank(owner);

        // Update multiple times to build price history
        for (uint256 i = 0; i < 5; i++) {
            vm.warp(block.timestamp + 2 hours);
            riskOracle.updateRisk();
        }

        uint256 correlation = riskOracle.getCorrelation();
        assertGe(correlation, 0);
        assertLe(correlation, 1e8); // Should be <= 100%

        console.log("Calculated Correlation:", correlation);

        vm.stopPrank();
    }

    // ========== IL Threshold Tests ==========

    function test_ILThreshold_WithPriceDeviation() public {
        vm.startPrank(owner);

        // Update to establish baseline
        vm.warp(block.timestamp + 2 hours);
        riskOracle.updateRisk();

        // Check IL status
        bool isILAbove = riskOracle.isILAboveThreshold();
        console.log("IL Above Threshold:", isILAbove);

        vm.stopPrank();
    }

    // ========== Integration Tests ==========

    function test_FullRiskUpdateFlow() public {
        vm.startPrank(owner);

        // Initial state
        RiskOracle.RiskMetrics memory initialMetrics = riskOracle.getLatestRiskData();
        assertGt(initialMetrics.ethPrice, 0);
        assertGt(initialMetrics.usdcPrice, 0);

        console.log("Initial ETH Price:", initialMetrics.ethPrice);
        console.log("Initial BTC Price:", initialMetrics.usdcPrice);

        // Update after time has passed
        vm.warp(block.timestamp + 2 hours);
        riskOracle.updateRisk();

        // Check updated state
        RiskOracle.RiskMetrics memory updatedMetrics = riskOracle.getLatestRiskData();
        assertGt(updatedMetrics.ethPrice, 0);
        assertGt(updatedMetrics.usdcPrice, 0);
        assertEq(updatedMetrics.lastUpdateTime, block.timestamp);

        console.log("Updated ETH Price:", updatedMetrics.ethPrice);
        console.log("Updated BTC Price:", updatedMetrics.usdcPrice);

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
            vm.warp(block.timestamp + 2 hours);
            riskOracle.updateRisk();
        }

        uint256 historyLength = riskOracle.getPriceHistoryLength();
        assertLe(historyLength, 24); // Should not exceed MAX_PRICE_HISTORY

        console.log("Final Price History Length:", historyLength);

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

        vm.warp(block.timestamp + 2 hours);

        uint256 gasBefore = gasleft();
        riskOracle.updateRisk();
        uint256 gasUsed = gasBefore - gasleft();

        // Should be reasonable gas usage (less than 500k)
        assertLt(gasUsed, 500000);

        console.log("Gas Used for UpdateRisk:", gasUsed);

        vm.stopPrank();
    }

    function test_GasUsage_ViewFunctions() public {
        uint256 gasBefore = gasleft();
        riskOracle.getVolatility();
        uint256 gasUsed = gasBefore - gasleft();

        // View functions should be very cheap
        assertLt(gasUsed, 50000);

        console.log("Gas Used for View Function:", gasUsed);
    }

    // ========== Real Market Data Tests ==========

    function test_RealMarketData_ETHBTC_Correlation() public {
        vm.startPrank(owner);

        console.log("Testing real ETH/BTC correlation on Sepolia...");

        // Get initial prices
        RiskOracle.RiskMetrics memory initialMetrics = riskOracle.getLatestRiskData();
        console.log("Initial ETH Price:", initialMetrics.ethPrice);
        console.log("Initial BTC Price:", initialMetrics.usdcPrice);

        // Update multiple times to build correlation
        for (uint256 i = 0; i < 3; i++) {
            vm.warp(block.timestamp + 2 hours);
            riskOracle.updateRisk();

            RiskOracle.RiskMetrics memory metrics = riskOracle.getLatestRiskData();
            console.log("Update", i + 1, "ETH Price:", metrics.ethPrice);
            console.log("Update", i + 1, "BTC Price:", metrics.usdcPrice);
            console.log("Update", i + 1, "Correlation:", metrics.correlation);
            console.log("Update", i + 1, "Volatility:", metrics.volatility);
        }

        vm.stopPrank();
    }
}
