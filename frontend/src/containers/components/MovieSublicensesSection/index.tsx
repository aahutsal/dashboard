import { Company, License } from '@whiterabbitjs/dashboard-common';
import { Button, Table } from 'antd';
import moment from 'moment';
import React, { useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import Section from '../Section';
import SublicenseForm from './sublicenseForm';
import { DISTRIBUTORS } from '../../../apollo/queries';
import RegionTags from '../RegionTags';

type MovieSublicensesSectionProps = {
  movieId: string;
  licenses: License[];
};


const MovieSublicensesSection: React.FC<MovieSublicensesSectionProps> = ({ movieId, licenses }) => {
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const { data: distrCompanies } = useQuery(DISTRIBUTORS);
  const [license, setLicense] = useState<License>();

  const columns = [
    {
      title: 'Company',
      dataIndex: 'companyId',
      key: 'companyId',
      render: (companyId: string) => {
        if (!distrCompanies) return '';
        return (distrCompanies.distributors.find((c: Company) => companyId === c.id) || {}).name;
      },
    },
    {
      title: 'Regions',
      dataIndex: 'regions',
      key: 'regions',
      render: (regions: string[]) => <RegionTags regions={regions} />,
    },
    {
      title: 'Medium',
      dataIndex: 'medium',
      key: 'medium',
      render: (medium: string) => medium || 'Any',
    },
    {
      title: 'From',
      dataIndex: 'fromDate',
      key: 'fromDate',
      render: (from: string) => (from ? moment(from).format('LL') : '—'),
    },
    {
      title: 'To',
      dataIndex: 'toDate',
      key: 'toDate',
      render: (to: string) => (to ? moment(to).format('LL') : '—'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: License) => (
        <Button
          type="link"
          onClick={() => {
            setLicense(record);
            setFormVisible(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Section>
      <div style={{ display: 'flex', marginBottom: '14px' }}>
        <h2>Licenses</h2>
        <Button
          type="primary"
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            setLicense(undefined);
            setFormVisible(true);
          }}
        >
          Add Sublicense
        </Button>
      </div>
      {formVisible && (
        <SublicenseForm
          movieId={movieId}
          license={license}
          onCancel={() => setFormVisible(false)}
          onSave={() => setFormVisible(false)}
        />
      )}
      <Table
        showHeader
        bordered={false}
        dataSource={licenses || []}
        columns={columns}
        pagination={{ pageSize: 15 }}
        rowKey="licenseId"
      />
    </Section>
  );
};

export default MovieSublicensesSection;
