//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract OBSource is ReentrancyGuard {
    
    function transfer(address payable _to , bytes calldata _ext) public payable nonReentrant {
        (bool sent, ) = _to.call{value: msg.value}("");
        require(sent, "ERROR");
    }
}
