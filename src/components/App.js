import './App.css';
import { useWeb3Context } from '../contexts/Web3';
import { unlockAccount } from '../api/web3';
import CrowdFund from './Crowdfund';
function App() {

  const { state: { account }, updateAccount } = useWeb3Context();

  async function connectMetamask() {
    try {
      const data = await unlockAccount();
      updateAccount(data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="App">
      Account: {account}
      <br />
      {!account && <button onClick={connectMetamask}>Connect to Metamask</button> }
      <CrowdFund />
    </div>
  );
}

export default App;
