import React, { useEffect, ReactNode } from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { useQuery } from '@apollo/react-hooks';

import { GET_PROVIDER_INFO, GET_AUTH } from '../../apollo/queries';
import logo from './logo.png';
import ConnectButton from './components/ConnectButton';
import UserMenu from './components/UserMenu';
import { recheckConnection, refreshAuthToken } from '../../stores/Web3';

interface AppLayoutProps {
  section: string;
  children: ReactNode;
}

const DashboardLayout = styled(Layout)`
  background-color: #FFF;
`;

const Header = styled(Layout.Header)`
  background-color: #FFF;
  display: flex;
  align-items: left;
  margin-bottom: 25px;
`;

const TopMenu = styled(Menu)`
  border-bottom: 0;

  & .ant-menu-item:hover,
  & .ant-menu-item-selected {
    border-color: transparent;
  }
`;

const Content = styled(Layout.Content)`
  padding: 0 50px;
`;

const Logo = () => (
  <div style={{ whiteSpace: 'nowrap' }}>
    <img src={logo} alt="logo" height="30" />
    <span style={{ marginLeft: '12px', color: '#000' }}>
      Mad Tea Party
    </span>
  </div>
);

const AppLayout: React.FC<AppLayoutProps> = ({ section, children }: AppLayoutProps) => {
  useEffect(() => {
    recheckConnection();
  }, []);
  const { data: providerData } = useQuery(GET_PROVIDER_INFO);
  const isLoggedIn = providerData && providerData.provider.account;
  const { data: authData } = useQuery(GET_AUTH);
  const isAuthTokenValid = authData && authData.auth.valid;
  return (
    <DashboardLayout theme="dark">
      <Header>
        <Link to="/">
          <Logo />
        </Link>
        <TopMenu
          mode="horizontal"
          selectedKeys={[section]}
          style={{ marginLeft: '50px' }}
        >
          <Menu.Item key="titles">
            <Link to="/">Titles</Link>
          </Menu.Item>
        </TopMenu>
        <div style={{ width: '100%', textAlign: 'right', whiteSpace: 'nowrap' }}>
          { isLoggedIn && isAuthTokenValid && <UserMenu account={providerData.provider.account} /> }
          { !isLoggedIn && <ConnectButton /> }
          { isLoggedIn && !isAuthTokenValid && (
            <Button type="primary" onClick={refreshAuthToken}>
              Sign in
            </Button>
          )}
        </div>
      </Header>
      <Content>
        {children}
      </Content>
    </DashboardLayout>
  );
};

export default AppLayout;
