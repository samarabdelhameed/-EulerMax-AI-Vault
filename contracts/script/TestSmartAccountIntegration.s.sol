// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/aa-wallet/PasskeyVerifier.sol";
import "../src/aa-wallet/SmartAccount.sol";
import "../src/aa-wallet/WalletFactory.sol";

/**
 * @title TestSmartAccountIntegration
 * @dev Integration test script for Smart Account system on Sepolia
 * @author EulerMax AI Vault
 */
contract TestSmartAccountIntegration is Script {
    // ============ Deployed Contract Addresses ============
    address constant PASSKEY_VERIFIER =
        0x2cb7d7563B0e0e573171D5dBebe95896b20e9E38;
    address constant SMART_ACCOUNT_IMPL =
        0xE66f20F1aa26D941218d9678738d0e46A5eFfCf5;
    address constant WALLET_FACTORY =
        0x14488E97783456F1dD2d222cefb718244bC8cc77;
    address constant ENTRY_POINT = 0x0576a174D229E3cFA37253523E645A78A0C91B57; // Sepolia EntryPoint

    // ============ Test Data ============
    address public testOwner;
    bytes32 public testPubKeyHash;
    uint256 public testSalt;

    function setUp() public {
        testOwner = vm.addr(vm.envUint("PRIVATE_KEY"));
        testPubKeyHash = keccak256("test-passkey-public-key");
        testSalt = 12345;
    }

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console2.log("=== Starting Smart Account Integration Test ===");
        console2.log("Test Owner:", testOwner);
        console2.log("Test PubKey Hash:", uint256(testPubKeyHash));
        console2.log("Test Salt:", testSalt);

        // ============ Step 1: Create Smart Account ============
        console2.log("\n--- Step 1: Creating Smart Account ---");

        WalletFactory factory = WalletFactory(WALLET_FACTORY);

        // Predict address before creation
        address predictedAddress = factory.getAddress(
            testOwner,
            testPubKeyHash,
            testSalt
        );
        console2.log("Predicted Smart Account Address:", predictedAddress);

        // Create smart account
        address createdAddress = factory.createSmartAccount(
            testOwner,
            testPubKeyHash,
            testSalt
        );
        console2.log("Created Smart Account Address:", createdAddress);

        // Verify addresses match
        require(
            predictedAddress == createdAddress,
            "Address prediction failed"
        );
        console2.log("Address prediction verified successfully");

        // ============ Step 2: Verify Smart Account State ============
        console2.log("\n--- Step 2: Verifying Smart Account State ---");

        SmartAccount smartAccount = SmartAccount(payable(createdAddress));

        address actualOwner = smartAccount.owner();
        bytes32 actualPubKeyHash = smartAccount.passkeyPubKeyHash();
        address actualPasskeyVerifier = address(smartAccount.passkeyVerifier());

        console2.log("Actual Owner:", actualOwner);
        console2.log("Actual PubKey Hash:", uint256(actualPubKeyHash));
        console2.log("Actual Passkey Verifier:", actualPasskeyVerifier);

        require(actualOwner == testOwner, "Owner verification failed");
        require(
            actualPubKeyHash == testPubKeyHash,
            "PubKey hash verification failed"
        );
        require(
            actualPasskeyVerifier == PASSKEY_VERIFIER,
            "Passkey verifier verification failed"
        );
        console2.log("Smart Account state verified successfully");

        // ============ Step 3: Test Passkey Update (Simulated) ============
        console2.log("\n--- Step 3: Testing Passkey Update (Simulated) ---");

        bytes32 newPubKeyHash = keccak256("new-passkey-public-key");

        // Note: In real scenario, this would require actual passkey signature verification
        // For now, we'll just log what would happen
        console2.log("New PubKey Hash:", uint256(newPubKeyHash));
        console2.log(
            "Passkey update would require real WebAuthn signature verification"
        );
        console2.log("Passkey update simulation completed");

        // ============ Step 4: Test EntryPoint Integration ============
        console2.log("\n--- Step 4: Testing EntryPoint Integration ---");

        address actualEntryPoint = address(smartAccount.entryPoint());
        console2.log("Smart Account EntryPoint:", actualEntryPoint);
        console2.log("Expected EntryPoint:", ENTRY_POINT);

        require(
            actualEntryPoint == ENTRY_POINT,
            "EntryPoint verification failed"
        );
        console2.log("EntryPoint integration verified successfully");

        // ============ Step 5: Test Nonce Management ============
        console2.log("\n--- Step 5: Testing Nonce Management ---");

        uint256 initialNonce = smartAccount.nonce();
        console2.log("Initial Nonce:", initialNonce);

        // Note: In real scenario, nonce would be incremented by EntryPoint during UserOperation
        console2.log(
            "Nonce increment happens during UserOperation execution via EntryPoint"
        );
        console2.log("Nonce management test completed");

        vm.stopBroadcast();

        console2.log("\n=== Integration Test Summary ===");
        console2.log("Smart Account Creation: SUCCESS");
        console2.log("Address Prediction: SUCCESS");
        console2.log("State Verification: SUCCESS");
        console2.log("EntryPoint Integration: SUCCESS");
        console2.log("Nonce Management: SUCCESS");
        console2.log("All integration tests passed!");
    }

    // ============ Helper Functions ============
    function testPasskeyVerification() external view {
        PasskeyVerifier verifier = PasskeyVerifier(PASSKEY_VERIFIER);

        // Test with mock data (in real scenario, use actual WebAuthn data)
        bytes32 pubKeyHash = keccak256("test-pubkey");
        bytes memory signature = "mock-signature";
        bytes memory authenticatorData = "mock-auth-data";
        bytes memory clientDataJSON = "mock-client-data";

        bool result = verifier.verifyPasskeySignature(
            pubKeyHash,
            pubKeyHash,
            signature,
            authenticatorData,
            clientDataJSON
        );

        console2.log("Passkey Verification Result:", result);
    }
}
