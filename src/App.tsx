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
      address: '0x34bE7f35132E97915633BC1fc020364EA5134863',
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
