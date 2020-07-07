import React, { ReactNode, useContext } from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { useQuery } from '@apollo/react-hooks';

import { GET_AUTH } from '../../apollo/queries';
import logo from './logo.png';
import ConnectButton from './components/ConnectButton';
import UserMenu from './components/UserMenu';
import { refreshAuthToken } from '../../stores/Web3';
import { DashboardContext } from '../../components/DashboardContextProvider';

interface AppLayoutProps {
  section?: string;
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

  & .ant-menu-item {
    margin-right: 3px;
  }

  & .ant-menu-item:hover,
  & .ant-menu-item-selected {
    border-color: transparent;
    margin-right: 0;

    a {
      font-weight: bold;
      color: #000;
      margin-left: 
    }
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
  const { account, user } = useContext(DashboardContext);

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
          selectedKeys={section ? [section] : []}
          style={{ marginLeft: '50px' }}
        >
          <Menu.Item key="titles">
            <Link to="/">Titles</Link>
          </Menu.Item>
          <Menu.Item key="addMovie">
            <Link to="/add_movie">Add Movie</Link>
          </Menu.Item>
          {user && user.isAdmin() && (
          <Menu.Item key="rightsholders">
            <Link to="/rightsholders">Rightsholders</Link>
          </Menu.Item>
          )}
        </TopMenu>
        <div style={{ width: '100%', textAlign: 'right', whiteSpace: 'nowrap' }}>
          { account && isAuthTokenValid && <UserMenu account={account} /> }
          { !account && <ConnectButton /> }
          { account && !isAuthTokenValid && (
            <Button type="primary" onClick={refreshAuthToken}>
              Sign in
            </Button>
          )}
        </div>
      </Header>
      <Content>
        {!account && 'Please connect your wallet first'}
        {account && children}
      </Content>
    </DashboardLayout>
  );
};

export default AppLayout;
