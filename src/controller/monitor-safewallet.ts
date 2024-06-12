import { utils, Wallet, providers } from 'ethers'
import { gasPriceToGwei } from '../lib/converter.lib'
require('dotenv').config()

const { formatEther } = utils

const SAFE_WALLET = process.env.SAFE_WALLET as string
const RPC_URL = process.env.RPC_URL as string
const provider = new providers.JsonRpcProvider(RPC_URL)
const thresholdToTransfer = '0.01'

if (!SAFE_WALLET || !RPC_URL) {
  throw new Error(
    'SAFE_WALLET and RPC_URL must be set in the environment variables.'
  )
}

console.log('Safe address: ', SAFE_WALLET)

export const monitoringAndSafe = async (burnWallet: Wallet) => {
  try {
    const threshold = utils.parseEther(thresholdToTransfer)
    const balance = await burnWallet.getBalance()
    if (balance.isZero()) {
      console.log('Balance is zero')
      return
    }

    const gasPrice = await provider.getGasPrice()
    const gasLimit = 21000

    console.log(`Gas price: ${gasPriceToGwei(gasPrice)} gwei`)

    const gasCost = gasPrice.mul(gasLimit).mul(12).div(10)

    if (balance.lt(gasCost)) {
      console.log(
        `Insufficient funds for gas (balance=${formatEther(
          balance
        )} ETH, gasCost=${formatEther(gasCost)} ETH)`
      )
      return
    }

    if (balance.gt(threshold)) {
      const safeValue = balance.sub(gasCost)
      console.log(`safeValue: ${formatEther(safeValue)} ETH`)

      try {
        console.log(`Burning ${formatEther(balance)}`)
        const nonce = await provider.getTransactionCount(
          burnWallet.address,
          'latest'
        )
        console.log(`nonce ${nonce}`)
        const tx = await burnWallet.sendTransaction({
          to: SAFE_WALLET,
          gasLimit,
          gasPrice,
          nonce,
          value: safeValue,
        })
        console.log(
          `Sent tx with nonce ${tx.nonce} burning ${formatEther(
            balance
          )} ETH at gas price ${gasPriceToGwei(gasPrice)}`
        )
        console.log(
          `Beer fund balance: ${
            SAFE_WALLET && formatEther(await provider.getBalance(SAFE_WALLET))
          } ETH`
        )
      } catch (err: any) {
        console.log(`Error sending tx: ${err.message ?? err}`)
      }
    } else {
      console.log(
        `Balance is below threshold: ${utils.formatEther(balance)} ETH`
      )
    }
  } catch (error) {
    console.error('Error in monitoringAndSafe function:', error)
  }
}
