import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import AppLayout from './AppLayout';
import { DashboardContext } from '../components/DashboardContextProvider';
import MovieListWithRevenue from './components/MovieListWithRevenue';

export default () => {
  const { user } = useContext(DashboardContext);
  const history = useHistory();

  if (!user || user.status !== 'APPROVED') {
    history.push('/register');
  }

  const movies = user ? user.movies.map((m) => m.metadata) : [];

  return (
    <AppLayout section="titles">
      <h1>Titles</h1>
      <MovieListWithRevenue movies={movies} />
    </AppLayout>
  );
};
