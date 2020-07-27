import React, { ReactNode, useContext } from 'react';
import {
  Layout, Menu, Button, Result,
} from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { useQuery } from '@apollo/react-hooks';

import { GET_AUTH } from '../../apollo/queries';
import logo from './logo.png';
import UserMenu from './components/UserMenu';
import { refreshAuthToken, connect } from '../../stores/Web3';
import { DashboardContext } from '../../components/DashboardContextProvider';
import Register from '../Register';

interface AppLayoutProps {
  section?: string;
  children: ReactNode;
}

const DashboardLayout = styled(Layout)`
  background-color: #FFF;
  height: 100%;
`;

const DashboardLayoutCentered = styled(DashboardLayout)`
  justify-content: center;
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
      WhiteRabbit
    </span>
  </div>
);


const AppLayout: React.FC<AppLayoutProps> = ({ section, children }: AppLayoutProps) => {
  const { account, user } = useContext(DashboardContext);
  const { data: authData } = useQuery(GET_AUTH);
  const isAuthTokenValid = authData && authData.auth.valid;

  if (!account || !isAuthTokenValid) {
    return (
      <DashboardLayoutCentered theme="dark">
        <Result
          icon={<img src={logo} alt="logo" height="200" />}
          title="Please sign in to use the app"
          subTitle={(
            <>
              {!account && (
              <>
                You will need
                {' '}
                <a href="https://metamask.io/">MetaMask wallet</a>
                {' '}
                for this.
              </>
              )}
              {account && 'Please sign a message with your MetaMask'}
            </>
        )}
          extra={(
            <Button type="primary" onClick={account ? refreshAuthToken : connect}>
              Sign in
            </Button>
        )}
        />
      </DashboardLayoutCentered>
    );
  }

  const userOnboarded = user && user.status === 'APPROVED';

  return (
    <DashboardLayout theme="dark">
      <Header>
        <Link to="/">
          <Logo />
        </Link>
        {userOnboarded && (
          <TopMenu
            mode="horizontal"
            selectedKeys={section ? [section] : []}
            style={{ marginLeft: '50px' }}
          >
            <Menu.Item key="movies">
              <Link to="/">My Movies</Link>
            </Menu.Item>
            {user && user.isAdmin() && (
            <Menu.Item key="admin">
              <Link to="/admin">Admin</Link>
            </Menu.Item>
            )}
          </TopMenu>
        )}
        {user && (
        <div style={{ width: '100%', textAlign: 'right', whiteSpace: 'nowrap' }}>
          <UserMenu user={user} account={account} />
        </div>
        )}
      </Header>
      <Content>
        {!userOnboarded && <Register />}
        {userOnboarded && children}
      </Content>
    </DashboardLayout>
  );
};

export default AppLayout;
