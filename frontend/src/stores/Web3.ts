import Web3 from "web3";
import { provider } from "web3-core";
import Onboard from 'bnc-onboard';

import logo from '../images/logo.png';
import { BLOCKNATIVE_API_KEY, NETWORK_ID } from '../config';
import client from '../apollo/client';
import { SET_PROVIDER_INFO } from '../apollo/mutations';

const WALLET_NAME_KEY = 'selectedWallet';

export type ProviderProps = {
  __typename: 'ProviderInfo',
  name: string | null;
  account: string;
  network: number;
};

const web3ReadOnly = new Web3(
  new Web3.providers.HttpProvider("https://dai.poa.network")
);

let web3 = web3ReadOnly;
let providerName: string | null;

export const getWeb3 = () => web3;


const setProvider = (provider: provider, _providerName: string) => {
  web3 = new Web3(provider);
  providerName = _providerName;
  window.localStorage.setItem(WALLET_NAME_KEY, providerName)
};

const getAccountFrom: Function = async (
  web3: Web3
): Promise<string | null> => {
  const accounts = await web3.eth.getAccounts();
  return accounts && accounts.length > 0 ? accounts[0] : null;
};

const getNetworkIdFrom = (web3: Web3) => web3.eth.net.getId();

const setWeb3ProviderInfo: Function = async () => {
  const account = await getAccountFrom(web3);
  const network = await getNetworkIdFrom(web3);

  const providerInfo = {
    __typename: 'ProviderInfo',
    name: providerName,
    account,
    network,
  };
  client.mutate({ mutation: SET_PROVIDER_INFO, variables: { providerInfo }});
};

export const recheckConnection = async () => {
  const lastUsedProvider = window.localStorage.getItem(WALLET_NAME_KEY);
  if (lastUsedProvider) {
    await recheckWallet(lastUsedProvider);
  }
};

export const connect = () => recheckWallet(providerName);

const recheckWallet = async (_providerName: string | null) => {
  const walletSelected = await onboard.walletSelect(_providerName || undefined);
  return walletSelected && onboard.walletCheck();
};

export const disconnect = async () => {
  onboard.walletReset();
  web3 = web3ReadOnly;
  providerName = null;
  window.localStorage.removeItem(WALLET_NAME_KEY);
  await setWeb3ProviderInfo();
}

const onboard = Onboard({
  dappId: BLOCKNATIVE_API_KEY,
  networkId: NETWORK_ID,
  subscriptions: {
    network: async (networkId) => {
      if (networkId && networkId !== NETWORK_ID) {
        connect();
      }
    },
    wallet: (wallet) => {
      if (wallet.provider && wallet.name) {
        setProvider(wallet.provider, wallet.name);
      }
    },
    address: async (address) => {
      if (address) {
        await setWeb3ProviderInfo();
      }
    },
  },
  walletSelect: {
    description: 'Please select a wallet to connect to WhiteRabbit Dashboard',
    wallets: [
      { walletName: "coinbase", preferred: true },
      { walletName: "metamask", preferred: true },
      { walletName: "status" },
      { walletName: "unilogin" },
    ]
  },
  walletCheck: [
    { checkName: 'derivationPath' },
    { checkName: 'connect' },
    { 
      checkName: 'network',
      heading: 'Please switch to XDAI sidechain',
      description: 'WhiteRabbit runs on XDAI sidechain network.',
      icon: `<img src=${logo} alt="logo" width="32"/>`,
      html: '<a target="_blank" href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup">Instructions for Metamask</a>' ,
    },
    { checkName: 'accounts' },
  ],
});

