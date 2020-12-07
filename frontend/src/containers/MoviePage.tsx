import React, { useState, useContext, useEffect } from 'react';
import moment from 'moment';
import Web3 from 'web3';
import {
  Table, Spin, Row, Col, Button, Tabs,
} from 'antd';
import { useParams, useHistory } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import { TMDBMovieExtended } from '@whiterabbitjs/dashboard-common';
import Pusher, { Channel } from 'pusher-js';
import { DashboardContext } from '../components/DashboardContextProvider';
import { GET_MOVIE } from '../apollo/queries';
import AppLayout from './AppLayout';
import PriceForm from './components/PriceForm';
import { PriceInterface } from './components/PriceType';
import MovieRevenueList from './components/MovieRevenueList/index';
import { toExtended } from '../stores/movieAPI';
import Section from './components/Section';
import { PUSHER_KEY } from '../config';

import m49tree from './components/RegionSelectTree/m49-tree.json';
import flattenRegionTree from './components/RegionSelectTree/flattenRegionTree';
import groupRegions from './components/RegionSelectTree/groupRegions';
import { RegionRecord } from './components/RegionSelectTree/types';
import MovieSublicensesSection from './components/MovieSublicensesSection';

const m49flat = flattenRegionTree(m49tree);

export default () => {
  const { user, applyFactor } = useContext(DashboardContext);
  const { IMDB } = useParams();
  const [currentPrice, setCurrentPrice] = useState<PriceInterface>();
  const [extendedMovie, setExtendedMovie] = useState<TMDBMovieExtended>();
  const { data, loading } = useQuery(GET_MOVIE, {
    variables: {
      IMDB,
      companyId: user?.company.id,
    },
  });
  const history = useHistory();
  const [pusherChannel, setPusherChannel] = useState<Channel>();

  useEffect(() => {
    if (!data || !data.movie) return;
    toExtended(data.movie.metadata).then(setExtendedMovie);
  }, [data]);

  useEffect(() => {
    if (!extendedMovie || !extendedMovie.imdb_id) return () => { };
    const pusher = new Pusher(PUSHER_KEY, { cluster: 'eu' });
    const channel = pusher.subscribe(extendedMovie.imdb_id);
    setPusherChannel(channel);
    return () => {
      channel?.unsubscribe();
      pusher.disconnect();
    };
  }, [extendedMovie]);

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
      title: 'Regions',
      dataIndex: 'regions',
      key: 'regions',
      render: (regions: string[]) => (regions ? groupRegions(regions, m49flat).map(({ title }: RegionRecord) => title).join(', ') : 'Global'),
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
          {Web3.utils.fromWei(applyFactor(text).toString())}
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
          {data && (
            <h2>
              {data.movie.metadata.title}
              {' ('}
              {data.movie.metadata.year}
              )
            </h2>
          )}
        </Col>
        <Col className="gutter-row" xs={{ span: 24 }} lg={{ span: 18 }}>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="Revenue" key="1">
              <Section>
                <h2>Revenue</h2>
                {extendedMovie && pusherChannel
                  && <MovieRevenueList movie={extendedMovie} pusherChannel={pusherChannel} />}
              </Section>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Prices" key="2">
              <Section>
                {currentPrice && <PriceForm price={currentPrice} onClear={onClearForm} />}
                {!currentPrice && (
                  <>
                    <div style={{ display: 'flex', marginBottom: '14px' }}>
                      <h2>Prices</h2>
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
                  </>
                )}
              </Section>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Sublicenses" key="3">
              <MovieSublicensesSection movieId={IMDB} licenses={data && data.movie.licenses} />
            </Tabs.TabPane>
          </Tabs>

        </Col>
      </Row>
    </AppLayout>
  );
};
