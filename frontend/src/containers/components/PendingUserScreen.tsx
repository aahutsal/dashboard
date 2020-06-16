import React, { useState, useEffect } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Alert, Table, Tooltip } from 'antd';
import { User } from '@whiterabbitjs/dashboard-common';
import AppLayout from '../AppLayout';
import { TMDBMovie, getPersonByIMDBId } from '../../stores/API';

export type PendingUserScreenProps = {
  user: User;
};

const columns = [
  {
    title: '',
    dataIndex: 'poster_path',
    key: 'poster_path',
    width: 50,
    render: (url: string, movie: TMDBMovie) => <img src={`https://image.tmdb.org/t/p/w500${url}`} height={80} alt={movie.title} />,
  },
  {
    title: '',
    dataIndex: 'title',
    key: 'title',
    render: (title: string, movie: TMDBMovie) => (
      <div>
        <h2>
          {title}
          {' '}
          (
          {movie.release_date.split('-')[0]}
          )
        </h2>
        <div>{movie.overview}</div>
      </div>
    ),
  },
  {
    title: 'Pending revenue on WhiteRabbit',
    key: 'revenue',
    render: () => (
      <Tooltip title="Current revenue on WhiteRabbit pending to be collected by you">
        <span>$0</span>
      </Tooltip>
    ),
  },
];


export default ({ user }: PendingUserScreenProps) => {
  const [movies, setMovies] = useState<TMDBMovie[]>();
  useEffect(() => {
    getPersonByIMDBId(user.imdbId).then((data) => {
      setMovies(data.known_for || []);
    });
  }, [user]);

  return (
    <AppLayout section="register">
      <Alert
        message="Pending identity verification"
        description="Sit tight, Alan will contact you soon to verify your identity."
        type="warning"
        showIcon
        icon={<ClockCircleOutlined />}
        style={{ width: 400 }}
      />
      {movies && (
        <div style={{ marginTop: '2rem', maxWidth: '600px' }}>
          <h2>Pending revenue on WhiteRabbit</h2>
          <Table
            dataSource={movies}
            columns={columns}
            showHeader={false}
            bordered={false}
            rowKey="id"
            pagination={false}
          />
        </div>
      )}

    </AppLayout>
  );
};
