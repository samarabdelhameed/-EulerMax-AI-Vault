// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import "../src/DeltaNeutralStrategy.sol";

contract DeployDeltaNeutralStrategy is Script {
    // ============ Sepolia Testnet Addresses ============
    address constant AAVE_LENDING_POOL =
        0x4F3eAb9c71a4193E9057A2d8b76e36F64f86e7B7;
    address constant USDC = 0x0FA8781a83E46826621b3BC094Ea2A0212e71B23;
    address constant WETH = 0xc778417E063141139Fce010982780140Aa0cD5Ab;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy DeltaNeutralStrategy
        DeltaNeutralStrategy strategy = new DeltaNeutralStrategy(
            USDC,
            WETH,
            AAVE_LENDING_POOL
        );

        vm.stopBroadcast();

        console.log("DeltaNeutralStrategy deployed at:", address(strategy));
        console.log("USDC address:", USDC);
        console.log("WETH address:", WETH);
        console.log("Aave LendingPool address:", AAVE_LENDING_POOL);
        console.log("Owner:", strategy.owner());
    }
}
