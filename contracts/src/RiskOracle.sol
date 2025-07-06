// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title RiskOracle
 * @dev Real-time risk computation using Chainlink price feeds
 * @author EulerMax AI Vault
 */
contract RiskOracle is Ownable {
    // Chainlink Price Feed Interfaces
    AggregatorV3Interface public ethUsdFeed;
    AggregatorV3Interface public usdcUsdFeed;

    // Risk Metrics Structure
    struct RiskMetrics {
        uint256 timestamp;
        uint256 ethPrice;
        uint256 usdcPrice;
        uint256 volatility; // Historical volatility (scaled by 1e8)
        uint256 correlation; // Correlation between assets (scaled by 1e8)
        bool isILAboveThreshold;
        uint256 lastUpdateTime;
    }

    // Price History for Volatility Calculation
    struct PricePoint {
        uint256 price;
        uint256 timestamp;
    }

    // Constants
    uint256 public constant PRICE_PRECISION = 1e8;
    uint256 public constant VOLATILITY_WINDOW = 24 hours; // 24 hour window
    uint256 public constant MAX_PRICE_HISTORY = 24; // Store 24 price points
    uint256 public constant IL_THRESHOLD = 500; // 5% IL threshold (scaled by 1e4)
    uint256 public constant UPDATE_INTERVAL = 1 hours; // Minimum time between updates

    // State Variables
    RiskMetrics public latestRiskMetrics;
    PricePoint[] public ethPriceHistory;
    PricePoint[] public usdcPriceHistory;

    // Events
    event RiskUpdated(
        uint256 timestamp,
        uint256 ethPrice,
        uint256 usdcPrice,
        uint256 volatility,
        uint256 correlation,
        bool isILAboveThreshold
    );

    event FeedAddressUpdated(address indexed feed, string symbol);

    // Errors
    error StaleData();
    error InvalidFeedAddress();
    error UpdateTooFrequent();
    error InsufficientPriceHistory();

    /**
     * @dev Constructor
     * @param _ethUsdFeed Chainlink ETH/USD feed address
     * @param _usdcUsdFeed Chainlink USDC/USD feed address
     */
    constructor(address _ethUsdFeed, address _usdcUsdFeed) Ownable(msg.sender) {
        if (_ethUsdFeed == address(0) || _usdcUsdFeed == address(0)) {
            revert InvalidFeedAddress();
        }

        ethUsdFeed = AggregatorV3Interface(_ethUsdFeed);
        usdcUsdFeed = AggregatorV3Interface(_usdcUsdFeed);

        // Initialize with current prices (skip update interval check for constructor)
        _initializeWithCurrentPrices();
    }

    /**
     * @dev Initialize with current prices (for constructor)
     */
    function _initializeWithCurrentPrices() internal {
        // Fetch latest prices from Chainlink
        uint256 ethPrice = _getLatestPrice(ethUsdFeed);
        uint256 usdcPrice = _getLatestPrice(usdcUsdFeed);

        // Update price history
        _updatePriceHistory(ethPriceHistory, ethPrice);
        _updatePriceHistory(usdcPriceHistory, usdcPrice);

        // Calculate risk metrics
        uint256 volatility = _calculateVolatility(ethPriceHistory);
        uint256 correlation = _calculateCorrelation(
            ethPriceHistory,
            usdcPriceHistory
        );
        bool ilAboveThreshold = _checkILThreshold(ethPrice, usdcPrice);

        // Update latest metrics
        latestRiskMetrics = RiskMetrics({
            timestamp: block.timestamp,
            ethPrice: ethPrice,
            usdcPrice: usdcPrice,
            volatility: volatility,
            correlation: correlation,
            isILAboveThreshold: ilAboveThreshold,
            lastUpdateTime: block.timestamp
        });

        emit RiskUpdated(
            block.timestamp,
            ethPrice,
            usdcPrice,
            volatility,
            correlation,
            ilAboveThreshold
        );
    }

    /**
     * @dev Update risk metrics from Chainlink feeds
     * @notice Only owner can call this function
     */
    function updateRisk() public onlyOwner {
        if (
            block.timestamp < latestRiskMetrics.lastUpdateTime + UPDATE_INTERVAL
        ) {
            revert UpdateTooFrequent();
        }

        // Fetch latest prices from Chainlink
        uint256 ethPrice = _getLatestPrice(ethUsdFeed);
        uint256 usdcPrice = _getLatestPrice(usdcUsdFeed);

        // Update price history
        _updatePriceHistory(ethPriceHistory, ethPrice);
        _updatePriceHistory(usdcPriceHistory, usdcPrice);

        // Calculate risk metrics
        uint256 volatility = _calculateVolatility(ethPriceHistory);
        uint256 correlation = _calculateCorrelation(
            ethPriceHistory,
            usdcPriceHistory
        );
        bool ilAboveThreshold = _checkILThreshold(ethPrice, usdcPrice);

        // Update latest metrics
        latestRiskMetrics = RiskMetrics({
            timestamp: block.timestamp,
            ethPrice: ethPrice,
            usdcPrice: usdcPrice,
            volatility: volatility,
            correlation: correlation,
            isILAboveThreshold: ilAboveThreshold,
            lastUpdateTime: block.timestamp
        });

        emit RiskUpdated(
            block.timestamp,
            ethPrice,
            usdcPrice,
            volatility,
            correlation,
            ilAboveThreshold
        );
    }

    /**
     * @dev Get latest volatility
     * @return Volatility scaled by 1e8
     */
    function getVolatility() public view returns (uint256) {
        return latestRiskMetrics.volatility;
    }

    /**
     * @dev Get latest correlation
     * @return Correlation scaled by 1e8
     */
    function getCorrelation() public view returns (uint256) {
        return latestRiskMetrics.correlation;
    }

    /**
     * @dev Check if IL is above threshold
     * @return True if IL is above threshold
     */
    function isILAboveThreshold() public view returns (bool) {
        return latestRiskMetrics.isILAboveThreshold;
    }

    /**
     * @dev Get latest risk data for AI agents
     * @return Complete risk metrics structure
     */
    function getLatestRiskData() public view returns (RiskMetrics memory) {
        return latestRiskMetrics;
    }

    /**
     * @dev Check if data is stale (older than 1 hour)
     * @return True if data is stale
     */
    function isDataStale() public view returns (bool) {
        return block.timestamp > latestRiskMetrics.lastUpdateTime + 1 hours;
    }

    /**
     * @dev Update feed addresses (only owner)
     * @param _ethUsdFeed New ETH/USD feed address
     * @param _usdcUsdFeed New USDC/USD feed address
     */
    function updateFeedAddresses(
        address _ethUsdFeed,
        address _usdcUsdFeed
    ) external onlyOwner {
        if (_ethUsdFeed == address(0) || _usdcUsdFeed == address(0)) {
            revert InvalidFeedAddress();
        }

        ethUsdFeed = AggregatorV3Interface(_ethUsdFeed);
        usdcUsdFeed = AggregatorV3Interface(_usdcUsdFeed);

        emit FeedAddressUpdated(_ethUsdFeed, "ETH/USD");
        emit FeedAddressUpdated(_usdcUsdFeed, "USDC/USD");
    }

    /**
     * @dev Get price history length
     * @return Number of price points stored
     */
    function getPriceHistoryLength() public view returns (uint256) {
        return ethPriceHistory.length;
    }

    /**
     * @dev Get price point at index
     * @param index Index of price point
     * @return Price point structure
     */
    function getPricePoint(
        uint256 index
    ) public view returns (PricePoint memory) {
        require(index < ethPriceHistory.length, "Index out of bounds");
        return ethPriceHistory[index];
    }

    // Internal Functions

    /**
     * @dev Get latest price from Chainlink feed
     * @param feed Chainlink price feed interface
     * @return Latest price scaled by 1e8
     */
    function _getLatestPrice(
        AggregatorV3Interface feed
    ) internal view returns (uint256) {
        (
            ,
            /* uint80 roundID */ int256 price,
            ,
            /*uint startedAt*/ uint256 updatedAt /*uint80 answeredInRound*/,

        ) = feed.latestRoundData();

        if (price <= 0) {
            revert StaleData();
        }

        if (block.timestamp - updatedAt > 24 hours) {
            revert StaleData();
        }

        return uint256(price);
    }

    /**
     * @dev Update price history array
     * @param priceHistory Array to update
     * @param newPrice New price to add
     */
    function _updatePriceHistory(
        PricePoint[] storage priceHistory,
        uint256 newPrice
    ) internal {
        PricePoint memory newPoint = PricePoint({
            price: newPrice,
            timestamp: block.timestamp
        });

        if (priceHistory.length >= MAX_PRICE_HISTORY) {
            // Remove oldest price point
            for (uint256 i = 0; i < priceHistory.length - 1; i++) {
                priceHistory[i] = priceHistory[i + 1];
            }
            priceHistory[priceHistory.length - 1] = newPoint;
        } else {
            priceHistory.push(newPoint);
        }
    }

    /**
     * @dev Calculate historical volatility
     * @param priceHistory Array of price points
     * @return Volatility scaled by 1e8
     */
    function _calculateVolatility(
        PricePoint[] storage priceHistory
    ) internal view returns (uint256) {
        if (priceHistory.length < 2) {
            return 0;
        }

        uint256 sumSquaredReturns = 0;
        uint256 count = 0;

        for (uint256 i = 1; i < priceHistory.length; i++) {
            if (
                priceHistory[i].timestamp - priceHistory[i - 1].timestamp >
                VOLATILITY_WINDOW
            ) {
                continue;
            }

            uint256 currentPrice = priceHistory[i].price;
            uint256 previousPrice = priceHistory[i - 1].price;

            if (previousPrice > 0) {
                // Calculate return: (current - previous) / previous
                uint256 returnValue;
                if (currentPrice >= previousPrice) {
                    returnValue =
                        ((currentPrice - previousPrice) * PRICE_PRECISION) /
                        previousPrice;
                } else {
                    returnValue =
                        ((previousPrice - currentPrice) * PRICE_PRECISION) /
                        previousPrice;
                }

                sumSquaredReturns += returnValue * returnValue;
                count++;
            }
        }

        if (count == 0) {
            return 0;
        }

        // Calculate standard deviation (volatility)
        uint256 meanSquaredReturns = sumSquaredReturns / count;
        return _sqrt(meanSquaredReturns);
    }

    /**
     * @dev Calculate correlation between two price series
     * @param priceHistory1 First price history
     * @param priceHistory2 Second price history
     * @return Correlation scaled by 1e8
     */
    function _calculateCorrelation(
        PricePoint[] storage priceHistory1,
        PricePoint[] storage priceHistory2
    ) internal view returns (uint256) {
        if (priceHistory1.length < 2 || priceHistory2.length < 2) {
            return 0;
        }

        uint256 sumProduct = 0;
        uint256 sum1 = 0;
        uint256 sum2 = 0;
        uint256 sumSquared1 = 0;
        uint256 sumSquared2 = 0;
        uint256 count = 0;

        uint256 minLength = priceHistory1.length < priceHistory2.length
            ? priceHistory1.length
            : priceHistory2.length;

        for (uint256 i = 0; i < minLength; i++) {
            uint256 price1 = priceHistory1[i].price;
            uint256 price2 = priceHistory2[i].price;

            sum1 += price1;
            sum2 += price2;
            sumSquared1 += price1 * price1;
            sumSquared2 += price2 * price2;
            sumProduct += price1 * price2;
            count++;
        }

        if (count == 0) {
            return 0;
        }

        // Calculate correlation coefficient
        uint256 numerator = (count * sumProduct) - (sum1 * sum2);
        uint256 denominator1 = (count * sumSquared1) - (sum1 * sum1);
        uint256 denominator2 = (count * sumSquared2) - (sum2 * sum2);

        if (denominator1 == 0 || denominator2 == 0) {
            return 0;
        }

        uint256 correlation = (numerator * PRICE_PRECISION) /
            _sqrt(denominator1 * denominator2);
        return correlation > PRICE_PRECISION ? PRICE_PRECISION : correlation;
    }

    /**
     * @dev Check if IL is above threshold
     * @param ethPrice Current ETH price
     * @param usdcPrice Current USDC price
     * @return True if IL is above threshold
     */
    function _checkILThreshold(
        uint256 ethPrice,
        uint256 usdcPrice
    ) internal view returns (bool) {
        // Simple IL indicator based on price deviation
        // This is a simplified version - in practice you'd track LP entry prices
        if (ethPriceHistory.length < 1) {
            return false;
        }

        uint256 entryEthPrice = ethPriceHistory[0].price;
        if (entryEthPrice == 0) {
            return false;
        }

        // Calculate price deviation
        uint256 priceDeviation;
        if (ethPrice >= entryEthPrice) {
            priceDeviation =
                ((ethPrice - entryEthPrice) * 10000) /
                entryEthPrice;
        } else {
            priceDeviation =
                ((entryEthPrice - ethPrice) * 10000) /
                entryEthPrice;
        }

        return priceDeviation > IL_THRESHOLD;
    }

    /**
     * @dev Calculate square root using Babylonian method
     * @param x Number to find square root of
     * @return Square root
     */
    function _sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;

        uint256 z = (x + 1) / 2;
        uint256 y = x;

        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }

        return y;
    }
}
