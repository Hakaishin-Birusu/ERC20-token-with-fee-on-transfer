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

    console.log(contract.address);
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
    it("Test Transfer", async () => {
      // tokens to send
      const totalTokens = tokens.mul(100);

      // capture states
      const OwnerBalance = await TokenContract!.balanceOf(owner!.address);
      const totalSupply = await TokenContract!.totalSupply();

      // transfer tokens
      await TokenContract!.transfer(user!.address, totalTokens);

      // capture after state
      const OwnerBalanceNew = await TokenContract!.balanceOf(owner!.address);
      const userBalanceNew = await TokenContract!.balanceOf(user!.address);
      const ContractBalanceNew = await TokenContract!.balanceOf(
        TokenContract!.address
      );
      const totalSupplyNew = await TokenContract!.totalSupply();

      // Calculate amt
      const feeAmt = totalTokens.mul(500).div(10000);

      // validate state
      expect(OwnerBalanceNew).to.equal(OwnerBalance.sub(totalTokens));
      expect(userBalanceNew).to.equal(totalTokens.sub(feeAmt.mul(2)));
      expect(ContractBalanceNew).to.equal(feeAmt);
      expect(totalSupplyNew).to.equal(totalSupply.sub(feeAmt));
    });

    it("Test TransferFrom", async () => {
      // tokens to send
      const totalTokens = tokens.mul(200);

      // capture states
      const OwnerBalance = await TokenContract!.balanceOf(owner!.address);
      const userBalance = await TokenContract!.balanceOf(user!.address);
      const ContractBalance = await TokenContract!.balanceOf(
        TokenContract!.address
      );
      const totalSupply = await TokenContract!.totalSupply();

      // Approve
      await TokenContract!.approve(user!.address, totalTokens);

      // check approval
      const allowance = await TokenContract!.allowance(
        owner!.address,
        user!.address
      );
      expect(allowance).to.equal(totalTokens);

      // transfer tokens
      await TokenContract!
        .connect(user!)
        .transferFrom(owner!.address, user!.address, totalTokens);

      // capture after state
      const OwnerBalanceNew = await TokenContract!.balanceOf(owner!.address);
      const userBalanceNew = await TokenContract!.balanceOf(user!.address);
      const ContractBalanceNew = await TokenContract!.balanceOf(
        TokenContract!.address
      );
      const totalSupplyNew = await TokenContract!.totalSupply();
      const allowanceNew = await TokenContract!.allowance(
        owner!.address,
        user!.address
      );

      // Calculate amt
      const feeAmt = totalTokens.mul(500).div(10000);

      // validate state
      expect(OwnerBalanceNew).to.equal(OwnerBalance.sub(totalTokens));
      expect(userBalanceNew).to.equal(
        userBalance.add(totalTokens.sub(feeAmt.mul(2)))
      );
      expect(ContractBalanceNew).to.equal(ContractBalance.add(feeAmt));
      expect(totalSupplyNew).to.equal(totalSupply.sub(feeAmt));
      expect(allowanceNew).to.equal(0);
    });
  });
});

// sqrt of 5 ~ 2.23606797749978
