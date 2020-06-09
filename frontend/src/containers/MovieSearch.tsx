import React, { useState, useContext } from 'react';
import {
  Form, Input, Button, Table, Spin, Row, Col, DatePicker,
} from 'antd';
import { Store } from 'antd/lib/form/interface';
import { useHistory } from 'react-router-dom';
import AppLayout from './AppLayout';
import MovieForm from './components/MovieForm';
import { getMovieDetails, MovieInterface, searchMovies } from '../stores/API';
import { DashboardContext } from '../components/DashboardContextProvider';

const columns = [
  {
    title: '',
    dataIndex: 'posterPath',
    key: 'posterPath',
    width: 100,
    render: (url: string) => <img src={`https://image.tmdb.org/t/p/w500${url}`} height={150} alt="Movie Poster" />,
  },
  {
    title: 'IMDB ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Name',
    dataIndex: 'title',
    key: 'title',
    render: (title: string, record: any) => (
      <div>
        <h1>{title}</h1>
        <br />
        <p>{record.overview}</p>
      </div>
    ),
  },
  {
    title: 'Year',
    dataIndex: 'year',
    key: 'year',
  },
  {
    title: 'Action',
    key: 'action',
    render: () => (
      <span>Click to Select</span>
    ),
  },
];

export default () => {
  let loading = false;
  const [movie, setMovie] = useState<MovieInterface>();
  const [display, setDisplay] = useState<MovieInterface[]>();
  const { user } = useContext(DashboardContext);
  const history = useHistory();

  if (!user || user.status !== 'APPROVED') { // TODO:: move to route middleware
    history.push('/register');
  }

  const onRow = (record: MovieInterface) => ({
    onClick: async () => {
      const result = await getMovieDetails(record.id);
      setMovie(result);
    },
  });

  const onFinish = async (values: Store) => {
    loading = true;
    setMovie(undefined);
    const title = encodeURI(values.title);
    const year: string = new Date(values.year).getFullYear().toString();
    const results = await searchMovies(values.id, title, year);
    setDisplay(results);
    loading = false;
  };

  return (
    <AppLayout>
      <Row gutter={16}>
        <Col className="gutter-row" xs={{ span: 24 }} lg={{ span: 6 }}>
          <h1>Search for movie</h1>
          <p>You can use IMDB ID if you have the movie ID already</p>
          <Form
            name="search"
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              label="IMDB ID"
              name="id"
            >
              <Input placeholder="IMDB ID" />
            </Form.Item>
            <Form.Item
              label="Movie Title"
              name="title"
            >
              <Input placeholder="Awesome movie title" />
            </Form.Item>
            <Form.Item
              label="Release Year"
              name="year"
            >
              <DatePicker picker="year" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Search</Button>
            </Form.Item>
          </Form>

        </Col>
        <Col className="gutter-row" xs={{ span: 24 }} lg={{ span: 18 }}>
          <Spin spinning={loading}>
            {
              movie
                ? <MovieForm movie={movie} />
                : (
                  <Table
                    onRow={onRow}
                    showHeader={false}
                    bordered={false}
                    dataSource={display}
                    columns={columns}
                    pagination={{ pageSize: 40 }}
                    rowKey="id"
                  />
                )
          }
          </Spin>
        </Col>
      </Row>
    </AppLayout>
  );
};
