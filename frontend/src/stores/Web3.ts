import Web3 from 'web3';
import { provider as Provider } from 'web3-core';
import Onboard from 'bnc-onboard';

import { BLOCKNATIVE_API_KEY, NETWORK_ID } from '../config';
import client from '../apollo/client';
import { SET_APP_STATE } from '../apollo/mutations';
import requestSignature from './utils/requestSignature';

const WALLET_NAME_KEY = 'selectedWallet';

const web3ReadOnly = new Web3(
  new Web3.providers.HttpProvider('https://dai.poa.network'),
);

let web3 = web3ReadOnly;

const provider = {
  __typename: 'Provider',
  name: '',
  account: '',
  network: 0,
};

const auth = {
  __typename: 'Auth',
  message: '',
  timestamp: 0,
  valid: false,
};

const authKey = () => `wr-auth-${provider.account}`;

const resetAuth = () => {
  auth.message = '';
  auth.timestamp = 0;
  auth.valid = false;
};

const setAppState = (state: object) => {
  client.mutate({
    mutation: SET_APP_STATE,
    variables: { stateChange: state },
  });
};

const setProvider = (_provider: Provider, _providerName: string) => {
  web3 = new Web3(_provider);
  provider.name = _providerName;
  setAppState({ provider });
  window.localStorage.setItem(WALLET_NAME_KEY, provider.name);
};

const getAccountFrom: Function = async (_web3: Web3): Promise<string | null> => {
  const accounts = await _web3.eth.getAccounts();
  return accounts && accounts.length > 0 ? accounts[0] : null;
};

const getNetworkIdFrom = (_web3: Web3) => _web3.eth.net.getId();

const setWeb3ProviderInfo: Function = async () => {
  provider.account = await getAccountFrom(web3);
  provider.network = await getNetworkIdFrom(web3);
  resetAuth();
  setAppState({ provider, auth });
};

export const recheckAuthToken = (): boolean => {
  if (!auth.timestamp) {
    const storedAuth = JSON.parse(window.localStorage.getItem(authKey()) || '{}');
    auth.message = storedAuth.message || '';
    auth.timestamp = storedAuth.timestamp || 0;
  }

  // token is younger than 24 hours, return true
  auth.valid = Date.now() - auth.timestamp < 86400000;
  setAppState({ auth });
  return auth.valid;
};

export const refreshAuthToken = async () => {
  if (recheckAuthToken()) return Promise.resolve();

  const timestamp = Date.now();

  return requestSignature(
    { timestamp },
    provider.account,
    web3,
  ).then((signature: string) => {
    auth.message = signature;
    auth.timestamp = timestamp;
    auth.valid = true;
    window.localStorage.setItem(authKey(), JSON.stringify(auth));
    setAppState({ auth });
  }).catch((e: Error) => {
    // eslint-disable-next-line no-console
    console.error(e);
  });
};

const onboard = Onboard({
  dappId: BLOCKNATIVE_API_KEY,
  networkId: NETWORK_ID,
  subscriptions: {
    network: async (networkId) => {
      if (networkId && networkId !== NETWORK_ID) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
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
        await recheckAuthToken();
      }
    },
  },
  walletSelect: {
    description: 'Please select a wallet to connect to WhiteRabbit Dashboard',
    wallets: [
      { walletName: 'metamask', preferred: true },
    ],
  },
  walletCheck: [
    { checkName: 'derivationPath' },
    { checkName: 'connect' },
    { checkName: 'network' },
    { checkName: 'accounts' },
  ],
});

export const recheckWallet = async (_providerName: string | null): Promise<string | undefined> => {
  const walletSelected = await onboard.walletSelect(_providerName || undefined);
  if (!walletSelected) return '';
  await onboard.walletCheck();
  return provider.account;
};

export const recheckConnection = async () => {
  const lastUsedProvider = window.localStorage.getItem(WALLET_NAME_KEY);
  if (lastUsedProvider) {
    await recheckWallet(lastUsedProvider);
    await recheckAuthToken();
  }
};

export const connect = async () => {
  await recheckWallet(provider.name);
  await refreshAuthToken();
};

export const disconnect = async () => {
  onboard.walletReset();
  web3 = web3ReadOnly;
  provider.name = '';
  window.localStorage.removeItem(authKey());
  window.localStorage.removeItem(WALLET_NAME_KEY);
  await setWeb3ProviderInfo();
};

export const getWeb3 = () => web3;

export const getAuth = () => auth;
