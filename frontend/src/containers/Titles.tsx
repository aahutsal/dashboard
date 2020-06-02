import React, { useContext } from 'react';
import { Table } from 'antd';
import { useHistory } from 'react-router-dom';
import AppLayout from './AppLayout';
import { DashboardContext } from '../components/DashboardContextProvider';

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
  const { user } = useContext(DashboardContext);
  const history = useHistory();
  const movies = user ? user.movies : [];

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
