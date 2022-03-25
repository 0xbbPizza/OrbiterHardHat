//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract OBSource {

    event txLog(address from , address index to ,uint256 amout, bytes ext);

    function transfer(address payable _to , bytes calldata _ext) public payable {
        (bool sent, ) = _to.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
        emit txLog(msg.sender,_to, msg.value , _ext);
    }
}
