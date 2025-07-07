// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "../lib/forge-std/src/Script.sol";
import {EulerMaxVault} from "../src/EulerMaxVault.sol";

contract TestVaultFunctions is Script {
    EulerMaxVault vault;

    function setUp() public {
        // Deployed contract address on Sepolia
        vault = EulerMaxVault(0x3c9c14a184946642af10b09890a01fadbd874502);
    }

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(deployerPrivateKey);

        console2.log("Testing EulerMaxVault functions");
        console2.log("Address:", address(vault));
        console2.log("Owner:", owner);

        // Test reading data
        testReadFunctions();

        // Test functions (if we have balance)
        testWriteFunctions();
    }

    function testReadFunctions() public view {
        console2.log("\nReading functions test:");

        try vault.owner() returns (address owner) {
            console2.log("SUCCESS - Owner:", owner);
        } catch {
            console2.log("FAILED - Reading owner");
        }

        try vault.asset() returns (address asset) {
            console2.log("SUCCESS - Asset:", asset);
        } catch {
            console2.log("FAILED - Reading asset");
        }

        try vault.euler() returns (address euler) {
            console2.log("SUCCESS - Euler Lending:", euler);
        } catch {
            console2.log("FAILED - Reading Euler Lending");
        }

        try vault.eulerSwap() returns (address swap) {
            console2.log("SUCCESS - Euler Swap:", swap);
        } catch {
            console2.log("FAILED - Reading Euler Swap");
        }

        try vault.totalSupplied() returns (uint256 total) {
            console2.log("SUCCESS - Total Supplied:", total);
        } catch {
            console2.log("FAILED - Reading total supplied");
        }

        try vault.vaultAPY() returns (uint256 apy) {
            console2.log("SUCCESS - APY:", apy);
        } catch {
            console2.log("FAILED - Reading APY");
        }
    }

    function testWriteFunctions() public {
        console2.log("\nWriting functions test:");

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Test setting EulerSwap
        address dummySwap = address(0xBEEF);
        vm.startBroadcast(deployerPrivateKey);

        try vault.setEulerSwap(dummySwap) {
            console2.log("SUCCESS - Set EulerSwap");
        } catch {
            console2.log("FAILED - Setting EulerSwap");
        }

        vm.stopBroadcast();
    }
}
