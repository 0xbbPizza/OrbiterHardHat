import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, BigNumberish, utils } from "ethers";
import { ethers } from "hardhat";
import { OBAggregator, OBAggregator__factory } from "../typechain";
import { expect } from "chai";

describe("OBAggregator", function () {
  let obAggregator: OBAggregator;
  let signers: SignerWithAddress[];

  before(async function () {
    signers = await ethers.getSigners();

    obAggregator = await new OBAggregator__factory(signers[0]).deploy();
    await obAggregator.deployed();
  });

  it("Test aggregate", async function () {
    const sender = signers[1];

    const beforeSenderBalance = await sender.getBalance();
    console.log("BeforeBalance of sender:", beforeSenderBalance);

    const toSigners: SignerWithAddress[] = [];
    const amounts: BigNumberish[] = [];
    const beforeBalances: BigNumberish[] = [];

    let totalAmount = BigNumber.from(0);
    for (let i = 2; i <= 12; i++) {
      toSigners.push(signers[i]);

      const amount = utils.parseEther(1 * i + "");
      amounts.push(amount);
      totalAmount = totalAmount.add(amount);

      beforeBalances.push(await signers[i].getBalance());
    }

    const transaction = await obAggregator.connect(sender).aggregate(
      toSigners.map((signer) => signer.address),
      amounts,
      {
        value: totalAmount,
      }
    );
    console.log("Hash of transaction:", transaction.hash);
    await transaction.wait();

    for (const i in toSigners) {
      const afterBalance = await toSigners[i].getBalance();
      expect(afterBalance.sub(beforeBalances[i]).toString()).to.be.equal(
        amounts[i].toString()
      );
    }

    const receipt = await sender.provider!.getTransactionReceipt(
      transaction.hash
    );
    console.log("GasUsed of transaction.:", receipt.gasUsed);
    console.log("EffectiveGasPrice of transaction:", receipt.effectiveGasPrice);

    const afterSenderBalance = await sender.getBalance();
    expect(
      beforeSenderBalance
        .sub(afterSenderBalance)
        .sub(receipt.gasUsed.mul(receipt.effectiveGasPrice))
        .toString()
    ).to.be.equal(totalAmount.toString());
  });
});
