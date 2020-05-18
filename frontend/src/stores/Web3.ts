/* eslint-disable */
import Web3 from "web3";
import { provider } from "web3-core";

type ProviderProps = {
  __typename: 'ProviderInfo',
  name: string;
  available: boolean;
  loaded: boolean;
  account: string;
  network: number;
};

// With some wallets from web3connect you have to use their provider instance only for signing
// And our own one to fetch data
export const web3ReadOnly = new Web3(
  new Web3.providers.HttpProvider("https://dai.poa.network")
);

let web3 = web3ReadOnly;

export const getWeb3 = () => web3;

export const resetWeb3 = () => {
  web3 = web3ReadOnly;
};

export const setProvider = (provider: provider) => {
  web3 = new Web3(provider);
};

export const getAccountFrom: Function = async (
  web3: Web3
): Promise<string | null> => {
  const accounts = await web3.eth.getAccounts();
  return accounts && accounts.length > 0 ? accounts[0] : null;
};

export const getNetworkIdFrom = (web3: Web3) => web3.eth.net.getId();

export const getWeb3ProviderInfo: Function = async (
  provider: provider,
  providerName: string = "Wallet"
): Promise<ProviderProps> => {
  const web3 = new Web3(provider);

  const account = await getAccountFrom(web3);
  const network = await getNetworkIdFrom(web3);

  const available = account !== null;

  return {
    __typename: 'ProviderInfo',
    name: providerName,
    available,
    loaded: true,
    account,
    network,
  };
};