// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/openzeppelin-contracts/contracts/proxy/Clones.sol";
import "./SmartAccount.sol";
import "./PasskeyVerifier.sol";

contract WalletFactory {
    using Clones for address;

    SmartAccount public immutable smartAccountImplementation;
    PasskeyVerifier public immutable passkeyVerifier;
    address public immutable entryPoint;

    event SmartAccountCreated(
        address indexed account,
        address indexed owner,
        bytes32 indexed pubKeyHash,
        uint256 salt
    );

    constructor(PasskeyVerifier _passkeyVerifier, address _entryPoint) {
        passkeyVerifier = _passkeyVerifier;
        entryPoint = _entryPoint;
        smartAccountImplementation = new SmartAccount(IEntryPoint(_entryPoint));
    }

    function getAddress(
        address owner,
        bytes32 pubKeyHash,
        uint256 salt
    ) public view returns (address) {
        bytes32 finalSalt = keccak256(abi.encode(owner, pubKeyHash, salt));
        return
            address(smartAccountImplementation).predictDeterministicAddress(
                finalSalt,
                address(this)
            );
    }

    function createSmartAccount(
        address owner,
        bytes32 pubKeyHash,
        uint256 salt
    ) external returns (address account) {
        // Create deterministic address
        bytes32 finalSalt = keccak256(abi.encode(owner, pubKeyHash, salt));
        account = getAddress(owner, pubKeyHash, salt);

        // Deploy proxy if not exists
        if (account.code.length == 0) {
            account = address(smartAccountImplementation).cloneDeterministic(
                finalSalt
            );
            SmartAccount(payable(account)).initialize(
                owner,
                pubKeyHash,
                address(passkeyVerifier),
                entryPoint
            );

            emit SmartAccountCreated(account, owner, pubKeyHash, salt);
        }

        return account;
    }

    function createSmartAccountWithPasskey(
        address owner,
        bytes calldata pubKeyBytes,
        uint256 salt
    ) external returns (address account) {
        bytes32 pubKeyHash = keccak256(pubKeyBytes);
        bytes32 finalSalt = keccak256(abi.encode(owner, pubKeyHash, salt));
        // Use the same deployment logic as createSmartAccount
        address predicted = getAddress(owner, pubKeyHash, salt);
        account = predicted;
        if (account.code.length == 0) {
            account = address(smartAccountImplementation).cloneDeterministic(
                finalSalt
            );
            SmartAccount(payable(account)).initialize(
                owner,
                pubKeyHash,
                address(passkeyVerifier),
                entryPoint
            );
            emit SmartAccountCreated(account, owner, pubKeyHash, salt);
        }
        return account;
    }

    function createMultipleAccounts(
        address[] calldata owners,
        bytes32[] calldata pubKeyHashes,
        uint256[] calldata salts
    ) external returns (address[] memory accounts) {
        require(
            owners.length == pubKeyHashes.length &&
                owners.length == salts.length,
            "Arrays length mismatch"
        );

        accounts = new address[](owners.length);
        for (uint256 i = 0; i < owners.length; i++) {
            bytes32 finalSalt = keccak256(
                abi.encode(owners[i], pubKeyHashes[i], salts[i])
            );
            address predicted = getAddress(
                owners[i],
                pubKeyHashes[i],
                salts[i]
            );
            accounts[i] = predicted;
            if (accounts[i].code.length == 0) {
                address deployed = address(smartAccountImplementation)
                    .cloneDeterministic(finalSalt);
                SmartAccount(payable(deployed)).initialize(
                    owners[i],
                    pubKeyHashes[i],
                    address(passkeyVerifier),
                    entryPoint
                );
                emit SmartAccountCreated(
                    deployed,
                    owners[i],
                    pubKeyHashes[i],
                    salts[i]
                );
                accounts[i] = deployed;
            }
        }
    }
}
