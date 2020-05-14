import Onboard from 'bnc-onboard';
import React from 'react';

import { Button } from 'antd';
import { BLOCKNATIVE_API_KEY, NETWORK_ID } from '../../../config';

import client from '../../../apollo/client';
import { SET_PROVIDER_INFO } from '../../../apollo/mutations';
import { setProvider, getWeb3, getWeb3ProviderInfo } from '../../../stores/Web3';

let lastUsedAddress = '';
let providerName: string | null;

const WALLET_NAME_KEY = 'selectedWallet';

export const recheckConnection = async () => {
  const lastUsedProvider = window.localStorage.getItem(WALLET_NAME_KEY);
  if (lastUsedProvider) {
    const hasSelectedWallet = await onboard.walletSelect(lastUsedProvider);
    if (hasSelectedWallet) {
      await onboard.walletCheck();
    }
  }
};

export const onboard = Onboard({
  dappId: BLOCKNATIVE_API_KEY,
  networkId: NETWORK_ID,
  subscriptions: {
    wallet: (wallet) => {
      if (wallet.provider) {
        setProvider(wallet.provider);
        providerName = wallet.name;
        window.localStorage.setItem(WALLET_NAME_KEY, wallet.name || '')
      }
    },
    address: async (address) => {
      if (!lastUsedAddress && address) {
        lastUsedAddress = address;
        const providerInfo = await getWeb3ProviderInfo(getWeb3(), providerName);
        client.mutate({ mutation: SET_PROVIDER_INFO, variables: {
          providerInfo: providerInfo
        }});
      }

      // we don't have an unsubscribe event so we rely on this
      if (!address && lastUsedAddress) {
        lastUsedAddress = '';
        providerName = null;
      }
    },
  },
  walletSelect: {
    description: 'Please select a wallet to connect to WhiteRabbit Dashboard',
  },
  walletCheck: [
    { checkName: 'derivationPath' },
    { checkName: 'connect' },
    { checkName: 'network' },
    { checkName: 'accounts' },
  ],
});

export const onboardUser = async () => {
  const web3 = getWeb3();
  const walletSelected = web3 ? true : await onboard.walletSelect();
  return walletSelected && onboard.walletCheck();
};

const ConnectButton = () => (
  <Button
    type="primary"
    onClick={async () => {
      const walletSelected = await onboard.walletSelect()

      if (walletSelected) {
        await onboard.walletCheck()
      }
    }}
  >
    Connect
  </Button>
);

export default ConnectButton;
