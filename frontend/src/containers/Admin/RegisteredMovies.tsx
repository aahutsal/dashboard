import React, { Fragment } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import {
  Table, Button, Space, Popconfirm,
} from 'antd';
import { Movie } from '@whiterabbitjs/dashboard-common';
import gql from 'graphql-tag';

const UNREGISTER_MOVIE = gql`
  mutation deleteMovie ($imdbId: String!) {
    deleteMovie(imdbId: $imdbId) {
      success
      message
    }
  }
`;

const UNREGISTER_ALL = gql`
  mutation deleteAllMovies {
    deleteAllMovies {
      success
      message
    }
  }
`;

const ALL_MOVIES = gql`
{
  allMovies {
    rightsHolder {
      name
    }
    metadata {
      imdbId
      title
      year
    }
  }
}
`;

export default () => {
  const [unregisterMovie] = useMutation(UNREGISTER_MOVIE);
  const [unregisterAllMovies] = useMutation(UNREGISTER_ALL);
  const { data, loading } = useQuery(ALL_MOVIES, { fetchPolicy: 'network-only' });

  const refetchQueries = [
    { query: ALL_MOVIES },
  ];

  const unregister = (imdbId: string) => unregisterMovie({ variables: { imdbId }, refetchQueries })
    .catch(() => { });

  const unregisterAll = () => unregisterAllMovies({ refetchQueries })
    .catch(() => { });

  const columns = [
    {
      title: 'Movie title',
      dataIndex: ['metadata', 'title'],
      key: 'title',
    },
    {
      title: 'Rightsholder',
      dataIndex: ['rightsHolder', 'name'],
      key: 'rightsholder',
    },
    {
      title: '',
      render: (movie: Movie) => (
        <Fragment>
          <Space>
            <Button danger onClick={() => unregister(movie.metadata.imdbId || '')}>Unregister</Button>
          </Space>
        </Fragment>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', marginBottom: '14px' }}>
        <h1>Registered movies</h1>
        {data && data.allMovies.length > 0 && (
          <Popconfirm
            title="Are you sure you want to remove ALL the movies from WhiteRabbit database?"
            onConfirm={unregisterAll}
            okText="Yes"
            cancelText="No"
          >
            <Button danger type="primary" style={{ marginLeft: 'auto' }}>
              Unregister all
            </Button>
          </Popconfirm>
        )}
      </div>
      <Table
        bordered={false}
        loading={loading}
        dataSource={(data && data.allMovies) || []}
        columns={columns}
        rowKey="IMDB"
        locale={{
          emptyText: 'No movies registered',
        }}
        pagination={false}
      />
    </>
  );
};
