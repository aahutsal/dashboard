import React from 'react';
import { Button, Dropdown, Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';
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

const UserCompanyBadge = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 18px;
  justify-content: center;
`;

const UserCompanyDropdownTopMenuWrapper = styled.div`
  width: 100%;
  white-space: nowrap;
  display: flex;
  justify-content: right;
  text-align: right;
  cursor: pointer;
`;

const UserMenu: React.FC<UserMenuProps> = ({ user, account }) => (
  <UserCompanyDropdownTopMenuWrapper>
    <Dropdown overlay={userActions(account)} trigger={['click']}>
      <UserCompanyBadge>
        <div>
          {user.company.name}
        </div>
        <div style={{ fontSize: '0.7rem' }}>
          <UserOutlined />
          {' '}
          {user.name}
          {' '}
        </div>
      </UserCompanyBadge>
    </Dropdown>
  </UserCompanyDropdownTopMenuWrapper>
);

export default UserMenu;
