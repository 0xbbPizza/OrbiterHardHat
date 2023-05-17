import { Contract, Signer, utils } from "ethers";
import { ethers } from "hardhat";

describe("OBSource", function () {
  let obSource: Contract;
  let accounts: Signer[];

  it("test transfer", async function() {
    /*
    https://stackoverflow.com/questions/68198724/how-would-i-send-an-eth-value-to-specific-smart-contract-function-that-is-payabl
    https://blog.openzeppelin.com/reentrancy-after-istanbul/
    https://docs.openzeppelin.com/contracts/2.x/api/payment
    https://solidity-by-example.org/sending-ether/
    */

    const OBSource = await ethers.getContractFactory("OBSource");
    obSource = await OBSource.deploy();
    await obSource.deployed();

    accounts = await ethers.getSigners();

    const options = { value: ethers.utils.parseEther("1.0") };
    let userAddress = await accounts[1].getAddress();

    await obSource.transfer(userAddress, 0x1234, options);

    console.log(await ethers.provider.getBalance(accounts[0].getAddress()));

    console.log(await ethers.provider.getBalance(obSource.address));

    // Look up the balance
    let balance = await ethers.provider.getBalance(userAddress);
    console.log(balance);
  });

  it("test transferERC20", async function() {
    /*
    https://stackoverflow.com/questions/68198724/how-would-i-send-an-eth-value-to-specific-smart-contract-function-that-is-payabl
    https://blog.openzeppelin.com/reentrancy-after-istanbul/
    https://docs.openzeppelin.com/contracts/2.x/api/payment
    https://solidity-by-example.org/sending-ether/
    */

    const OBSource = await ethers.getContractFactory("OBSource");
    obSource = await OBSource.deploy();
    await obSource.deployed();

    accounts = await ethers.getSigners();

    const senderAddress = await accounts[0].getAddress();
    const recipientAddress = await accounts[1].getAddress();
    console.warn(`senderAddress: ${senderAddress}, recipientAddress: ${recipientAddress}`);

    const obErc20 = await (
      await ethers.getContractFactory("OBERC20")
    ).deploy("USDC", "USDC");
    const contract = await obErc20.deployed();

    // Mint
    await obErc20.mint(senderAddress, utils.hexValue(100000000));

    // Approve
    await obErc20.approve(obSource.address, ethers.constants.MaxUint256)

    await obSource.transfer(
      // greeter.address,
      recipientAddress,
      utils.hexValue(10000000),
      // utils.hexValue("0x1234")
    );

    console.log(recipientAddress);
    console.log(await contract.balanceOf(recipientAddress));

    console.log(obSource.address);
    console.log(await contract.balanceOf(obSource.address));

    // Look up the balance
    console.log(senderAddress);
    let balance = await contract.balanceOf(senderAddress);
    console.log(balance);
  });
});
