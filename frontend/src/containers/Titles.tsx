import React, { useContext } from 'react';
import { Table } from 'antd';
import { useHistory, Link } from 'react-router-dom';
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
  {
    title: 'Action',
    key: 'action',
    render: (text: string, record: any) => (
      <Link to={`/movie/prices/${record.IMDB}`}>Prices</Link>
    ),
  },
];

export default () => {
  const { user } = useContext(DashboardContext);
  const history = useHistory();

  if (!user || user.status !== 'APPROVED') {
    history.push('/register');
  }

  const movies = user ? user.movies : [];

  // TODO: use MovieListWithRevenue here
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
