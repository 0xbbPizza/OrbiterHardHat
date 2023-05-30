//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract OBAggregator is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    function widthdraw(uint256 amount) public {
        (bool sent, ) = owner().call{value: amount}("");
        require(sent, "ST");
    }

    function widthdrawERC20(address token, uint256 amount) public {
        IERC20(token).safeTransfer(owner(), amount);
    }

    function aggregate(
        address[] calldata tos,
        uint[] calldata amounts,
        address[] calldata tokens
    ) public payable nonReentrant {
        require(tos.length == amounts.length, "LM");
        uint256 tokensLength = tokens.length;

        uint256 totalETH = 0;
        for (uint i = 0; i < tos.length; ) {
            if (i >= tokensLength || tokens[i] == address(0)) {
                (bool sent, ) = tos[i].call{value: amounts[i]}("");
                require(sent, "ST");

                unchecked {
                    totalETH += amounts[i];
                }
            } else {
                IERC20(tokens[i]).safeTransferFrom(
                    msg.sender,
                    tos[i],
                    amounts[i]
                );
            }

            unchecked {
                i++;
            }
        }

        require(totalETH == msg.value, "TEV");
    }

    function aggregateETH(
        address[] calldata tos,
        uint[] calldata amounts
    ) public payable nonReentrant {
        require(tos.length == amounts.length, "LM");

        uint256 totalETH = 0;
        for (uint i = 0; i < tos.length; ) {
            (bool sent, ) = tos[i].call{value: amounts[i]}("");
            require(sent, "ST");

            unchecked {
                totalETH += amounts[i];
                i++;
            }
        }

        require(totalETH == msg.value, "TEV");
    }

    function aggregateERC20(
        address[] calldata tos,
        uint[] calldata amounts,
        address[] calldata tokens
    ) public payable nonReentrant {
        require(tos.length == amounts.length, "LM1");
        require(tos.length == tokens.length, "LM2");

        for (uint i = 0; i < tos.length; ) {
            IERC20(tokens[i]).safeTransferFrom(msg.sender, tos[i], amounts[i]);

            unchecked {
                i++;
            }
        }
    }

    function aggregateOneERC20(
        address[] calldata tos,
        uint[] calldata amounts,
        address token
    ) public payable nonReentrant {
        require(tos.length == amounts.length, "LM1");

        for (uint i = 0; i < tos.length; ) {
            IERC20(token).safeTransferFrom(msg.sender, tos[i], amounts[i]);

            unchecked {
                i++;
            }
        }
    }
}
