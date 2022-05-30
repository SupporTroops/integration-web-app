import Web3 from "web3";
import BN from "bn.js";
import TruffleContract from "@truffle/contract";

import CrowdFundTruffle from "../build/contracts/CrowdFund.json";
import CampaignTruffle from "../build/contracts/Campaign.json";

// 0xDd2EDB40bb012182C057c23c7812058674F5232c
const CrowdFund = TruffleContract(CrowdFundTruffle);
const Campaign = TruffleContract(CampaignTruffle);
/*
    interface vendor {
        address: string;
        amount: BN;
    }

    interface Campaign {
        name: string;
        description: string;
        owner: string;
        type: string;
        amountToRaise: BN;
        vendorList: vendor[];
        amountRaised: BN;
        donorList: vendor;
        isEnded: boolean;
    }
*/

export async function getCrowdFund(web3, account) {
    CrowdFund.setProvider(web3.currentProvider);
  
    const crowdfund = await CrowdFund.deployed();
    return {
      crowdfund_address: crowdfund.address,
      // tokens
    }
}

export async function getCampaigns(web3, account) {
  CrowdFund.setProvider(web3.currentProvider);
  const crowdfund = await CrowdFund.deployed();
  const all_campaigns = await crowdfund.return_all_campaigns();
  let campaigns = []
  for(let address_index in all_campaigns){
    Campaign.setProvider(web3.currentProvider);
    const camp = await Campaign.at(all_campaigns[address_index]);
    const newCampaign =await camp.getCampaignDetails();
    campaigns.push({
      address: all_campaigns[address_index],
      name: newCampaign["0"],
      description: newCampaign["1"],
      owner: newCampaign["2"],
      type: newCampaign["3"],
      amountToRaise: newCampaign["5"].reduce((a,b) => a + b.toNumber()).toString(),
      vendorList: newCampaign["4"].map((address,index) => ( { address, amount: newCampaign["5"][index] } )),
      amountRaised: newCampaign["7"].length > 0 ? newCampaign["7"].reduce((a,b) => a + b.toNumber()).toString() : "0",
      donorList: newCampaign["6"].length > 0 ? newCampaign["6"].map((address,index) => ( { address, amount: newCampaign["7"][index] } )) : [],
      isEnded: newCampaign["8"]
    });
  }
  campaigns = campaigns.filter((v,i,a)=>a.findIndex(v2=>(v2.address===v.address))===i)

  return {
    campaigns
  }
}

export async function createCampaign(web3, account) {
  CrowdFund.setProvider(web3.currentProvider);
  const crowdfund = await CrowdFund.deployed();
  let newCampaign = await crowdfund.create_campaign("campaign name", "campaign description", true, ["0xDd2EDB40bb012182C057c23c7812058674F5232c"], [String(10**18)], { from: account});
  newCampaign = newCampaign.logs[0].args;
  // return {
    // address: newCampaign["1"],
    // name: newCampaign["2"],
    // description: newCampaign["3"],
    // owner: newCampaign["0"],
    // type: newCampaign["4"],
    // amountToRaise: newCampaign["6"].reduce((a,b) => a + b.toNumber()).toString(),
    // vendorList: newCampaign["5"].map((address,index) => ( { address, amount: newCampaign["6"][index] } )),
    // amountRaised: 0,
    // donorList: [],
    // isEnded: false
  // }
}

export async function donateToCampaign(web3, account, campaignAddress, token, amount) {
  CrowdFund.setProvider(web3.currentProvider);
  const crowdfund = await CrowdFund.deployed();
  const donate = await crowdfund.recieveDonations(campaignAddress, token, amount, { from: account, gas: 3000000, value: amount });
  console.log("donate", donate);
}

export async function endCampaign(web3, account, campaignAddress, end_reason) {
  CrowdFund.setProvider(web3.currentProvider);
  const crowdfund = await CrowdFund.deployed();
  const end = await crowdfund.end_campaign(campaignAddress, end_reason, false, { from: account });
  console.log("end camp", end)

}

export function subscribe(
    web3,
    address,
    callback
  ) {
    const crowdFund = new web3.eth.Contract(CrowdFund.abi, address);
  
    const res = crowdFund.events.allEvents((error, log) => {
      if (error) {
        callback(error, null);
      } else if (log) {
        callback(null, log);
      }
    });
  
    return () => res.unsubscribe();
}
  