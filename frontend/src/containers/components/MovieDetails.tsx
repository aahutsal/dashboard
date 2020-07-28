import React, { FC, useContext, ReactNode } from 'react';
import {
  Alert, Button, Col, Row, notification,
} from 'antd';
import { useMutation } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';
import { GET_USER } from '../../apollo/queries';
import { ADD_MOVIE } from '../../apollo/mutations';
import { DashboardContext } from '../../components/DashboardContextProvider';
import { MovieInterface } from '../../stores/API';
import humanizeError from '../../stores/utils/humanizeError';
import CreditList from './CreditList';
import Section from './Section';

interface ComponentProps {
  movie: MovieInterface
}

const Detail = ({ label, children }: { label: string, children: ReactNode }) => (
  <Row style={{ padding: '3px 0' }}>
    <Col span={10} style={{ fontWeight: 'bold' }}>
      {label}
      :
      {' '}
    </Col>
    <Col span={14}>{children}</Col>
  </Row>
);

const MovieDetails: FC<ComponentProps> = ({ movie }) => {
  const history = useHistory();
  const { account } = useContext(DashboardContext);
  const [addMovie, { error }] = useMutation(ADD_MOVIE);

  const onSubmit = () => {
    if (movie.imdbId && movie.imdbId.startsWith('tt')) { // only add if imdb exists
      addMovie({
        variables: {
          movie: {
            id: movie.id, // TMDB ID
            IMDB: movie.imdbId,
            record: {
              source: 'themoviedb',
              value: movie.apiResponse, // TODO:: switch to edited form values once edit is enabled
            },
          },
        },
        refetchQueries: [{
          query: GET_USER,
          variables: { accountAddress: account },
        }],
      })
        .then(() => history.push('/'))
        .catch(() => { });
    } else {
      notification.open({
        message: 'Notification',
        description: 'Please ensure movie exists on IMDB. Kindly Search Again',
      });
    }
  };

  return (
    <>
      <Section>
        <h1>Add movie</h1>
        {error && <Alert type="error" message={humanizeError(error)} />}
        <Row gutter={[24, 24]}>
          <Col flex="1 1 200px">
            <img src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} height={250} alt="Movie Poster" />
          </Col>
          <Col flex="1 1 400px">
            <Detail label="IMDB ID">{movie.imdbId}</Detail>
            <Detail label="Title">{movie.title}</Detail>
            <Detail label="Release Year">{movie.year}</Detail>
            <Detail label="Director">{movie.director}</Detail>
          </Col>
        </Row>
      </Section>
      <Section>

        <CreditList
          avatar="profile_path"
          data={movie.producer}
          header="Producers"
        />

        <CreditList
          avatar="profile_path"
          data={movie.writing}
          header="Writers"
          label="job"
        />

        <CreditList
          avatar="profile_path"
          data={movie.sound}
          header="Composers"
          label="job"
        />

        <CreditList
          avatar="profile_path"
          data={movie.actors}
          header="Actors"
          label="character"
        />

        <CreditList
          avatar="logo_path"
          data={movie.productionCompanies}
          header="Production Companies"
        />

        <div style={{ display: 'flex' }}>
          <Button type="primary" style={{ marginLeft: 'auto' }} onClick={() => onSubmit()}>Submit Movie</Button>
        </div>
      </Section>
    </>
  );
};

export default MovieDetails;
