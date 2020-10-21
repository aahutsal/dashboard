import { Layout } from 'antd';
import styled from 'styled-components';

export const DashboardLayout = styled(Layout)`
  background-color: #FFF;
  height: 100%;
`;

export const DashboardLayoutCentered = styled(DashboardLayout)`
  justify-content: center;
`;

export const Header = styled(Layout.Header)`
  background-color: #FFF;
  display: flex;
  align-items: left;
  margin-bottom: 25px;
`;

export const Content = styled(Layout.Content)`
  padding: 0 50px;
`;
