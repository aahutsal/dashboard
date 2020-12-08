import React, {
  useEffect, useState, useContext, useMemo,
} from 'react';
import { Table, Tooltip } from 'antd';
import Web3 from 'web3';
import { ColumnType } from 'antd/lib/table';
import { toExtended } from '../../stores/movieAPI';
import { DashboardContext } from '../../components/DashboardContextProvider';
import { MovieExtended } from '../../apollo/models';

type MovieListWithRevenueProps = {
  movies: MovieExtended[];
  hideExactNumbers?: boolean;
  extraColumns?: ColumnType<MovieExtended>[];
  showHeader?: boolean;
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

export default ({
  movies, showHeader, hideExactNumbers = false, extraColumns,
}: MovieListWithRevenueProps) => {
  const { applyFactor } = useContext(DashboardContext);
  const [extMovies, setExtMovies] = useState<MovieExtended[]>([]);

  const columns = useMemo(() => [
    {
      title: '',
      dataIndex: 'posterUrl',
      key: 'posterUrl',
      width: 50,
      render: (url: string, movie: MovieExtended) => <img src={url} height={50} alt={movie.title} />,
    },
    {
      title: '',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, movie: MovieExtended) => (
        <div>
          <div>
            {title}
            {movie.year && (
            <React.Fragment>
              {' '}
              (
              {movie.year}
              )
            </React.Fragment>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Pending revenue',
      key: 'revenue',
      align: 'right' as any,
      render: (r: any, movie: MovieExtended) => {
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

    Promise.all(movies.map(toExtended)).then(setExtMovies);
  }, [movies]);

  return (
    <Table
      dataSource={extMovies}
      columns={[...columns, ...(extraColumns || [])]}
      showHeader={showHeader}
      loading={!extMovies}
      bordered={false}
      rowKey="id"
      pagination={false}
    />
  );
};
