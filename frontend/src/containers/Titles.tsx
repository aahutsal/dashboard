import * as React from 'react';
import AppLayout from './AppLayout/';
import { Table } from 'antd';

const dataSource = [
  {
    key: '1',
    name: 'The Shawshank Redemption',
    poster: 'https://image.tmdb.org/t/p/w300_and_h450_bestv2/avedvodAZUcwqevBfm8p4G2NziQ.jpg',
  },
  {
    key: '2',
    name: 'Pinocchio',
    poster: 'https://image.tmdb.org/t/p/w300_and_h450_bestv2/zXMBkSTiukK7101pXuCg99ywVFn.jpg',
  },
  {
    key: '3',
    name: 'Coco',
    poster: 'https://image.tmdb.org/t/p/w300_and_h450_bestv2/askg3SMvhqEl4OL52YuvdtY40Yb.jpg',
  },
  {
    key: '4',
    name: 'Pulp Fiction',
    poster: 'https://image.tmdb.org/t/p/w300_and_h450_bestv2/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
  },
  {
    key: '5',
    name: 'Gone Girl',
    poster: 'https://image.tmdb.org/t/p/w300_and_h450_bestv2/5Tqdk3eezqu945KcBtz3SYQxidN.jpg',
  },
  {
    key: '6',
    name: 'My Neighbor Totoro',
    poster: 'https://image.tmdb.org/t/p/w300_and_h450_bestv2/fxYazFVeOCHpHwuqGuiqcCTw162.jpg',
  },
];

const columns = [
  {
    title: '',
    dataIndex: 'poster',
    key: 'poster',
    width: 100,
    render: (url: string) => <img src={url} height={150}/>
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
];

export default () => (
  <AppLayout section="titles">
    <h1>Titles</h1>
    <Table showHeader={false} bordered={false} dataSource={dataSource} columns={columns} />;
  </AppLayout>
);