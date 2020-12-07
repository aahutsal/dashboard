import React, { ReactNode, useContext } from 'react';
import {
  Menu,
} from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { useQuery } from '@apollo/react-hooks';

import { GET_AUTH } from '../../apollo/queries';
import UserMenu from './components/UserMenu';
import { DashboardContext } from '../../components/DashboardContextProvider';
import RegisterForm from '../RegisterPage/RegisterForm';
import RegisterPrompt from './components/RegisterPrompt';
import SignInPrompt from './components/SignInPrompt';
import {
  DashboardLayoutCentered, DashboardLayout, Content, Header,
} from './components/Layout';
import Logo from './components/Logo';

interface AppLayoutProps {
  section?: string;
  children: ReactNode;
}

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

const AppLayout: React.FC<AppLayoutProps> = ({ section, children }: AppLayoutProps) => {
  const { account, user } = useContext(DashboardContext);
  const { data: authData } = useQuery(GET_AUTH);
  const isAuthTokenValid = authData && authData.auth.valid;

  if (!account || (!isAuthTokenValid && user?.isApproved())) {
    return (
      <DashboardLayoutCentered theme="dark">
        {account && <SignInPrompt />}
        {!account && <RegisterPrompt />}
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
            <Menu.Item key="sublicensees">
              <Link to="/sublicensees">My Licensees</Link>
            </Menu.Item>
            {user && user.isAdmin() && (
              <Menu.Item key="admin">
                <Link to="/admin">Admin</Link>
              </Menu.Item>
            )}
          </TopMenu>
        )}
        {user && account && (
          <UserMenu user={user} account={account} />
        )}
      </Header>
      <Content>
        {!userOnboarded && <RegisterForm />}
        {userOnboarded && children}
      </Content>
    </DashboardLayout>
  );
};

export default AppLayout;
