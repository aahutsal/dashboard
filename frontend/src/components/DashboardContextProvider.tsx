import React, { ReactNode } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { Spin } from 'antd';
import { User, Config } from '@whiterabbitjs/dashboard-common';
import { GET_PROVIDER_INFO, GET_USER, GET_CONFIG } from '../apollo/queries';

const BigSpin = () => (
  <div style={{
    position: 'absolute',
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
  >
    <Spin size="large" />
  </div>
);

type DashboardContextProviderProps = {
  children?: ReactNode;
};

export type DashboardContextType = {
  account?: string;
  user?: User;
  config: Config;
  applyFactor: (value: string | number | BigInt) => BigInt;
};

export const DashboardContext = React.createContext({
  account: undefined,
  user: undefined,
  config: {
    factor: 1,
  },
  applyFactor: (value) => BigInt(value),
} as DashboardContextType);

const WithUser = ({ account, children }: { account: string, children: ReactNode }) => {
  const { data: userData, loading: userLoading } = useQuery(
    GET_USER,
    {
      variables: {
        accountAddress: account,
      },
      fetchPolicy: 'cache-and-network',
    },
  );

  const { data: configData, loading: configLoading } = useQuery(GET_CONFIG);

  const user = userData && userData.user.status ? new User(userData.user) : null;

  if (user === undefined || userLoading || configLoading) {
    return (
      <BigSpin />
    );
  }

  const context = {
    account,
    user,
    config: configData?.config,
    applyFactor: (value) => BigInt(value) * BigInt(configData?.config.factor || 1),
  } as DashboardContextType;

  return (
    <DashboardContext.Provider value={context}>
      {children}
    </DashboardContext.Provider>
  );
};

export default ({ children }: DashboardContextProviderProps) => {
  const { data: providerData } = useQuery(GET_PROVIDER_INFO);
  const account = providerData && providerData.provider.account;

  return (
    <WithUser account={account}>
      {children}
    </WithUser>
  );
};
