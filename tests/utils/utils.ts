import { BigNumber, utils } from "ethers";

function getTokensAmount(units: number = 1, decimals: number = 18) {
  const oneToken = utils.parseUnits("1", decimals);
  const bag = BigNumber.from(units);
  const tokens = oneToken.mul(bag);
  return tokens;
}

function parseAmount(value: any) {
  return parseInt(String(value)) / 1e18;
}

function getZeroAddress() {
  return "0x0000000000000000000000000000000000000000";
}

export { getTokensAmount, parseAmount, getZeroAddress };
