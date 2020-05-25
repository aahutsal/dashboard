import React from 'react';
import { Button, Dropdown, Menu } from 'antd';
import { UserOutlined, DownOutlined } from '@ant-design/icons';
import { disconnect } from '../../../stores/Web3';

type UserMenuProps = {
  account: string;
};

const shortenAddr = (addr: string) => `${addr.substr(0, 6)}..${addr.substr(38, 4)}`;

const userActions = (
  <Menu>
    <Menu.Item>
      <Button onClick={disconnect} type="link">
        Disconnect
      </Button>
    </Menu.Item>
  </Menu>
);

const UserMenu: React.FC<UserMenuProps> = ({ account } : UserMenuProps) => (
  <Dropdown overlay={userActions} trigger={['click']}>
    <Button
      className="ant-dropdown-link"
      type="link"
    >
      <UserOutlined />
      {' '}
      {shortenAddr(account)}
      {' '}
      <DownOutlined />
    </Button>
  </Dropdown>
);

export default UserMenu;
