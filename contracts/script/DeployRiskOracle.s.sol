// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/RiskOracle.sol";

/**
 * @title DeployRiskOracle
 * @dev Deployment script for RiskOracle contract
 * @author EulerMax AI Vault
 */
contract DeployRiskOracle is Script {
    // Sepolia Chainlink Feed Addresses
    address constant ETH_USD_FEED = 0x694AA1769357215DE4FAC081bf1f309aDC325306; // Sepolia ETH/USD
    address constant USDC_USD_FEED = 0x694AA1769357215DE4FAC081bf1f309aDC325306; // Using ETH/USD as fallback for testing

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy RiskOracle
        RiskOracle riskOracle = new RiskOracle(ETH_USD_FEED, USDC_USD_FEED);

        console.log("RiskOracle deployed at:", address(riskOracle));
        console.log("ETH/USD Feed:", ETH_USD_FEED);
        console.log("USDC/USD Feed:", USDC_USD_FEED);

        vm.stopBroadcast();
    }
}
