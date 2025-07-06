// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/aa-wallet/PasskeyVerifier.sol";
import "../src/aa-wallet/SmartAccount.sol";
import "../src/aa-wallet/WalletFactory.sol";

/**
 * @title DeploySmartAccountSystem
 * @dev Deployment script for EIP-4337 Smart Account system
 * @author EulerMax AI Vault
 */
contract DeploySmartAccountSystem is Script {
    // ============ State Variables ============
    PasskeyVerifier public passkeyVerifier;
    SmartAccount public smartAccountImplementation;
    WalletFactory public walletFactory;

    // ============ Mock EntryPoint for testing ============
    address public entryPoint = 0x0576a174D229E3cFA37253523E645A78A0C91B57; // Sepolia EntryPoint

    // ============ Functions ============
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy PasskeyVerifier
        passkeyVerifier = new PasskeyVerifier();
        console2.log("PasskeyVerifier deployed at:", address(passkeyVerifier));

        // Deploy SmartAccount implementation
        smartAccountImplementation = new SmartAccount(IEntryPoint(entryPoint));
        console2.log(
            "SmartAccount implementation deployed at:",
            address(smartAccountImplementation)
        );

        // Deploy WalletFactory
        walletFactory = new WalletFactory(passkeyVerifier, entryPoint);
        console2.log("WalletFactory deployed at:", address(walletFactory));

        vm.stopBroadcast();

        // Log deployment summary
        console2.log("\n=== Smart Account System Deployment Summary ===");
        console2.log("PasskeyVerifier:", address(passkeyVerifier));
        console2.log(
            "SmartAccount Implementation:",
            address(smartAccountImplementation)
        );
        console2.log("WalletFactory:", address(walletFactory));
        console2.log("Sepolia EntryPoint:", entryPoint);
        console2.log("=============================================\n");
    }

    // ============ Test Functions ============
    function testDeployment() external {
        // Test PasskeyVerifier
        bytes32 testPubKeyHash = keccak256("test");
        bytes memory testSignature = "test_signature";
        bytes memory testAuthData = "test_auth_data";
        bytes memory testClientData = "test_client_data";

        bool result = passkeyVerifier.verifyPasskeySignature(
            testPubKeyHash,
            testPubKeyHash,
            testSignature,
            testAuthData,
            testClientData
        );

        console2.log("PasskeyVerifier test result:", result);

        // Test WalletFactory
        address testOwner = address(0x123);
        bytes32 testPubKey = keccak256("test_pubkey");
        uint256 testSalt = 1;

        address predictedAddress = walletFactory.getAddress(
            testOwner,
            testPubKey,
            testSalt
        );
        console2.log("Predicted Smart Account address:", predictedAddress);
    }
}
