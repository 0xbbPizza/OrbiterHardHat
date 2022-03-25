import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, Contract} from "ethers";

describe("Greeter", function () {
  let greeter : Contract;
  let accounts: Signer[];

  it("test sent", async function () {
    /*
    https://stackoverflow.com/questions/68198724/how-would-i-send-an-eth-value-to-specific-smart-contract-function-that-is-payabl
    https://blog.openzeppelin.com/reentrancy-after-istanbul/
    https://docs.openzeppelin.com/contracts/2.x/api/payment
    https://solidity-by-example.org/sending-ether/
    */

    const OBSource = await ethers.getContractFactory("OBSource");
    greeter = await OBSource.deploy();
    await greeter.deployed();

    accounts = await ethers.getSigners()

    const options = {value: ethers.utils.parseEther("1.0")}
    let userAddress = await accounts[1].getAddress()


    await greeter.transfer(userAddress, ethers.utils.hexValue([ 1, 2 ,3]) , options)

    console.log(await ethers.provider.getBalance(accounts[0].getAddress()))

    console.log(await ethers.provider.getBalance(greeter.address))
    
    // Look up the balance
    let balance = await ethers.provider.getBalance(userAddress);
    console.log(balance);

  });
});

