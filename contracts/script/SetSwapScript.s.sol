// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../lib/forge-std/src/Script.sol";
import "../src/EulerMaxVault.sol";

contract SetSwapScript is Script {
    EulerMaxVault public vault =
        EulerMaxVault(0x3C9c14a184946642Af10b09890A01fadbD874502);

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Try to set EulerSwap to a dummy address
        vault.setEulerSwap(0xecBe79DedF2Be46E9E2aB803dBF4184245d6cf66);

        vm.stopBroadcast();

        console2.log("EulerSwap set successfully!");
    }
}
