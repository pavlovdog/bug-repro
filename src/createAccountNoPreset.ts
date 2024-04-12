import { polygonAmoy } from "viem/chains"
import {
  createKernelAccount,
  createZeroDevPaymasterClient,
  createKernelAccountClient,
} from "@zerodev/sdk"
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless"
import { privateKeyToAccount } from "viem/accounts"
import { KernelSmartAccount, KernelAccountClient } from '@zerodev/sdk'
import { createPublicClient, http, Transport } from 'viem';

// todo update these values
const PAYMASTER = 'https://rpc.zerodev.app/api/v2/paymaster/{ZERODEV_PROJECT_ID}'
const BUNDLER = 'https://rpc.zerodev.app/api/v2/bundler/{ZERODEV_PROJECT_ID}'
const privateKey = '0x';

const chain = polygonAmoy;

const publicClient = createPublicClient({
  transport: http('https://rpc-amoy.polygon.technology'),
})

const signer = privateKeyToAccount(privateKey)

export const createAccount = async () => {
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  })

  const account = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  })
  console.log("My account:", account.address)

  const kernelClient = createKernelAccountClient({
    account,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain,
    bundlerTransport: http(BUNDLER),
    middleware: {
      sponsorUserOperation: async ({ userOperation }) => {
        const paymasterClient = createZeroDevPaymasterClient({
          chain,
          transport: http(PAYMASTER),
          entryPoint: ENTRYPOINT_ADDRESS_V07,
        })
        return paymasterClient.sponsorUserOperation({
          userOperation,
          entryPoint: ENTRYPOINT_ADDRESS_V07,
        })
      },
    },
  })

  return kernelClient as KernelAccountClient<
    typeof ENTRYPOINT_ADDRESS_V07,
    Transport,
    typeof chain,
    KernelSmartAccount<typeof ENTRYPOINT_ADDRESS_V07>
  >;
}

