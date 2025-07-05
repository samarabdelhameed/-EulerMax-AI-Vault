// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "src/EulerMaxVault.sol";
import "src/interfaces/IEulerLending.sol";
import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

// Mock ERC20 for testing
contract TestERC20 is ERC20 {
    constructor() ERC20("Test Token", "TTK") {
        _mint(msg.sender, 1_000_000 ether);
    }
}

// Mock IEulerLending
contract MockEulerLending is IEulerLending {
    uint256 public totalSupplied;
    uint256 public apy;

    function deposit(address, uint256 amount) external override {
        totalSupplied += amount;
    }

    function withdraw(address, uint256 amount) external override {
        require(totalSupplied >= amount, "Not enough supplied");
        totalSupplied -= amount;
    }

    function getAPY(address) external view override returns (uint256) {
        return apy;
    }

    function getTotalSupplied(
        address
    ) external view override returns (uint256) {
        return totalSupplied;
    }

    function setAPY(uint256 _apy) external {
        apy = _apy;
    }
}

contract EulerMaxVaultTest is Test {
    EulerMaxVault public vault;
    TestERC20 public token;
    MockEulerLending public euler;
    address public userA = address(0xA);

    function setUp() public {
        token = new TestERC20();
        euler = new MockEulerLending();
        vault = new EulerMaxVault(address(token), address(euler));
        token.transfer(userA, 1000 ether);
        vm.startPrank(userA);
        token.approve(address(vault), 1000 ether);
        vm.stopPrank();
    }

    function testDepositAndWithdraw() public {
        // User A deposits 100 tokens
        vm.startPrank(userA);
        vault.deposit(100 ether);
        vm.stopPrank();

        // Check shares and balance
        uint256 shares = vault.userShares(userA);
        assertGt(shares, 0);
        assertEq(vault.totalShares(), shares);
        assertEq(vault.balanceOf(userA), shares);

        // User A withdraws 50 tokens
        vm.startPrank(userA);
        vault.withdraw(50 ether);
        vm.stopPrank();

        // Check shares and balance after withdrawal
        uint256 sharesAfter = vault.userShares(userA);
        assertLt(sharesAfter, shares);
        assertEq(vault.totalShares(), sharesAfter);
    }

    function testAPYandTotalSupplied() public {
        euler.setAPY(500); // 5% APY (example)
        assertEq(vault.getVaultAPY(), 500);
        assertEq(vault.getTotalSupplied(), 0);
    }
}
