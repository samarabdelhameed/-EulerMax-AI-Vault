// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/MockEulerLending.sol";
import "../src/EulerMaxVault.sol";

/**
 * @title DeployMockVault
 * @dev Complete deployment script for Mock Vault system
 *
 * Deploys:
 * 1. MockUSDC
 * 2. MockEuler
 * 3. EulerMaxVault (with Mock contracts)
 * 4. Mints initial tokens
 * 5. Sets up approvals
 */
contract DeployMockVault is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("Starting Mock Vault Deployment...");
        console2.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy MockUSDC
        console2.log("Deploying MockUSDC...");
        MockUSDC mockUSDC = new MockUSDC();
        console2.log("MockUSDC deployed at:", address(mockUSDC));

        // 2. Deploy MockEuler
        console2.log("Deploying MockEuler...");
        MockEuler mockEuler = new MockEuler();
        console2.log("MockEuler deployed at:", address(mockEuler));

        // 3. Deploy EulerMaxVault with Mock contracts
        console2.log("Deploying EulerMaxVault...");
        EulerMaxVault vault = new EulerMaxVault(
            address(mockUSDC),
            address(mockEuler),
            deployer
        );
        console2.log("EulerMaxVault deployed at:", address(vault));

        // 4. Mint initial tokens to deployer
        console2.log("Minting initial tokens...");
        mockUSDC.mint(deployer, 1000000000); // 1000 mUSDC
        console2.log("Minted 1000 mUSDC to deployer");

        // 5. Approve Vault to spend tokens
        console2.log("Setting up approvals...");
        mockUSDC.approve(address(vault), type(uint256).max);
        console2.log("Vault approved to spend unlimited mUSDC");

        vm.stopBroadcast();

        // 6. Save deployment info
        string memory outputPath = string.concat(
            "deployments/",
            vm.toString(block.chainid),
            "_mock.json"
        );
        string memory json = string.concat(
            '{"mockUSDC":"',
            vm.toString(address(mockUSDC)),
            '",',
            '"mockEuler":"',
            vm.toString(address(mockEuler)),
            '",',
            '"vault":"',
            vm.toString(address(vault)),
            '",',
            '"deployer":"',
            vm.toString(deployer),
            '"}'
        );
        vm.writeFile(outputPath, json);

        console2.log("Deployment info saved to:", outputPath);

        // 7. Display final addresses
        console2.log("Deployment Complete!");
        console2.log("==================================");
        console2.log("MockUSDC:", address(mockUSDC));
        console2.log("MockEuler:", address(mockEuler));
        console2.log("EulerMaxVault:", address(vault));
        console2.log("Deployer:", deployer);
        console2.log("==================================");

        console2.log("Ready for testing!");
        console2.log("Run: bash scripts/test-vault-flow.sh");
    }
}
