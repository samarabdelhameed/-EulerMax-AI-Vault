// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/forge-std/src/Script.sol";
import {DeltaNeutralStrategy} from "../src/DeltaNeutralStrategy.sol";

/**
 * @title DeployDeltaNeutralStrategy
 * @dev Deployment script for the enhanced DeltaNeutralStrategy contract
 * with Chainlink price feeds, Uniswap V3, and 1inch integration
 */
contract DeployDeltaNeutralStrategy is Script {
    // Sepolia Testnet Addresses
    address constant USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238; // Mock USDC
    address constant WETH = 0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9; // WETH on Sepolia
    address constant AAVE_LENDING_POOL =
        0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951; // Aave V3 Pool
    address constant WETH_USD_PRICE_FEED =
        0x694AA1769357215DE4FAC081bf1f309aDC325306; // Chainlink WETH/USD
    address constant UNISWAP_V3_ROUTER =
        0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E; // Uniswap V3 Router
    address constant ONEINCH_AGGREGATOR =
        0x1111111254EEB25477B68fb85Ed929f73A960582; // 1inch Aggregator

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the enhanced DeltaNeutralStrategy contract
        DeltaNeutralStrategy strategy = new DeltaNeutralStrategy(
            USDC,
            WETH,
            AAVE_LENDING_POOL,
            WETH_USD_PRICE_FEED,
            UNISWAP_V3_ROUTER,
            ONEINCH_AGGREGATOR
        );

        vm.stopBroadcast();

        // Log deployment information
        console.log("=== DeltaNeutralStrategy Deployment ===");
        console.log("Contract Address:", address(strategy));
        console.log("USDC Token:", USDC);
        console.log("WETH Token:", WETH);
        console.log("Aave LendingPool:", AAVE_LENDING_POOL);
        console.log("WETH/USD Price Feed:", WETH_USD_PRICE_FEED);
        console.log("Uniswap V3 Router:", UNISWAP_V3_ROUTER);
        console.log("1inch Aggregator:", ONEINCH_AGGREGATOR);
        console.log("Owner:", strategy.owner());
        console.log("Leverage Ratio:", strategy.getLeverageRatio());
        console.log("Rebalance Threshold:", strategy.getRebalanceThreshold());
        console.log("Min Collateral:", strategy.getMinCollateral());
        console.log("Fee Rate:", strategy.getFeeRate());
        console.log("Rebalance Cooldown:", strategy.getRebalanceCooldown());
        console.log("=====================================");

        // Save deployment info
        string memory deploymentInfo = string.concat(
            "DeltaNeutralStrategy deployed at: ",
            vm.toString(address(strategy)),
            "\nUSDC: ",
            vm.toString(USDC),
            "\nWETH: ",
            vm.toString(WETH),
            "\nAave LendingPool: ",
            vm.toString(AAVE_LENDING_POOL),
            "\nWETH/USD Price Feed: ",
            vm.toString(WETH_USD_PRICE_FEED),
            "\nUniswap V3 Router: ",
            vm.toString(UNISWAP_V3_ROUTER),
            "\n1inch Aggregator: ",
            vm.toString(ONEINCH_AGGREGATOR)
        );

        console.log(deploymentInfo);
    }
}
