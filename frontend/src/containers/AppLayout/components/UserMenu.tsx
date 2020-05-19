import React from "react";
import { Dropdown, Menu } from "antd";
import { UserOutlined, DownOutlined } from '@ant-design/icons';
import { disconnect } from "../../../stores/Web3";

type UserMenuProps = {
  account: string;
};

const shortenAddr = (addr: string) =>
  `${addr.substr(0, 6)}..${addr.substr(38, 4)}`;

const userMenu = (
  <Menu>
    <Menu.Item>
      <a onClick={disconnect}>
        Disconnect
      </a>
    </Menu.Item>
  </Menu>
);

export const UserMenu: React.FC<UserMenuProps> = ({ account }) => {
  return (
    <Dropdown overlay={userMenu} trigger={['click']}>
      <span
        className="ant-dropdown-link"
        onClick={e => e.preventDefault()}
        style={{ cursor: 'pointer' }}
      >
        <UserOutlined /> {shortenAddr(account)} <DownOutlined />
      </span>
    </Dropdown>
  )
};

export default UserMenu;