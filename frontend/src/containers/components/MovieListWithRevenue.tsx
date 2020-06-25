import React, {
  useEffect, useState, useContext, useMemo,
} from 'react';
import { Table, Tooltip } from 'antd';
import Web3 from 'web3';
import { ColumnType } from 'antd/lib/table';
import { TMDBMovie, TMDBMovieExtended, TMDBMovieWithCredits } from '@whiterabbitjs/dashboard-common';
import { toExtended } from '../../stores/movieAPI';
import { DashboardContext } from '../../components/DashboardContextProvider';

type MovieOrCredit = TMDBMovieExtended | TMDBMovieWithCredits;

type MovieListWithRevenueProps = {
  movies: MovieOrCredit[];
  hideExactNumbers?: boolean;
  extraColumns?: ColumnType<MovieOrCredit>[];
};

const vaguelyRangeify = (value: number | string) => {
  const val = Number(value);

  if (val === 0) {
    return '0';
  } else if (val < 1000) {
    return '1–$999';
  } else if (val < 10000) {
    return '1,000–$9,999';
  } else if (val < 50000) {
    return '10,000–$49,999';
  }
  return '$50,000+';
};

const renderJob = (movieOrCredit: MovieOrCredit) => {
  const movie = movieOrCredit as TMDBMovieWithCredits;
  return movie.jobs && (
  <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
    Roles:
    {' '}
    {movie.jobs.map((j: any) => j.job).join(', ')}
  </div>
  );
};

export default ({ movies, hideExactNumbers = false, extraColumns }: MovieListWithRevenueProps) => {
  const { applyFactor } = useContext(DashboardContext);
  const [extMovies, setExtMovies] = useState<MovieOrCredit[]>();

  const columns = useMemo(() => [
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
      render: (title: string, movie: MovieOrCredit) => (
        <div>
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
          {renderJob(movie)}
        </div>
      ),
    },
    {
      title: 'Pending revenue on WhiteRabbit',
      key: 'revenue',
      render: (r: any, movie: TMDBMovieExtended) => {
        let dollarAmount = movie.revenue ? Web3.utils.fromWei(applyFactor(movie.revenue.total).toString()) : '0';
        if (hideExactNumbers) {
          dollarAmount = vaguelyRangeify(dollarAmount);
        }
        return (
          <Tooltip title="Current revenue on WhiteRabbit pending to be collected by you">
            <span>
              $
              {dollarAmount}
            </span>
          </Tooltip>
        );
      },
    },
  ], [applyFactor, hideExactNumbers]);

  useEffect(() => {
    if (!movies || !movies.length) {
      setExtMovies([]);
      return;
    }

    Promise.all(movies.map((m) => (m.revenue ? m : toExtended(m)))).then(setExtMovies);
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
