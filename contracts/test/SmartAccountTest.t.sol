// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/aa-wallet/SmartAccount.sol";
import "../src/aa-wallet/WalletFactory.sol";
import "../src/aa-wallet/PasskeyVerifier.sol";
import "../lib/openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";

contract SmartAccountTest is Test {
    SmartAccount public smartAccount;
    WalletFactory public factory;
    PasskeyVerifier public passkeyVerifier;
    address public entryPoint = 0x0576a174D229E3cFA37253523E645A78A0C91B57;

    address public owner = address(0x123);
    bytes32 public pubKeyHash = keccak256("test-public-key");
    uint256 public salt = 12345;

    function setUp() public {
        // Deploy PasskeyVerifier first
        passkeyVerifier = new PasskeyVerifier();

        // Deploy factory with real EntryPoint
        factory = new WalletFactory(passkeyVerifier, entryPoint);

        // Create smart account
        address accountAddress = factory.createSmartAccount(
            owner,
            pubKeyHash,
            salt
        );
        smartAccount = SmartAccount(payable(accountAddress));
    }

    function test_DeterministicAccountCreation() public {
        // Test that same parameters create same address
        address account1 = factory.createSmartAccount(owner, pubKeyHash, salt);
        address account2 = factory.createSmartAccount(owner, pubKeyHash, salt);

        assertEq(account1, account2, "Accounts should be deterministic");
        assertEq(
            account1,
            address(smartAccount),
            "Should match deployed account"
        );
    }

    function test_AccountInitialization() public {
        assertEq(smartAccount.owner(), owner, "Owner should be set correctly");
        assertEq(
            smartAccount.passkeyPubKeyHash(),
            pubKeyHash,
            "Public key hash should be set correctly"
        );
        assertEq(
            address(smartAccount.passkeyVerifier()),
            address(passkeyVerifier),
            "Passkey verifier should be set correctly"
        );
    }

    function test_NonceIncrement() public {
        uint256 initialNonce = smartAccount.nonce();

        // Execute a transaction to increment nonce
        bytes memory data = abi.encodeWithSignature("nonce()");
        vm.prank(entryPoint);
        smartAccount.execute(address(0), 0, data);

        assertEq(
            smartAccount.nonce(),
            initialNonce + 1,
            "Nonce should increment"
        );
    }

    function test_OwnerOnlyFunctions() public {
        // Try to call owner-only function from non-owner
        vm.prank(address(0x456));
        vm.expectRevert();
        smartAccount.updatePasskey(bytes32(0), "", "", "");
    }

    function test_PasskeyUpdate() public {
        bytes32 newPubKeyHash = keccak256("new-public-key");

        vm.prank(owner);
        smartAccount.updatePasskey(newPubKeyHash, "", "", "");

        assertEq(
            smartAccount.passkeyPubKeyHash(),
            newPubKeyHash,
            "Public key hash should be updated"
        );
    }

    function test_ReceiveFunction() public {
        uint256 initialBalance = address(smartAccount).balance;
        uint256 sendAmount = 1 ether;

        // Send ETH to smart account
        payable(address(smartAccount)).transfer(sendAmount);

        assertEq(
            address(smartAccount).balance,
            initialBalance + sendAmount,
            "Smart account should receive ETH"
        );
    }

    function test_ExecuteFunction() public {
        // Create a mock contract to test execution
        MockContract mock = new MockContract();

        bytes memory data = abi.encodeWithSignature("setValue(uint256)", 42);
        smartAccount.execute(address(mock), 0, data);

        assertEq(mock.value(), 42, "Execute should work correctly");
    }
}

contract MockContract {
    uint256 public value;

    function setValue(uint256 _value) external {
        value = _value;
    }
}
