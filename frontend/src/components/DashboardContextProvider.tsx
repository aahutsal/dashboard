import React, { ReactNode } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { Spin } from 'antd';
import { User } from '@whiterabbitjs/dashboard-common';
import { GET_PROVIDER_INFO, GET_USER } from '../apollo/queries';

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
};

export const DashboardContext = React.createContext({
  account: undefined,
  user: undefined,
} as DashboardContextType);

const WithUser = ({ account, children }: { account: string, children: ReactNode }) => {
  const { data: userData, loading } = useQuery(
    GET_USER,
    {
      variables: {
        accountAddress: account,
      },
      fetchPolicy: 'cache-and-network',
    },
  );
  const user = userData && userData.user.status ? new User(userData.user) : null;

  if (loading) {
    return (
      <BigSpin />
    );
  }

  const context = {
    account,
    user,
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
