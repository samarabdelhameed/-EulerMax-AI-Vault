// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";

contract MintMockUSDC is Script {
    function run() external {
        vm.startBroadcast();
        MockUSDC mock = MockUSDC(0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519);
        mock.mint(msg.sender, 1000 * 10 ** 6); // 1000 mUSDC
        vm.stopBroadcast();
    }
}
