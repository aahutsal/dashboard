import React, { useContext } from 'react';
import { useHistory } from 'react-router';
import { DashboardContext } from '../../components/DashboardContextProvider';
import { DashboardLayout, Content, Header } from '../AppLayout/components/Layout';
import Logo from '../AppLayout/components/Logo';
import RegisterForm from './RegisterForm';


export default () => {
  const { user } = useContext(DashboardContext);
  const history = useHistory();

  if (user && user.isApproved()) {
    history.push('/');
  }

  return (
    <DashboardLayout>
      <Header>
        <Logo />
      </Header>
      <Content>
        <RegisterForm />
      </Content>
    </DashboardLayout>
  );
};
