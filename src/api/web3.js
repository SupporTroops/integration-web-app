import Web3 from "web3";

export async function unlockAccount() {
    const { ethereum } = window;
    if (!ethereum) {
        throw new Error("Web3 not found");
    }

    const web3 = new Web3(ethereum);
    await ethereum.enable();

    const accounts = await web3.eth.getAccounts();

    return { web3, account: accounts[0] || ""};
}

export function subscribeToAccount(web3, callback) {
  const id = setInterval(async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      callback(null, accounts[0]);
    } catch (error) {
      callback(error, null);
    }
  }, 1000);

  return () => {
    clearInterval(id);
  };
}

export function subscribeToNetId(web3, callback) {
    const id = setInterval(async () => {
      try {
        const netId = await web3.eth.net.getId();
        callback(null, netId);
      } catch (error) {
        callback(error, null);
      }
    }, 1000);
  
    return () => {
      clearInterval(id);
    };
}