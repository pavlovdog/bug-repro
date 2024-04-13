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
const PAYMASTER = 'https://rpc.zerodev.app/api/v2/paymaster/dace5c43-5268-4c22-a4e6-e2e76e5728f5'
const BUNDLER = 'https://rpc.zerodev.app/api/v2/bundler/dace5c43-5268-4c22-a4e6-e2e76e5728f5'
const privateKey = '0xedfc5e75503984da574bf4c6cd4e8dbf28c4ae57c34482b41375c548b2323ab1';

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
        console.log('sponsoring');
        console.log(userOperation);
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

