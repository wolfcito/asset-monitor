import 'log-timestamp'
import { providers, Wallet } from 'ethers'
import { monitoringAndSafe } from './controller/monitor-safewallet'

require('dotenv').config()

const RPC_URL = process.env.RPC_URL as string
const COMPROMISED_PRIVATE_KEY = process.env.COMPROMISED_PRIVATE_KEY as string

if (!RPC_URL || !COMPROMISED_PRIVATE_KEY) {
  throw new Error(
    'RPC_URL and COMPROMISED_PRIVATE_KEY must be set in the environment variables.'
  )
}

async function main() {
  try {
    console.log(`Connecting to ${RPC_URL}`)
    const provider = new providers.JsonRpcProvider(RPC_URL)
    const burnWallet = new Wallet(COMPROMISED_PRIVATE_KEY, provider)
    await provider.ready

    console.log('Compromised address: ', burnWallet.address)

    provider.on('block', async (blockNumber) => {
      console.log(`[BLOCK ${blockNumber}]`)
      await monitoringAndSafe(burnWallet)
    })
  } catch (error) {
    console.error('Error in main function:', error)
  }
}

main()

export default {}
