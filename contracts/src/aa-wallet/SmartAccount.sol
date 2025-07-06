// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import "lib/openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";
import "lib/openzeppelin-contracts/contracts/proxy/utils/Initializable.sol";
import "lib/openzeppelin-contracts/contracts/proxy/utils/UUPSUpgradeable.sol";
import "./PasskeyVerifier.sol";

/**
 * @title SmartAccount
 * @dev EIP-4337 Smart Account with Passkey authentication
 * @author EulerMax AI Vault
 */
contract SmartAccount is Initializable, UUPSUpgradeable {
    using ECDSA for bytes32;

    // ============ Events ============
    event SmartAccountInitialized(address indexed owner, uint256 indexed salt);
    event TransactionExecuted(
        address indexed target,
        uint256 value,
        bytes data
    );
    event PasskeyUpdated(bytes32 indexed pubKeyHash);

    // ============ Errors ============
    error InvalidOwner();
    error InvalidSignature();
    error InvalidNonce();
    error Unauthorized();
    error InvalidPasskey();

    // ============ State Variables ============
    address public owner;
    uint256 public nonce;
    bytes32 public passkeyPubKeyHash;
    PasskeyVerifier public passkeyVerifier;

    // ============ Modifiers ============
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyEntryPoint() {
        if (msg.sender != address(entryPoint)) revert Unauthorized();
        _;
    }

    // ============ EIP-4337 EntryPoint ============
    IEntryPoint public entryPoint;

    // ============ Constructor ============
    constructor(IEntryPoint _entryPoint) {
        entryPoint = _entryPoint;
        _disableInitializers();
    }

    // ============ Initialization ============
    function initialize(
        address _owner,
        bytes32 _passkeyPubKeyHash,
        address _passkeyVerifier,
        address _entryPoint
    ) external initializer {
        if (_owner == address(0)) revert InvalidOwner();

        owner = _owner;
        passkeyPubKeyHash = _passkeyPubKeyHash;
        passkeyVerifier = PasskeyVerifier(_passkeyVerifier);
        entryPoint = IEntryPoint(_entryPoint);

        emit SmartAccountInitialized(_owner, 0);
    }

    // ============ EIP-4337 Functions ============
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external onlyEntryPoint returns (uint256 validationData) {
        // Validate nonce
        if (userOp.nonce != nonce) revert InvalidNonce();
        nonce++;

        // Validate signature
        bytes32 hash = MessageHashUtils.toEthSignedMessageHash(userOpHash);
        if (!_validateSignature(hash, userOp.signature)) {
            revert InvalidSignature();
        }

        // Pay for gas if needed
        if (missingAccountFunds > 0) {
            (bool success, ) = payable(msg.sender).call{
                value: missingAccountFunds
            }("");
            if (!success) revert();
        }

        return 0;
    }

    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyEntryPoint {
        (bool success, ) = target.call{value: value}(data);
        if (!success) revert();

        emit TransactionExecuted(target, value, data);
    }

    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata datas
    ) external onlyEntryPoint {
        for (uint256 i = 0; i < targets.length; i++) {
            (bool success, ) = targets[i].call{value: values[i]}(datas[i]);
            if (!success) revert();

            emit TransactionExecuted(targets[i], values[i], datas[i]);
        }
    }

    // ============ Passkey Functions ============
    function updatePasskey(
        bytes32 newPubKeyHash,
        bytes calldata signature,
        bytes calldata authenticatorData,
        bytes calldata clientDataJSON
    ) external onlyOwner {
        // Verify passkey signature
        if (
            !passkeyVerifier.verifyPasskeySignature(
                passkeyPubKeyHash,
                newPubKeyHash,
                signature,
                authenticatorData,
                clientDataJSON
            )
        ) {
            revert InvalidPasskey();
        }

        passkeyPubKeyHash = newPubKeyHash;
        emit PasskeyUpdated(newPubKeyHash);
    }

    // ============ View Functions ============
    function getNonce() external view returns (uint256) {
        return nonce;
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    function getPasskeyPubKeyHash() external view returns (bytes32) {
        return passkeyPubKeyHash;
    }

    // ============ Internal Functions ============
    function _validateSignature(
        bytes32 hash,
        bytes calldata signature
    ) internal view returns (bool) {
        // For now, use ECDSA signature validation
        // In production, this would validate Passkey signatures
        address signer = hash.recover(signature);
        return signer == owner;
    }

    // ============ UUPS Upgradeable ============
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    // ============ Receive ============
    receive() external payable {}
}

// ============ EIP-4337 Interfaces ============
interface IEntryPoint {
    function handleOps(
        UserOperation[] calldata ops,
        address payable beneficiary
    ) external;
}

struct UserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    uint256 callGasLimit;
    uint256 verificationGasLimit;
    uint256 preVerificationGas;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    bytes paymasterAndData;
    bytes signature;
}
