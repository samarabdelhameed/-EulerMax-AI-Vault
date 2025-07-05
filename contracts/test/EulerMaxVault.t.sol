// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/EulerMaxVault.sol";
import "src/interfaces/IEulerLending.sol";
import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

// Mock ERC20 for testing
contract MockERC20 is IERC20 {
    string public name = "TestToken";
    string public symbol = "TT";
    uint8 public decimals = 18;
    uint256 public override totalSupply;
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    function transfer(
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        return true;
    }

    function approve(
        address spender,
        uint256 amount
    ) public override returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        return true;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }
}

// Mock IEulerLending
contract MockEulerLending is IEulerLending {
    mapping(address => uint256) public supplied;
    uint256 public fakeAPY = 500; // 5.00%

    function deposit(address asset, uint256 amount) external override {
        supplied[asset] += amount;
    }

    function withdraw(address asset, uint256 amount) external override {
        supplied[asset] -= amount;
    }

    function getAPY(address) external view override returns (uint256) {
        return fakeAPY;
    }

    function getTotalSupplied(
        address asset
    ) external view override returns (uint256) {
        return supplied[asset];
    }
}

contract EulerMaxVaultTest is Test {
    EulerMaxVault vault;
    MockERC20 token;
    MockEulerLending euler;

    address user = address(0x1);

    function setUp() public {
        token = new MockERC20();
        euler = new MockEulerLending();
        vault = new EulerMaxVault(
            address(token),
            address(euler),
            address(this)
        );

        token.mint(user, 1000 ether);
        vm.prank(user);
        token.approve(address(vault), 1000 ether);
    }

    function testDepositAndWithdraw() public {
        vm.startPrank(user);

        vault.deposit(500 ether);
        assertEq(vault.balanceOf(user), 500 ether);

        vault.withdraw(200 ether);
        assertEq(vault.balanceOf(user), 300 ether);

        vm.stopPrank();
    }

    function testAPYandSupply() public {
        vm.startPrank(user);
        vault.deposit(100 ether);
        vm.stopPrank();

        assertEq(vault.vaultAPY(), 500);
        assertEq(vault.totalSupplied(), 100 ether);
    }
}
