// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface IEulerLending {
    function deposit(address asset, uint256 amount) external;

    function withdraw(address asset, uint256 amount) external;

    function getAPY(address asset) external view returns (uint256);

    function getTotalSupplied(address asset) external view returns (uint256);
}
