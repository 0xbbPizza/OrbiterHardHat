import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Greeter", function () {
  let greeter: Contract;
  let accounts: Signer[];

  it("test transfer", async function () {
    /*
    https://stackoverflow.com/questions/68198724/how-would-i-send-an-eth-value-to-specific-smart-contract-function-that-is-payabl
    https://blog.openzeppelin.com/reentrancy-after-istanbul/
    https://docs.openzeppelin.com/contracts/2.x/api/payment
    https://solidity-by-example.org/sending-ether/
    */

    const OBSource = await ethers.getContractFactory("OBSource");
    greeter = await OBSource.deploy();
    await greeter.deployed();

    accounts = await ethers.getSigners();

    const options = { value: ethers.utils.parseEther("1.0") };
    let userAddress = await accounts[1].getAddress();

    await greeter.transfer(userAddress, 0x1234, options);

    console.log(await ethers.provider.getBalance(accounts[0].getAddress()));

    console.log(await ethers.provider.getBalance(greeter.address));

    // Look up the balance
    let balance = await ethers.provider.getBalance(userAddress);
    console.log(balance);
  });

  it("test transferERC20", async function () {
    /*
    https://stackoverflow.com/questions/68198724/how-would-i-send-an-eth-value-to-specific-smart-contract-function-that-is-payabl
    https://blog.openzeppelin.com/reentrancy-after-istanbul/
    https://docs.openzeppelin.com/contracts/2.x/api/payment
    https://solidity-by-example.org/sending-ether/
    */

    const OBSource = await ethers.getContractFactory("OBSource");
    greeter = await OBSource.deploy();
    await greeter.deployed();

    accounts = await ethers.getSigners();

    let userAddress = await accounts[1].getAddress();

    // await greeter.transferERC20(
    //   _token,
    //   userAddress,
    //   ethers.utils.hexValue(1000000),
    //   ethers.utils.hexValue("0x1234")
    // );

    const greeterErc20 = await (
      await ethers.getContractFactory("ERC20")
    ).deploy("USDC", "USDC");
    const contract = await greeterErc20.deployed();

    console.log(await accounts[0].getAddress());
    console.log(await contract.balanceOf(await accounts[0].getAddress()));

    console.log(greeter.address);
    console.log(await contract.balanceOf(greeter.address));

    // Look up the balance
    console.log(userAddress);
    let balance = await contract.balanceOf(userAddress);
    console.log(balance);
  });
});
