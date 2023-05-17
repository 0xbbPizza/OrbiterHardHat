//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OBAggregator is ReentrancyGuard {
    function aggregate(
        address payable[] calldata tos,
        uint[] calldata amounts
    ) public payable nonReentrant {
        require(tos.length == amounts.length, "LM");

        uint256 totalAmount = 0;
        for (uint i = 0; i < tos.length; ) {
            (bool sent, ) = tos[i].call{value: amounts[i]}("");
            require(sent, "SE");

            unchecked {
                totalAmount += amounts[i];
                i++;
            }
        }

        require(totalAmount == msg.value, "AE");
    }

    // function aggregateERC20(
    //     IERC20 token,
    //     address to,
    //     uint256 amount,
    //     bytes calldata ext
    // ) external nonReentrant {
    //     bool sent = _token.transferFrom(msg.sender, _to, _amount);
    //     require(sent, "ERROR");
    // }
}
