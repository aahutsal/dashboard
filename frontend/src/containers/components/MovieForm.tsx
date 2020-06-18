import React, { FC, useContext, useEffect } from 'react';
import {
  Alert, Button, Form, Input, Row, Col,
} from 'antd';
import { Store } from 'antd/lib/form/interface';
import { useMutation } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';
import DynamicFieldSet from './DynamicField';
import { GET_USER } from '../../apollo/queries';
import { ADD_MOVIE } from '../../apollo/mutations';
import { DashboardContext } from '../../components/DashboardContextProvider';
import { MovieInterface } from '../../stores/API';
import humanizeError from '../../stores/utils/humanizeError';

interface ComponentProps {
  movie: MovieInterface
}


const MovieForm: FC<ComponentProps> = ({ movie }) => {
  const history = useHistory();
  const { account } = useContext(DashboardContext);
  const [addMovie, { error }] = useMutation(ADD_MOVIE);

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(movie);
  }, [movie, form]);

  const onFinish = async (values: Store) => {
    addMovie({
      variables: {
        movie: {
          IMDB: values.id.toString(),
          record: {
            source: 'themoviedb',
            value: movie.details, // TODO:: switch to values once edit is enabled
          },
        },
      },
      refetchQueries: [{
        query: GET_USER,
        variables: { accountAddress: account },
      }],
    })
      .then(() => history.push('/'))
      .catch(() => {});
  };

  return (
    <div>
      <h1>Add movie</h1>
      { error && <Alert type="error" message={humanizeError(error)} />}
      <Form
        form={form}
        name="add"
        layout="vertical"
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col className="gutter-row" xs={{ span: 24 }} lg={{ span: 12 }}>
            <img src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} height={250} alt="Movie Poster" />
          </Col>
          <Col className="gutter-row" xs={{ span: 24 }} lg={{ span: 12 }}>
            <Form.Item
              label="IMDB ID"
              name="id"
            >
              <Input placeholder="IMDB ID" disabled />
            </Form.Item>
            <Form.Item
              label="Movie Title"
              name="title"
            >
              <Input placeholder="Awesome movie title" disabled />
            </Form.Item>
            <Form.Item
              label="Release Year"
              name="year"
            >
              <Input placeholder="2020" disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col className="gutter-row" xs={{ span: 24 }} lg={{ span: 8 }}>
            <Form.Item
              label="Director"
              name="director"
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="Producer"
              name="producer"
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col className="gutter-row" xs={{ span: 24 }} lg={{ span: 8 }}>
            <DynamicFieldSet name="actors" label="Actors" />
          </Col>
          <Col className="gutter-row" xs={{ span: 24 }} lg={{ span: 8 }}>
            <DynamicFieldSet name="productionCompanies" label="Production Companies" />
          </Col>
        </Row>
        <Form.Item>
          <div style={{ display: 'flex' }}>
            <Button type="primary" htmlType="submit" style={{ marginLeft: 'auto' }}>Submit Movie</Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default MovieForm;
