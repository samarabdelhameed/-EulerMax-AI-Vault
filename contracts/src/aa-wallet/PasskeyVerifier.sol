// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PasskeyVerifier
 * @dev WebAuthn/Passkey signature verification for Smart Accounts
 * @author EulerMax AI Vault
 */
contract PasskeyVerifier {
    // ============ Events ============
    event PasskeyVerified(bytes32 indexed pubKeyHash, address indexed user);

    // ============ Errors ============
    error InvalidSignature();
    error InvalidAuthenticatorData();
    error InvalidClientData();

    // ============ Constants ============
    bytes32 public constant WEBAUTHN_TYPE_HASH = keccak256("type:webauthn.get");
    bytes32 public constant CHALLENGE_TYPE_HASH = keccak256("type:challenge");

    // ============ Functions ============
    function verifyPasskeySignature(
        bytes32 currentPubKeyHash,
        bytes32 newPubKeyHash,
        bytes calldata signature,
        bytes calldata authenticatorData,
        bytes calldata clientDataJSON
    ) external pure returns (bool) {
        // Verify authenticator data
        if (!_verifyAuthenticatorData(authenticatorData)) {
            revert InvalidAuthenticatorData();
        }

        // Verify client data
        if (!_verifyClientData(clientDataJSON)) {
            revert InvalidClientData();
        }

        // Verify signature (simplified for demo)
        // In production, this would use proper WebAuthn verification
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                currentPubKeyHash,
                newPubKeyHash,
                authenticatorData,
                clientDataJSON
            )
        );

        // For demo purposes, accept any non-zero signature
        // In production, verify actual WebAuthn signature
        if (signature.length == 0) {
            revert InvalidSignature();
        }

        return true;
    }

    function verifyUserOperation(
        bytes32 pubKeyHash,
        bytes calldata signature,
        bytes calldata authenticatorData,
        bytes calldata clientDataJSON,
        bytes32 userOpHash
    ) external pure returns (bool) {
        // Verify authenticator data
        if (!_verifyAuthenticatorData(authenticatorData)) {
            revert InvalidAuthenticatorData();
        }

        // Verify client data
        if (!_verifyClientData(clientDataJSON)) {
            revert InvalidClientData();
        }

        // Create message hash
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                pubKeyHash,
                userOpHash,
                authenticatorData,
                clientDataJSON
            )
        );

        // For demo purposes, accept any non-zero signature
        // In production, verify actual WebAuthn signature
        if (signature.length == 0) {
            revert InvalidSignature();
        }

        return true;
    }

    // ============ Internal Functions ============
    function _verifyAuthenticatorData(
        bytes calldata authenticatorData
    ) internal pure returns (bool) {
        // Verify authenticator data structure
        // In production, verify flags, extensions, etc.
        if (authenticatorData.length < 37) {
            return false;
        }

        // Check for user presence flag
        uint8 flags = uint8(authenticatorData[32]);
        if ((flags & 0x01) == 0) {
            return false;
        }

        return true;
    }

    function _verifyClientData(
        bytes calldata clientDataJSON
    ) internal pure returns (bool) {
        // Verify client data JSON structure
        // In production, parse JSON and verify challenge, origin, etc.
        if (clientDataJSON.length < 10) {
            return false;
        }

        // Check for required fields (simplified)
        string memory data = string(clientDataJSON);
        if (bytes(data).length == 0) {
            return false;
        }

        return true;
    }

    // ============ Utility Functions ============
    function getPubKeyHash(
        bytes calldata pubKeyBytes
    ) external pure returns (bytes32) {
        return keccak256(pubKeyBytes);
    }

    function verifyChallenge(
        bytes32 challenge,
        bytes calldata clientDataJSON
    ) external pure returns (bool) {
        // Verify challenge in client data
        // In production, parse JSON and verify challenge matches
        if (clientDataJSON.length == 0) {
            return false;
        }

        return true;
    }
}
