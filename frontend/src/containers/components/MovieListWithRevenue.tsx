import React, { useEffect, useState } from 'react';
import { Table, Tooltip } from 'antd';
import Web3 from 'web3';
import { ColumnType } from 'antd/lib/table';
import { TMDBMovie, TMDBMovieExtended } from '@whiterabbitjs/dashboard-common';
import { toExtended } from '../../stores/movieAPI';

type MovieListWithRevenueProps = {
  movies: TMDBMovieExtended[];
  extraColumns?: ColumnType<TMDBMovieExtended>[];
};

const columns = [
  {
    title: '',
    dataIndex: 'posterUrl',
    key: 'posterUrl',
    width: 50,
    render: (url: string, movie: TMDBMovie) => <img src={url} height={50} alt={movie.title} />,
  },
  {
    title: '',
    dataIndex: 'title',
    key: 'title',
    render: (title: string, movie: TMDBMovie) => (
      <div>
        {title}
        {movie.release_date && (
        <React.Fragment>
          {' '}
          (
          {movie.release_date.split('-')[0]}
          )
        </React.Fragment>
        )}
      </div>
    ),
  },
  {
    title: 'Pending revenue on WhiteRabbit',
    key: 'revenue',
    render: (r: any, movie: TMDBMovieExtended) => (
      <Tooltip title="Current revenue on WhiteRabbit pending to be collected by you">
        <span>
          $
          {movie.revenue ? Web3.utils.fromWei(movie.revenue.total.toString()) : '0'}
        </span>
      </Tooltip>
    ),
  },
];

export default ({ movies, extraColumns }: MovieListWithRevenueProps) => {
  const [extMovies, setExtMovies] = useState<TMDBMovieExtended[]>();

  useEffect(() => {
    if (!movies || !movies.length) {
      setExtMovies([]);
      return;
    }
    if (movies[0].revenue) { // already extended
      setExtMovies(movies);
      return;
    }

    Promise.all(movies.map(toExtended)).then(setExtMovies);
  }, [movies]);

  return (
    <Table
      dataSource={extMovies}
      columns={[...columns, ...(extraColumns || [])]}
      showHeader={false}
      loading={!extMovies}
      bordered={false}
      rowKey="id"
      pagination={false}
    />
  );
};
