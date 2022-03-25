import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
// import "hardhat-gas-reporter";
import "solidity-coverage";

import * as fs from 'fs';
// dotenv.config({ path: __dirname+'/.env' });

const privateKeyPath = './generated/PrivateKey.secret';
const getPrivateKey = (): string[] => {
  try {
    return fs.readFileSync(privateKeyPath).toString().trim().split("\n");
  } catch (e) {
    if (process.env.HARDHAT_TARGET_NETWORK !== 'localhost') {
      console.log('☢️ WARNING: No PrivateKey file created for a deploy account. Try `yarn run generate` and then `yarn run account`.');
    }
  }
  return [''];
};

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: process.env.rinkebyRPC, // <---- YOUR INFURA ID! (or it won't work)
      accounts: getPrivateKey(),
    },
    rinkebyArbitrum: {
      url: "https://rinkeby.arbitrum.io/rpc",
      accounts: getPrivateKey()
    },
    kovanOptimism: {
      url: "https://kovan.optimism.io",
      accounts: getPrivateKey()
    }
  },
  // gasReporter: {
  //   enabled: process.env.REPORT_GAS !== undefined,
  //   currency: "USD",
  // },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
