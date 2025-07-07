// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockEuler {
    mapping(address => mapping(address => uint256)) public supplied;

    function deposit(address token, uint256 amount) external {
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        supplied[msg.sender][token] += amount;
    }

    function withdraw(address token, uint256 amount) external {
        require(supplied[msg.sender][token] >= amount, "Insufficient balance");
        supplied[msg.sender][token] -= amount;
        require(IERC20(token).transfer(msg.sender, amount), "Withdraw failed");
    }

    function getTotalSupplied(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}
