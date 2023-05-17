//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract OBAggregator is ReentrancyGuard, Context {
    function aggregate(
        address payable[] memory tos,
        uint[] memory values
    ) public payable nonReentrant {
        require(tos.length == values.length, "Length mismatch");

        for (uint i = 0; i < tos.length; i++) {
            (bool sent, ) = tos[i].call{value: values[i]}("");
            require(sent, "ERROR");
        }
    }

    function aggregateERC20(
        IERC20 _token,
        address _to,
        uint256 _amount,
        bytes calldata _ext
    ) external nonReentrant {
        bool sent = _token.transferFrom(msg.sender, _to, _amount);
        require(sent, "ERROR");
    }
}
