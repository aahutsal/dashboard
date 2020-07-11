import React, { useState, useContext, useMemo } from 'react';
import {
  Table, Tooltip, Button, Space,
} from 'antd';
import Web3 from 'web3';
import { TMDBMovieExtended, RevenuePerMovieRegion } from '@whiterabbitjs/dashboard-common';
import { Key, ColumnsType } from 'antd/lib/table/interface';
import humanizeM49 from '../../stores/humanizeM49';
import { claimRevenue } from '../../stores/claimAPI';
import { DashboardContext } from '../../components/DashboardContextProvider';

type MovieRevenueListProps = {
  movie: TMDBMovieExtended;
};


export default ({ movie }: MovieRevenueListProps) => {
  const { applyFactor } = useContext(DashboardContext);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [claiming, setClaiming] = useState<boolean>(false);

  const toUsdString = (value : BigInt | string) => `$${Web3.utils.fromWei(applyFactor(value).toString())}`;

  const columns = useMemo(() => [
    {
      title: 'Region',
      dataIndex: 'region',
      width: '45%',
      key: 'region',
      render: (code: number) => humanizeM49[code] || 'N/A',
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
      render: (unclaimed: string) => (
        <>
          {unclaimed !== '0' && (
            <Tooltip title="Current revenue on WhiteRabbit pending to be collected by you">
              <span>
                {toUsdString(unclaimed)}
              </span>
            </Tooltip>
          )}
          {unclaimed === '0' && '—'}
        </>
      ),
    },
  ] as ColumnsType<RevenuePerMovieRegion>, []);

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: Key[]) => setSelectedRowKeys(selectedKeys),
  };

  const claim = async () => {
    if (!movie.revenue) return;
    setClaiming(true);
    const withRevenue = movie.revenue.revenuePerMovieRegions
      .filter((r) => BigInt(r.unclaimed) > 0)
      .map((r) => r.region);

    await Promise.all(selectedRowKeys.map((region) => {
      if (withRevenue.indexOf(Number(region)) < 0) return null;
      return claimRevenue(movie.imdb_id || '', String(region));
    }));

    setSelectedRowKeys([]);
    setClaiming(false);
  };

  return (
    <div>
      <Table
        rowSelection={rowSelection}
        dataSource={movie.revenue?.revenuePerMovieRegions || []}
        columns={columns}
        bordered={false}
        rowKey="region"
        pagination={false}
        size="small"
        loading={claiming}
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
      <div style={{ textAlign: 'right', marginTop: '14px' }}>
        <Space>
          {selectedRowKeys.length > 0 && `${selectedRowKeys.length} region${selectedRowKeys.length > 1 ? 's' : ''}`}
          {!selectedRowKeys.length && 'All regions'}
          <Button type="primary" disabled={claiming} onClick={claim}>Claim revenue</Button>
        </Space>
      </div>
    </div>
  );
};
