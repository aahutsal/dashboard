import React from 'react';
import { Table } from 'antd';
import { useQuery } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';
import AppLayout from './AppLayout';
import { GET_PROVIDER_INFO, GET_USER } from '../apollo/queries';

const columns = [
  {
    title: '',
    dataIndex: ['metadata', 'posterUrl'],
    key: 'poster',
    width: 100,
    render: (url: string) => <img src={url} height={150} alt="Movie Poster" />,
  },
  {
    title: 'Name',
    dataIndex: ['metadata', 'title'],
    key: 'name',
  },
];

export default () => {
  const { data: providerData } = useQuery(GET_PROVIDER_INFO);
  const account = providerData && providerData.provider.account;
  const { data: userData } = useQuery(GET_USER, { variables: { accountAddress: account } });
  const user = userData && userData.user;

  const movies = user ? user.movies : [];

  const history = useHistory();
  if (!user || user.status !== 'APPROVED') {
    history.push('/register');
  }

  return (
    <AppLayout section="titles">
      <h1>Titles</h1>
      <Table
        showHeader={false}
        bordered={false}
        dataSource={movies}
        columns={columns}
        rowKey="IMDB"
      />
    </AppLayout>
  );
};
