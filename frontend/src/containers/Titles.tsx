import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { useQuery } from '@apollo/react-hooks';
import AppLayout from './AppLayout';
import { GET_PROVIDER_INFO } from '../apollo/queries';
import API, { Movie } from '../stores/API';

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
  const [movies, setMovies] = useState<Movie[]>([]);
  useEffect(() => {
    if (!providerData || !providerData.provider.account) {
      setMovies([]);
      return;
    }
    API.getUser(providerData.provider.account).then((user) => setMovies(user.movies));
  }, [providerData]);
  return (
    <AppLayout section="titles">
      <h1>Titles</h1>
      <Table showHeader={false} bordered={false} dataSource={movies} columns={columns} />
      ;
    </AppLayout>
  );
};
