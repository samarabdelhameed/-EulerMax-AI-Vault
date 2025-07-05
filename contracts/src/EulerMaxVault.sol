// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {IEulerLending} from "./interfaces/IEulerLending.sol";

contract EulerMaxVault is Ownable {
    IERC20 public immutable asset;
    IEulerLending public euler;

    uint256 public totalShares;
    mapping(address => uint256) public userShares;

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);

    constructor(
        address _asset,
        address _euler,
        address initialOwner
    ) Ownable(initialOwner) {
        asset = IERC20(_asset);
        euler = IEulerLending(_euler);
    }

    function setEuler(address _euler) external onlyOwner {
        euler = IEulerLending(_euler);
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Zero deposit");
        asset.transferFrom(msg.sender, address(this), amount);
        asset.approve(address(euler), amount);
        euler.deposit(address(asset), amount);

        uint256 shares = amount; // 1:1 for simplicity
        totalShares += shares;
        userShares[msg.sender] += shares;

        emit Deposited(msg.sender, amount, shares);
    }

    function withdraw(uint256 shares) external {
        require(shares > 0, "Zero shares");
        require(userShares[msg.sender] >= shares, "Insufficient shares");

        uint256 amount = shares; // 1:1 for simplicity
        userShares[msg.sender] -= shares;
        totalShares -= shares;

        euler.withdraw(address(asset), amount);
        asset.transfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount, shares);
    }

    function balanceOf(address user) external view returns (uint256) {
        return userShares[user];
    }

    function vaultAPY() external view returns (uint256) {
        return euler.getAPY(address(asset));
    }

    function totalSupplied() external view returns (uint256) {
        return euler.getTotalSupplied(address(asset));
    }
}
