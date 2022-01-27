import { solidity } from "ethereum-waffle";
import { expect, use } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deploy } from "../scripts/deployer";
import { Contract } from "ethers";
import { getTokensAmount, getZeroAddress } from "./utils/utils";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import Debug from "debug";

const debug = Debug("HB:test");

use(solidity);

describe("HB Tests", async () => {

  let contract: Contract;
  let TokenContract: Contract;
  let user: SignerWithAddress;
  let owner: SignerWithAddress;
  let deployment: any;

  const tokens = getTokensAmount(); // returns 10**18 ~ 1eth
  const secInDay = BigNumber.from(86400); // 1 day in seconds

  async function advanceTime(delay: number) {
    await ethers.provider.send("evm_increaseTime", [delay]); // increases evm block time
  }

  before(async () => {
    deployment = await deploy("local");
    contract = deployment!._contract;
    TokenContract = deployment!.ERC20_contract;

    owner = deployment.signers[0];
    user = deployment.signers[1];

    console.log(contract.address)
  });

  describe("Test SQRT ", () => {
    it("Test fixed : perfect numbers", async () => {
      const val = await contract!.sqrt(4);
      const val2 = await contract!.sqrt(16);

      expect(val).to.equal(2);
      expect(val2).to.equal(4);
    });

    it("Test fixed : non-perfect", async () => {
      const val = await contract!.sqrtFloating(5);
      expect(val.toString()).to.equal("2236067977");
    });
  });

  describe("Test Token contract ", () => {
    it("Test Transfer : perfect numbers", async () => {
      
      // tokens to send
      const totalTokens = tokens.mul(100);

      // capture states
      const OwnerBalance = await TokenContract!.balanceOf(owner!.address);
      const totalSupply = await TokenContract!.totalSupply();

      await TokenContract!.transfer(user!.address, totalTokens);

      const OwnerBalance1 = await TokenContract!.balanceOf(owner!.address);
      const userBalance1 = await TokenContract!.balanceOf(user!.address);
      const ContractBalance1 = await TokenContract!.balanceOf(TokenContract!.address);
      const totalSupply1 = await TokenContract!.totalSupply();

      const feeAmt = (totalTokens.mul(500)).div(10000)

      expect(OwnerBalance1).to.equal(OwnerBalance.sub(totalTokens));
      expect(userBalance1).to.equal(totalTokens.sub(feeAmt.mul(2)));
      expect(ContractBalance1).to.equal(feeAmt);
      expect(totalSupply1).to.equal(totalSupply.sub(feeAmt));

    });

  });
});

// sqrt of 5 ~ 2.23606797749978