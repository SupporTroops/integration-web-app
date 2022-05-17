import { useEffect, useState } from "react";
import { createCampaign, endCampaign, donateToCampaign, sendEther } from "../api/crowdfund";
import { useCrowdFundContext } from "../contexts/CrowdFund";
import { useWeb3Context } from "../contexts/Web3";


function CrowdFund() {
    const { state: { web3, account } } = useWeb3Context();
    const { state } = useCrowdFundContext();

    async function createCamp() {
        await createCampaign(web3, account);
    }
    async function endCamp() {
        const data = await endCampaign(web3, account, state.campaigns[0].address, "test");
        // end_campaign(data);
    }
    async function donateCampaign() {
        const data = await donateToCampaign(web3, account, state.campaigns[0].address, "ETH", 10**10);
        // const data = await sendEther(web3, account, state.campaigns[0].address, "ETH", 10**7);
    }
    useEffect(() => {
        
    })
    return <div>
        <pre>{JSON.stringify(state, null, 4)}</pre>;
        <button onClick={createCamp}>create campaign</button>
        <button onClick={endCamp}>end campaign</button>
        <button onClick={donateCampaign}>donate campaign</button>
        </div>
}

export default CrowdFund;