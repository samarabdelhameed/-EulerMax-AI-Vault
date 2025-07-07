// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "../lib/forge-std/src/Script.sol";
import {EulerMaxVault} from "../src/EulerMaxVault.sol";

/**
 * @title DeployEulerMaxVault
 * @dev Script to deploy EulerMaxVault contract
 *
 * To execute:
 * forge script script/DeployEulerMaxVault.s.sol --rpc-url $SEPOLIA_RPC --broadcast --verify -vvvv
 *
 * .env requirements:
 * USDC=0x...        // USDC address on the network
 * EULER=0x...       // Lending contract address
 * PRIVATE_KEY=...   // Deployment key
 */
contract DeployEulerMaxVault is Script {
    function setUp() public {}

    function run() public {
        // Load variables from .env
        address usdc = vm.envAddress("USDC");
        address euler;
        // Support automatic selection of MockEuler address if USE_MOCK_CONTRACTS=true
        bool useMock = false;
        try vm.envBool("USE_MOCK_CONTRACTS") returns (bool val) {
            useMock = val;
        } catch {}
        if (useMock) {
            euler = vm.envAddress("MOCK_EULER");
            console2.log("[INFO] Using MOCK_EULER:", euler);
        } else {
            euler = vm.envAddress("EULER");
            console2.log("[INFO] Using EULER:", euler);
        }
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(deployerPrivateKey);

        // Validate addresses before deployment
        require(usdc != address(0), "Invalid USDC address");
        require(euler != address(0), "Invalid EULER address");
        require(deployerPrivateKey != 0, "PRIVATE_KEY not set");

        console2.log("Starting deployment...");
        console2.log("USDC Address:", usdc);
        console2.log("EULER Address:", euler);
        console2.log("Owner Address:", owner);

        vm.startBroadcast(deployerPrivateKey);
        EulerMaxVault vault = new EulerMaxVault(usdc, euler, owner);
        vm.stopBroadcast();

        console2.log("Deployed EulerMaxVault at:", address(vault));

        console2.log("Deployment completed successfully!");
    }
}
