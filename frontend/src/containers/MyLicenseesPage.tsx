
import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Tag } from 'antd';
import { useQuery } from '@apollo/react-hooks';
import moment from 'moment';
import { CompanyType } from '@whiterabbitjs/dashboard-common';
import AppLayout from './AppLayout';
import { COMPANY_SUBLICENSEES } from '../apollo/queries';

import m49tree from './components/RegionSelectTree/m49-tree.json';
import flattenRegionTree from './components/RegionSelectTree/flattenRegionTree';
import groupRegions from './components/RegionSelectTree/groupRegions';
import { RegionRecord } from './components/RegionSelectTree/types';


const maybeDate = (dateStr?: Date) => (dateStr ? moment(dateStr).format('DD/MM/YYYY') : '');

const m49flat = flattenRegionTree(m49tree);

export default () => {
  const { data, loading } = useQuery(COMPANY_SUBLICENSEES);

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
      render: (regions: string[]) => {
        if (!regions?.length) {
          return <Tag key="001">Global</Tag>;
        }
        const groupedRegions = groupRegions(regions, m49flat);
        return groupedRegions.map(({ key, title }: RegionRecord) => <Tag key={key}>{title}</Tag>);
      },
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
      render: (_: string, record: any) => `${maybeDate(record.fromDate)}—${maybeDate(record.toDate)}`,
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
