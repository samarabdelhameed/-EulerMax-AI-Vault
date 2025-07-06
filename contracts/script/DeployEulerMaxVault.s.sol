// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {EulerMaxVault} from "../src/EulerMaxVault.sol";

contract DeployEulerMaxVault is Script {
    function setUp() public {}

    function run() public {
        // تحميل المتغيرات من .env
        address usdc = vm.envAddress("USDC");
        address euler = vm.envAddress("EULER"); // عقد الإقراض أو الاستراتيجية
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);
        EulerMaxVault vault = new EulerMaxVault(usdc, euler, owner);
        vm.stopBroadcast();

        console2.log("EulerMaxVault deployed at:", address(vault));
    }
}
