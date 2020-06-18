import React, { useState, useContext } from 'react';
import moment from 'moment';
import Web3 from 'web3';
import {
  Table, Spin, Row, Col, Button,
} from 'antd';
import { useParams, useHistory } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import { DashboardContext } from '../components/DashboardContextProvider';
import { GET_MOVIE } from '../apollo/queries';
import AppLayout from './AppLayout';
import PriceForm from './components/PriceForm';
import { PriceInterface } from './components/PriceType';
import humanizeM49 from '../stores/humanizeM49';

export default () => {
  const { IMDB } = useParams();
  const [currentPrice, setCurrentPrice] = useState<PriceInterface>();
  const { data, loading } = useQuery(GET_MOVIE, { variables: { IMDB } });
  const { user } = useContext(DashboardContext);
  const history = useHistory();

  if (!user || !user.isApproved() || !user.ownsMovie(IMDB)) { // TODO:: move to route middleware
    history.push('/');
  }

  const onClearForm = () => {
    setCurrentPrice(undefined);
  };

  const openPriceForm = (record: PriceInterface) => {
    setCurrentPrice({ ...record, IMDB });
  };

  const columns = [
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      render: (code: number) => humanizeM49[code] || 'Any',
    },
    {
      title: 'Medium',
      dataIndex: 'medium',
      key: 'medium',
      render: (medium: string) => medium || 'Any',
    },
    {
      title: 'From',
      dataIndex: 'fromWindow',
      key: 'fromWindow',
      render: (from: string) => (from ? moment(from).format('LL') : '—'),
    },
    {
      title: 'To',
      dataIndex: 'toWindow',
      key: 'toWindow',
      render: (to: string) => (to ? moment(to).format('LL') : '—'),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: string) => (
        <span>
          $
          {Web3.utils.fromWei(text)}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: PriceInterface) => (
        <Button htmlType="button" style={{ marginLeft: 'auto' }} onClick={() => openPriceForm(record)}>Edit</Button>
      ),
    },
  ];

  return (
    <AppLayout>
      <Row gutter={16}>
        <Col className="gutter-row" xs={{ span: 24 }} lg={{ span: 6 }}>
          <img src={(data && data.movie.metadata.posterUrl)} height={300} alt="Movie Poster" />
          <h2>{(data && data.movie.metadata.title)}</h2>
        </Col>
        <Col className="gutter-row" xs={{ span: 24 }} lg={{ span: 18 }}>
          { currentPrice && <PriceForm price={currentPrice} onClear={onClearForm} /> }
          {!currentPrice && (
          <React.Fragment>
            <div style={{ display: 'flex', marginBottom: '14px' }}>
              <Button type="primary" htmlType="button" style={{ marginLeft: 'auto' }} onClick={() => openPriceForm({ IMDB })}>New Price</Button>
            </div>
            <Spin spinning={loading}>
              <Table
                showHeader
                bordered={false}
                dataSource={(data && data.movie.pricing) || []}
                columns={columns}
                pagination={{ pageSize: 40 }}
                rowKey="priceId"
              />
            </Spin>
          </React.Fragment>
          )}
        </Col>
      </Row>
    </AppLayout>
  );
};
