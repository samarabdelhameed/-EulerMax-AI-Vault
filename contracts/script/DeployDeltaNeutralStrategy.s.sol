// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {DeltaNeutralStrategy} from "../src/DeltaNeutralStrategy.sol";

contract DeployDeltaNeutralStrategy is Script {
    function setUp() public {}

    function run() public {
        // تحميل المتغيرات من .env
        address usdc = vm.envAddress("USDC");
        address weth = vm.envAddress("WETH");
        address aaveLendingPool = vm.envAddress("AAVE_LENDING_POOL");
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        DeltaNeutralStrategy strategy = new DeltaNeutralStrategy(
            usdc,
            weth,
            aaveLendingPool
        );
        vm.stopBroadcast();

        console2.log("DeltaNeutralStrategy deployed at:", address(strategy));
    }
}
