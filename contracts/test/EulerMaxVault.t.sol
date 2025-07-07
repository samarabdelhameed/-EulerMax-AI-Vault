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
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
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
        require(balanceOf[sender] >= amount, "Insufficient balance");
        require(
            allowance[sender][msg.sender] >= amount,
            "Insufficient allowance"
        );
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

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);

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

    function testSetEulerSwapSetsAddress() public {
        address dummySwap = address(0xBEEF);
        vault.setEulerSwap(dummySwap);
        assertEq(
            address(vault.eulerSwap()),
            dummySwap,
            "eulerSwap address not set correctly"
        );
    }

    function testQuoteSwapRevertsIfNotSet() public {
        address tokenIn = address(0x1);
        address tokenOut = address(0x2);
        uint256 amount = 1e18;
        bool exactIn = true;
        vm.expectRevert(bytes("EulerSwap not set"));
        vault.quoteSwap(tokenIn, tokenOut, amount, exactIn);
    }

    function testExecuteSwapRevertsIfNotSet() public {
        vm.expectRevert(bytes("EulerSwap not set"));
        vault.executeSwap(0, 0, address(this), "");
    }

    function testQuoteAndExecuteSwapWithDummyAddress() public {
        address dummySwap = address(0xBEEF);
        vault.setEulerSwap(dummySwap);
        // Should revert because dummy address has no computeQuote function
        vm.expectRevert();
        vault.quoteSwap(address(0x1), address(0x2), 1e18, true);
        // Should revert because dummy address has no executeSwap function
        vm.expectRevert();
        vault.executeSwap(0, 0, address(this), "");
    }

    function testOnlyOwnerSetEulerSwap() public {
        address dummySwap = address(0xBEEF);
        address notOwner = address(0xBAD);
        vm.startPrank(notOwner);
        vm.expectRevert(); // Updated to use generic revert for OwnableUnauthorizedAccount
        vault.setEulerSwap(dummySwap);
        vm.stopPrank();
    }

    function testOnlyOwnerExecuteSwap() public {
        address dummySwap = address(0xBEEF);
        vault.setEulerSwap(dummySwap);
        address notOwner = address(0xBAD);
        vm.startPrank(notOwner);
        vm.expectRevert(); // Updated to use generic revert for OwnableUnauthorizedAccount
        vault.executeSwap(0, 0, address(this), "");
        vm.stopPrank();
    }

    function testDepositZeroReverts() public {
        vm.expectRevert();
        vault.deposit(0);
    }

    function testWithdrawMoreThanBalanceReverts() public {
        address testUser = address(0x123);
        // Mint tokens for testUser
        token.mint(testUser, 10 ether);
        vm.startPrank(testUser);
        token.approve(address(vault), 10 ether);
        vault.deposit(1e18);
        vm.expectRevert();
        vault.withdraw(2e18);
        vm.stopPrank();
    }

    function testDepositEmitsEvent() public {
        uint256 amount = 1e18;
        address testUser = address(0x123);
        // Mint tokens for testUser
        token.mint(testUser, 10 ether);
        vm.startPrank(testUser);
        token.approve(address(vault), 10 ether);
        vm.expectEmit(true, true, false, true);
        emit Deposited(testUser, amount, amount); // assuming shares = amount for test simplicity
        vault.deposit(amount);
        vm.stopPrank();
    }

    function testWithdrawEmitsEvent() public {
        uint256 amount = 1e18;
        address testUser = address(0x123);
        // Mint tokens for testUser
        token.mint(testUser, 10 ether);
        vm.startPrank(testUser);
        token.approve(address(vault), 10 ether);
        vault.deposit(amount);
        vm.expectEmit(true, true, false, true);
        emit Withdrawn(testUser, amount, amount); // assuming shares = amount for test simplicity
        vault.withdraw(amount);
        vm.stopPrank();
    }
}
