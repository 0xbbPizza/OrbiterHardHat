//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract OBAggregator is ReentrancyGuard, Ownable {
    // solhint-disable-next-line no-empty-blocks
    fallback() external payable {}

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    function widthdraw(uint256 amount) public onlyOwner {
        (bool sent, ) = owner().call{value: amount}("");
        require(sent, "ST");
    }

    function aggregate(
        address[] calldata tos,
        uint[] calldata amounts
    ) public payable nonReentrant {
        require(tos.length == amounts.length, "LM");

        uint256 totalAmount = 0;
        for (uint i = 0; i < tos.length; ) {
            (bool sent, ) = tos[i].call{value: amounts[i]}("");
            require(sent, "ST");

            unchecked {
                totalAmount += amounts[i];
                i++;
            }
        }

        require(totalAmount == msg.value, "TV");
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
