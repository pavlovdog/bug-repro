import { getContract } from 'viem'
import { createPublicClient, http } from 'viem';
import { createAccount } from './createAccountNoPreset'
import './App.css'
import testNFT from './test-nft.json'

const publicClient = createPublicClient({
  transport: http('https://rpc-amoy.polygon.technology')
})

function App() {
  const sendTx = async () => {
    console.log('sending tx')

    const kernelClient = await createAccount();

    const contract = getContract({
      address: '0x8e23e5f1FB745EA7f305D05B2904E5c56ED65b0e',
      abi: testNFT,
      client: {
        public: publicClient,
        wallet: kernelClient
      }
    })

    const hash = await contract.write.mint([kernelClient.account.address])

    console.log("txn hash:", hash)
  }

  return (
    <div className="card">
      <button onClick={sendTx}>
        Send tx
      </button>
    </div>
  )
}

export default App
