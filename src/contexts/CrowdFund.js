import Web3 from "web3";
import BN from "bn.js";
import React, {
  useReducer,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react";
import { useWeb3Context } from "./Web3";
import { getCrowdFund, getCampaigns, subscribe } from "../api/crowdfund";

/*
interface State {
  crowfund_address;
  campaigns : [ {address, name, desc, owner, type, amountToRaise, vendorList, amountRaised, donorList, isEnded } ]
  tokens_available: [{ name, address }]
}
*/
const INITIAL_STATE = {
  crowdfund_address: "",
  campaigns: [],
  // tokens_available: []
}

const UPDATE_CROWDFUND = "UPDATE_CROWDFUND", GET_CAMPAIGNS = "GET_CAMPAIGNS", CREATE_CAMPAIGN = "CREATE_CAMPAIGN", UPDATE_CAMPAIGN = "UPDATE_CAMPAIGN", UPDATE_TOKENS = "UPDATE_TOKENS", DONATE_TO_CAMPAIGN = "DONATE_TO_CAMPAIGN", END_CAMPAIGN = "END_CAMPAIGN";

function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
      case UPDATE_CROWDFUND: {
          return {
              ...state,
              ...action.data
          }
      }
      case GET_CAMPAIGNS: {
        return {
          ...state,
          ...action.data
        }
      }
      case CREATE_CAMPAIGN: {
        let { campaigns } = state;
        const newCampaign = {
          address: action.data["campaign_address"],
          name: action.data["_cName"],
          description: action.data["_desc"],
          owner: action.data["creator"],
          type: action.data["_cType"],
          amountToRaise: action.data["_vAmounts"].reduce((a,b) => a.add(b)).toString(),
          vendorList: action.data["_vAddresses"].map((address,index) => ( { address, amount: action.data["_vAmounts"][index].toString() } )),
          amountRaised: "0",
          donorList: [],
          isEnded: false
        }
        campaigns.push(newCampaign);
        campaigns = campaigns.filter((v,i,a)=>a.findIndex(v2=>(v2.address===v.address))===i)
        return {
          ...state,
          campaigns
        }
      }
      case UPDATE_CAMPAIGN: {
          const { campaign } = action;
          let { campaigns } = state;
          campaigns = campaigns.map(c => c.address === campaign.address ? campaign: c);          
          return {
              ...state,
              campaigns
          };
      }
      case UPDATE_TOKENS: {
        const { tokens_available } = action;
        return {
          ...state,
          tokens: tokens_available
        }
      }
      case DONATE_TO_CAMPAIGN: {
        const { campaigns } = state;
        campaigns.map(c => {
          if (c.address === action.data["campaign_address"]){
            const newDonorList = c.donorList;
            newDonorList.push({
              address: action.data["donor_address"],
              amount: action.data["amount_out"]
            });
            return {
              ...c,
              donorList: newDonorList,
              amountRaised: (c.amountRaised + action.data["amount_out"]).toString()
            }
          }
          return c;
        })
        return {
          ...state,
          ...action.data
        }
      }
      case END_CAMPAIGN: {
        return {
          ...state,
          ...action.data
        }
      }
      default:
          return state;

  }
}

const CrowdFundContext = createContext({
  state: INITIAL_STATE,
  update_crowdfund: (_data) => {},
  get_campaigns: (_data) => {},
  create_campaign: (_data) => {},
  update_campaign: (_data) => {},
  update_tokens: (_data) => {},
  donate_to_campaign: (_data) => {},
  end_campaign: (_data) => {}
});

export function useCrowdFundContext() {
  return useContext(CrowdFundContext);
}

export const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  function update_crowdfund(data) {
    dispatch({
      type: UPDATE_CROWDFUND,
      data
    });
  }

  function get_campaigns(data) {
    dispatch({
      type: GET_CAMPAIGNS,
      data,
    });
  }

  function create_campaign(data) {
    dispatch({
      type: CREATE_CAMPAIGN,
      data,
    });
  }

  function update_campaign(data) {
    dispatch({
      type: UPDATE_CAMPAIGN,
      data,
    });
  }

  function update_tokens(data) {
    dispatch({
      type: UPDATE_TOKENS,
      data,
    });
  }

  function donate_to_campaign(data) {
    dispatch({
      type: DONATE_TO_CAMPAIGN,
      data,
    });
  }

  function end_campaign(data) {
    dispatch({
      type: END_CAMPAIGN,
      data
    });
  }

  return (
    <CrowdFundContext.Provider
      value={useMemo(
        () => ({
          state,
          update_crowdfund,
          get_campaigns,
          create_campaign,
          update_campaign,
          update_tokens,
          donate_to_campaign,
          end_campaign
        }),
        [state]
      )}
    >
      {children}
    </CrowdFundContext.Provider>
  );

}

export function Updater() {
  const {
    state: { web3, account },
  } = useWeb3Context();
  const {
    state,
    update_crowdfund,
    get_campaigns,
    create_campaign,
    donate_to_campaign,
    end_campaign
  } = useCrowdFundContext();

  useEffect(() => {
    async function get(web3, account) {
      try {
        const data = await getCrowdFund(web3, account);
        update_crowdfund(data);
        const camps = await getCampaigns(web3, account);
        get_campaigns(camps);
      } catch (error) {
        console.error(error);
      }
    }

    if (web3) {
      get(web3, account);
    }
  }, [web3]);

  useEffect(() => {
    if (web3 && state["crowdfund_address"] != '') {
      const address = state["crowdfund_address"]
      return subscribe(web3, address, (error, log) => {
        if (error) {
          console.error(error);
        } else if (log) {
          console.log("logs", log.event)
          switch(log.event) {
            case "CreateCampaign":
              create_campaign(log.returnValues);
              break;
            case "EndCampaign":
              end_campaign(log.returnValues);
              break;
            case "DonationRecieved":
              donate_to_campaign(log.returnValues);
              break;
            default:
              console.log(log.returnValues)
          }
        }
      });
    }
  }, [web3, state["crowdfund_address"]]);
  return null;
}