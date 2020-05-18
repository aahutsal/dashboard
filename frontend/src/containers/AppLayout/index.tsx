/* eslint-disable */
import React, { Fragment, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { useQuery } from "@apollo/react-hooks";

import { GET_PROVIDER_INFO } from '../../apollo/queries';
import logo from './logo.png';
import ConnectButton, { recheckConnection } from './components/ConnectButton';

interface AppLayoutProps {
  section: string;
};

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

const shortenAddr = (addr: string) => 
  `${addr.substr(0, 6)}..${addr.substr(38, 4)}`;

const AppLayout: React.FC<AppLayoutProps> = ({ section, children }) => {
  useEffect(() => {
    recheckConnection();
  }, []);
  const { data } = useQuery(GET_PROVIDER_INFO);
  return (
    <DashboardLayout theme="dark">
      <Header>
        <Link to="/">
        <Logo/> 
        </Link>
        <TopMenu
          mode="horizontal"
          selectedKeys={[section]}
          style={{ marginLeft: '50px' }}
        >
          <Menu.Item key="titles">
            <Link to="/">Titles</Link>
          </Menu.Item>
          <Menu.Item key="payments">
            <Link to="/payments">Payments</Link>
          </Menu.Item>
        </TopMenu>
        <div style={{ width: '100%', textAlign: 'right' }}>
          {data.providerInfo && data.providerInfo.account ? (
            <div style={{ whiteSpace: 'nowrap' }}>
              <UserOutlined /> {shortenAddr(data.providerInfo.account)}
            </div>
          ) : <ConnectButton/>}
        </div>
      </Header>
      <Content>
        {children}
      </Content>
    </DashboardLayout>
  );
};

export default AppLayout;