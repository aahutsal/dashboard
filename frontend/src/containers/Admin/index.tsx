import React, { useContext, Fragment } from 'react';
import { useHistory } from 'react-router';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Table, Button, Space } from 'antd';
import { User } from '@whiterabbitjs/dashboard-common';
import AppLayout from '../AppLayout';
import { DashboardContext } from '../../components/DashboardContextProvider';
import { PENDING_USERS, GET_USER } from '../../apollo/queries';
import { APPROVE_USER, DECLINE_USER } from '../../apollo/mutations';
import RegisteredMovies from './RegisteredMovies';
import Section from '../components/Section';


export default () => {
  const { user, account } = useContext(DashboardContext);
  const history = useHistory();

  if (!user || !user.isAdmin()) {
    history.push('/');
  }

  const [approveUser] = useMutation(APPROVE_USER);
  const [declineUser] = useMutation(DECLINE_USER);
  const { data, loading } = useQuery(PENDING_USERS, { fetchPolicy: 'network-only' });

  const refetchQueries = [
    { query: PENDING_USERS },
    {
      query: GET_USER,
      variables: {
        accountAddress: account,
      },
    },
  ];
  const approve = (userId: string) => approveUser({ variables: { userId }, refetchQueries })
    .catch(() => { });

  const decline = (userId: string) => declineUser({ variables: { userId }, refetchQueries })
    .catch(() => { });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'IMDB ID',
      dataIndex: 'imdbId',
      key: 'imdbId',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Kind',
      dataIndex: 'kind',
      key: 'kind',
    },
    {
      title: 'Address',
      dataIndex: 'accountAddress',
      key: 'address',
    },
    {
      title: '',
      render: ({ accountAddress }: User) => (
        <Fragment>
          <Space>
            <Button type="primary" onClick={() => approve(accountAddress)}>Approve</Button>
            <Button danger onClick={() => decline(accountAddress)}>Decline</Button>
          </Space>
        </Fragment>
      ),
    },
  ];

  return (
    <AppLayout section="admin">
      <Section>
        <h1>Rightsholders to approve</h1>
        <Table
          bordered={false}
          loading={loading}
          dataSource={(data && data.pendingUsers) || []}
          columns={columns}
          rowKey="accountAddress"
          pagination={false}
        />
      </Section>
      <Section>
        <RegisteredMovies />
      </Section>
    </AppLayout>
  );
};
