import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import AppLayout from './AppLayout';
import { DashboardContext } from '../components/DashboardContextProvider';
import MovieListWithRevenue from './components/MovieListWithRevenue';

export default () => {
  const { user } = useContext(DashboardContext);

  const movies = user ? user.movies.map((m) => m.metadata) : [];

  return (
    <AppLayout section="movies">
      <div style={{ display: 'flex', marginBottom: '14px' }}>
        <h1>My Movies</h1>
        {user?.isProducer() && (
        <Button type="primary" style={{ marginLeft: 'auto' }}>
          <Link to="/add_movie">Add Movie</Link>
        </Button>
)}
      </div>
      <MovieListWithRevenue
        movies={movies}
        extraColumns={[
          {
            title: 'Action',
            key: 'action',
            render: (text: string, record: any) => (
              <Link to={`/movie/${record.imdb_id}`}>Details</Link>
            ),
          },
        ]}
      />
    </AppLayout>
  );
};
