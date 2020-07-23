import React, {
  useState, useContext, useMemo, useEffect, useRef,
} from 'react';
import {
  Table, Tooltip, Button, Space,
} from 'antd';
import Web3 from 'web3';
import { TMDBMovieExtended, RevenuePerMovieRegion } from '@whiterabbitjs/dashboard-common';
import { Key, ColumnsType } from 'antd/lib/table/interface';
import { Channel } from 'pusher-js';
import humanizeM49 from '../../../stores/humanizeM49';
import { claimRevenue } from '../../../stores/claimAPI';
import { DashboardContext } from '../../../components/DashboardContextProvider';
import MovieRevenueClaimProgress from './MovieRevenueClaimProgress';
import { Claims, ClaimStatus } from './types';

type MovieRevenueListProps = {
  movie: TMDBMovieExtended;
  pusherChannel: Channel;
};

export default ({ movie, pusherChannel }: MovieRevenueListProps) => {
  const { applyFactor } = useContext(DashboardContext);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [claims, setClaims] = useState<Claims>({});
  const cl = useRef<Claims>({});

  if (!movie.revenue) return <></>;

  const withRevenue = movie.revenue.revenuePerMovieRegions
    .filter((r) => BigInt(r.unclaimed) > 0)
    .map((r) => r.region);

  const toUsdString = useMemo(() => ((value : BigInt | string) => `$${Web3.utils.fromWei(applyFactor(value).toString())}`),
    [applyFactor]);

  const columns = useMemo(() => [
    {
      title: 'Region',
      dataIndex: 'region',
      width: '45%',
      key: 'region',
      render: (code: number) => humanizeM49(code) || 'N/A',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      width: '25%',
      align: 'right' as any,
      key: 'total',
      render: (total: string) => toUsdString(total),
    },
    {
      title: 'Unclaimed',
      dataIndex: 'unclaimed',
      width: '25%',
      align: 'right' as any,
      key: 'unclaimed',
      render: (unclaimed: string, record: RevenuePerMovieRegion) => {
        const claimed = unclaimed === '0' || (claims[record.region] && claims[record.region].status === ClaimStatus.SUCCESS);
        if (!claimed) {
          return (
            <Tooltip title="Current revenue on WhiteRabbit pending to be collected by you">
              <span>
                {toUsdString(unclaimed)}
              </span>
            </Tooltip>
          );
        }
        return '—';
      },
    },
  ] as ColumnsType<RevenuePerMovieRegion>, [toUsdString, claims]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: Key[]) => setSelectedRowKeys(selectedKeys),
  };

  useEffect(() => {
    if (!pusherChannel) return () => {};
    pusherChannel.bind('revenue-claim', ({ regionId, result, txHash }: any) => {
      const status = result === 1 ? ClaimStatus.SUCCESS : ClaimStatus.FAILED;
      cl.current = {
        ...cl.current,
        [regionId]: { status, txHash },
      };
      setClaims(cl.current);
    });
    return () => {
      pusherChannel.unbind('revenue-claim');
    };
  }, [pusherChannel]);

  const claim = async () => {
    cl.current = selectedRowKeys.reduce((_claims, region) => {
      if (withRevenue.indexOf(Number(region)) < 0) return _claims;
      _claims[region] = { status: ClaimStatus.PENDING }; // eslint-disable-line no-param-reassign
      return _claims;
    }, {} as Claims);
    setClaims(cl.current);

    await Promise.all(selectedRowKeys.map((region) => {
      if (withRevenue.indexOf(Number(region)) < 0) return null;
      return claimRevenue(movie.imdb_id || '', String(region));
    }));

    setSelectedRowKeys([]);
  };

  const claiming = !!Object.keys(claims).length;
  const hasPendingClaims = !!Object.values(claims)
    .find(({ status }) => status === ClaimStatus.PENDING);

  const anythingToClaim = withRevenue.length > 0 && selectedRowKeys.length > 0
    && withRevenue.find((region) => selectedRowKeys.includes(region));

  return (
    <div>
      <Table
        rowSelection={rowSelection}
        dataSource={movie.revenue.revenuePerMovieRegions || []}
        columns={columns}
        bordered={false}
        rowKey="region"
        pagination={false}
        size="small"
        summary={(pageData) => {
          const summary = pageData.reduce((s, r) => {
            s.total += BigInt(r.total); // eslint-disable-line no-param-reassign
            s.unclaimed += BigInt(r.unclaimed); // eslint-disable-line no-param-reassign
            return s;
          }, { total: BigInt(0), unclaimed: BigInt(0) });

          return (
            <Table.Summary.Row style={{ backgroundColor: '#fcfcfc', borderBottom: 0 }}>
              <Table.Summary.Cell colSpan={2} index={1}>
                <div style={{ textAlign: 'right', opacity: 0.8 }}>Grand Total</div>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}>
                <div style={{ textAlign: 'right' }}>
                  {toUsdString(summary.total)}
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3}>
                <div style={{ textAlign: 'right', fontSize: '1.1rem' }}>
                  {toUsdString(summary.unclaimed)}
                </div>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
      {claiming && <MovieRevenueClaimProgress claims={claims} />}
      <div style={{ textAlign: 'right', marginTop: '14px' }}>
        <Space>
          {selectedRowKeys.length > 0 && `${selectedRowKeys.length} region${selectedRowKeys.length > 1 ? 's' : ''}`}
          {!selectedRowKeys.length && 'Select regions to claim revenues for'}
          <Button type="primary" disabled={!anythingToClaim || hasPendingClaims} onClick={claim}>Claim revenue</Button>
        </Space>
      </div>
    </div>
  );
};
