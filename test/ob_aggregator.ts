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

  it("Test aggregate should succed", async function () {
    const sender = signers[1];

    const beforeSenderBalance = await sender.getBalance();
    console.log("BeforeBalance of sender:", beforeSenderBalance);

    const toSigners: SignerWithAddress[] = [];
    const amounts: BigNumberish[] = [];
    const beforeBalances: BigNumberish[] = [];

    let totalAmount = BigNumber.from(0);
    for (let i = 2; i < 12; i++) {
      toSigners.push(signers[i]);

      const amount = utils.parseEther(1 * i + "").div(10000);
      amounts.push(amount);
      totalAmount = totalAmount.add(amount);

      beforeBalances.push(await signers[i].getBalance());
    }
    console.log("Length of toSigners:", toSigners.length);

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

    const balanceOBA = await sender.provider!.getBalance(obAggregator.address);
    expect(balanceOBA.toString()).to.be.equal("0");
  });

  it("Test aggregate should throw 'LM'", async function () {
    const sender = signers[1];

    const toSigners: SignerWithAddress[] = [signers[3]];
    const amounts: BigNumberish[] = [];

    let totalAmount = BigNumber.from(0);
    for (let i = 2; i < 4; i++) {
      const amount = utils.parseEther(1 * i + "").div(10000);
      amounts.push(amount);
      totalAmount = totalAmount.add(amount);
    }

    try {
      await obAggregator
        .connect(sender)
        .aggregate(
          toSigners.map((signer) => signer.address),
          amounts,
          {
            value: totalAmount,
          }
        )
        .then((t) => t.wait());
    } catch (err: any) {
      expect(
        err.message.indexOf("reverted with reason string 'LM'") > -1
      ).to.be.equal(true);
    }
  });

  it("Test aggregate should throw 'ST'", async function () {
    const sender = signers[1];

    const toSigners: SignerWithAddress[] = [];
    const amounts: BigNumberish[] = [];

    let totalAmount = BigNumber.from(0);
    for (let i = 2; i < 4; i++) {
      toSigners.push(signers[i]);
      const amount = utils.parseEther(1 * i + "").div(10000);
      amounts.push(amount);
      totalAmount = totalAmount.add(amount);
    }

    try {
      await obAggregator
        .connect(sender)
        .aggregate(
          toSigners.map((signer) => signer.address),
          amounts,
          {
            value: totalAmount.sub(1),
          }
        )
        .then((t) => t.wait());
    } catch (err: any) {
      expect(
        err.message.indexOf("reverted with reason string 'ST'") > -1
      ).to.be.equal(true);
    }
  });

  it("Test aggregate should throw 'TV'", async function () {
    const sender = signers[1];
    const subAmount = BigNumber.from(100);

    await sender
      .sendTransaction({
        to: obAggregator.address,
        value: subAmount,
      })
      .then((t) => t.wait());

    const toSigners: SignerWithAddress[] = [];
    const amounts: BigNumberish[] = [];

    let totalAmount = BigNumber.from(0);
    for (let i = 2; i < 4; i++) {
      toSigners.push(signers[i]);
      const amount = utils.parseEther(1 * i + "").div(10000);
      amounts.push(amount);
      totalAmount = totalAmount.add(amount);
    }

    try {
      await obAggregator
        .connect(sender)
        .aggregate(
          toSigners.map((signer) => signer.address),
          amounts,
          {
            value: totalAmount.sub(subAmount),
          }
        )
        .then((t) => t.wait());
    } catch (err: any) {
      expect(
        err.message.indexOf("reverted with reason string 'TV'") > -1
      ).to.be.equal(true);
    }
  });

  it("Test owner & withdraw", async function () {
    const owner = await obAggregator.owner();
    expect(owner).to.be.equal(signers[0].address);

    const beforeBalance = await signers[0].provider!.getBalance(
      obAggregator.address
    );

    const value = utils.parseEther("0.0002");
    await signers[0]
      .sendTransaction({ to: obAggregator.address, value })
      .then((t) => t.wait());

    const afterBalance1 = await signers[0].provider!.getBalance(
      obAggregator.address
    );
    expect(beforeBalance.add(value).toString()).to.be.equal(
      afterBalance1.toString()
    );

    // Test not owner witndraw
    try {
      await obAggregator
        .connect(signers[1])
        .widthdraw(afterBalance1)
        .then((t) => t.wait());
    } catch (err: any) {
      expect(
        err.message.indexOf(
          "reverted with reason string 'Ownable: caller is not the owner'"
        ) > -1
      ).to.be.equal(true);
    }

    await obAggregator.widthdraw(afterBalance1).then((t) => t.wait());
    const afterBalance2 = await signers[0].provider!.getBalance(
      obAggregator.address
    );
    expect(afterBalance2.toString()).to.be.equal("0");
  });
});
