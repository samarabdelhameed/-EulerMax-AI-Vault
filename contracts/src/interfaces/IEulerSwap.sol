// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IEulerSwap {
    struct Params {
        address vault0;
        address vault1;
        address eulerAccount;
        uint112 equilibriumReserve0;
        uint112 equilibriumReserve1;
        uint256 priceX;
        uint256 priceY;
        uint256 concentrationX;
        uint256 concentrationY;
        uint256 fee;
        uint256 protocolFee;
        address protocolFeeRecipient;
    }

    struct InitialState {
        uint112 currReserve0;
        uint112 currReserve1;
    }

    function activate(InitialState calldata initialState) external;

    function getParams() external view returns (Params memory);

    function getAssets() external view returns (address asset0, address asset1);

    function getReserves()
        external
        view
        returns (uint112 reserve0, uint112 reserve1, uint32 status);

    function computeQuote(
        address tokenIn,
        address tokenOut,
        uint256 amount,
        bool exactIn
    ) external view returns (uint256);

    function getLimits(
        address tokenIn,
        address tokenOut
    ) external view returns (uint256 limitIn, uint256 limitOut);

    function swap(
        uint256 amount0Out,
        uint256 amount1Out,
        address to,
        bytes calldata data
    ) external;
}
