import { Button } from 'antd';
import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { License, MovieExtended } from '../apollo/models';
import { DashboardContext } from '../components/DashboardContextProvider';
import AppLayout from './AppLayout';
import LicenseRestrictions from './components/LicenseRestrictions';
import MovieListWithRevenue from './components/MovieListWithRevenue';


export default () => {
  const { user } = useContext(DashboardContext);

  const movies: MovieExtended[] = useMemo(() => {
    if (!user) return [];
    return user.licenses
      .filter((l) => !!l.movie)
      .map((license: License) => ({
        ...license.movie.metadata,
        license,
      }));
  },
  [user]);

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
        showHeader
        movies={movies}
        extraColumns={[
          {
            title: 'My license',
            key: 'license',
            dataIndex: ['license'],
            render: (license: License) => <LicenseRestrictions license={license} />,
          },
          {
            title: '',
            key: 'action',
            render: (text: string, record: MovieExtended) => (
              <Link to={`/movie/${record.imdbId}`}>Details</Link>
            ),
          },
        ]}
      />
    </AppLayout>
  );
};
