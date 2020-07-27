import React from 'react';
import { Button, Dropdown, Menu } from 'antd';
import { UserOutlined, DownOutlined } from '@ant-design/icons';
import { User } from '@whiterabbitjs/dashboard-common';
import styled from 'styled-components';
import { disconnect } from '../../../stores/Web3';

type UserMenuProps = {
  account: string;
  user: User;
};

const MenuButton = styled(Button)`
  padding-left: 0;
  padding-right: 0;
`;

const shortenAddr = (addr: string) => `${addr.substr(0, 6)}..${addr.substr(38, 4)}`;

const userActions = (account: string) => (
  <Menu>
    <Menu.Item>
      Account:
      {' '}
      {shortenAddr(account)}
    </Menu.Item>
    <Menu.Item>
      <MenuButton type="link" onClick={disconnect}>
        Disconnect
      </MenuButton>
    </Menu.Item>
  </Menu>
);

const UserMenu: React.FC<UserMenuProps> = ({ user, account } : UserMenuProps) => (
  <Dropdown overlay={userActions(account)} trigger={['click']}>
    <Button
      className="ant-dropdown-link"
      type="link"
    >
      <UserOutlined />
      {' '}
      {user.name}
      {' '}
      <DownOutlined />
    </Button>
  </Dropdown>
);

export default UserMenu;
