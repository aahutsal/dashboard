import React, { useState, useEffect } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { MovieBase, movieFromTMDB } from '@whiterabbitjs/dashboard-common';
import { getCompanyMovies } from '../../stores/API';
import MovieListWithRevenue from './MovieListWithRevenue';
import { User } from '../../apollo/models';

export type PendingUserScreenProps = {
  user: User;
};

export default ({ user }: PendingUserScreenProps) => {
  const [movies, setMovies] = useState<MovieBase[]>();

  useEffect(() => {
    getCompanyMovies(user.company.id)
      .then((tmdbMovies) => setMovies(tmdbMovies.map(movieFromTMDB)));
  }, [user]);

  return (
    <>
      <Alert
        message="Pending identity verification"
        description="Sit tight, a third party verification process has started. We will get back to you soon."
        type="warning"
        showIcon
        icon={<ClockCircleOutlined />}
        style={{ width: 400 }}
      />
      {movies && (
        <div style={{ marginTop: '2rem', maxWidth: '600px' }}>
          <h2>Pending revenue on WhiteRabbit</h2>
          <MovieListWithRevenue movies={movies} hideExactNumbers />
        </div>
      )}
    </>
  );
};
