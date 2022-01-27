import { ethers } from "hardhat";
import Debug from "debug";
import fs from "fs/promises";

const debug = Debug("HB:deployment");

async function deploy(network: string) {
  const signers = await ethers.getSigners();

  const math = await ethers.getContractFactory("Math");
  const Math = await math.deploy();
  const _contract = await Math.deployed();
  debug("HB:Math Deployed At : ", _contract.address);

  const erc20 = await ethers.getContractFactory("Token");
  const ERC20 = await erc20.deploy("test", "tst");
  const ERC20_contract = await ERC20.deployed();
  debug("HB:ERC20 Token Deployed At : ", ERC20_contract.address);

  // Save Output
  const app_output = {
    HB: {
      Network: network,
      MathContractAddress: _contract.address,
      TokenContractAddress: ERC20_contract.address,
      DeployedBy: signers[0].address,
    },
  };

  let deploymentString = JSON.stringify(app_output, null, 4);
  await fs.writeFile(`deployments/HB.${network}.json`, deploymentString);
  return { _contract, signers , ERC20_contract};
}

export { deploy };
