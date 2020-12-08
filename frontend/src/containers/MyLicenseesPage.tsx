
import React from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'antd';
import { useQuery } from '@apollo/react-hooks';
import { CompanyType } from '@whiterabbitjs/dashboard-common';
import AppLayout from './AppLayout';
import { COMPANY_SUBLICENSEES } from '../apollo/queries';

import RegionTags from './components/RegionTags';
import Timeframe from './components/Timeframe';


export default () => {
  const { data, loading } = useQuery(COMPANY_SUBLICENSEES, { fetchPolicy: 'network-only' });

  const columns = [
    {
      title: 'Movie',
      dataIndex: ['movie', 'metadata', 'title'],
      key: 'movie',
      render: (title: string, record: any) => <Link to={`/movie/${record.movieId}`}>{title}</Link>,
    },
    {
      title: 'Regions',
      dataIndex: 'regions',
      key: 'regions',
      render: (regions: string[]) => <RegionTags regions={regions} />,
    },
    {
      title: 'Company',
      dataIndex: ['company', 'name'],
      key: 'companyName',
    },
    {
      title: 'Kind of Company',
      dataIndex: ['company', 'kind'],
      key: 'kind',
      render: (kind: string) => (CompanyType as any)[kind],
    },
    {
      title: 'Licensed Medium',
      dataIndex: 'medium',
      key: 'medium',
    },
    {
      title: 'Time window',
      dataIndex: 'fromDate',
      key: 'window',
      render: (_: string, record: any) => <Timeframe from={record.fromDate} to={record.toDate} />,
    },
  ];

  return (
    <AppLayout section="sublicensees">
      <div style={{ display: 'flex', marginBottom: '14px' }}>
        <h1>My Sublicensees</h1>
      </div>
      <Table
        dataSource={data?.companySublicensees}
        columns={columns}
        loading={loading}
        bordered={false}
        rowKey="licenseId"
      />

    </AppLayout>
  );
};
