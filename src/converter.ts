import { BigNumber } from '@ethersproject/bignumber'

const GWEI = BigNumber.from(1e9)

/**
 * Returns human-readable gas price in gwei.
 * @param gasPrice - The gas price as a BigNumber in wei.
 * @returns The gas price in gwei as a number.
 */
export const gasPriceToGwei = (gasPrice: BigNumber): number => {
  return gasPrice.mul(100).div(GWEI).toNumber() / 100
}
