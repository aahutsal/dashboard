import React, { useState, useEffect } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { User, TMDBMovie } from '@whiterabbitjs/dashboard-common';
import AppLayout from '../AppLayout';
import { getPersonCredits } from '../../stores/API';
import MovieListWithRevenue from './MovieListWithRevenue';

export type PendingUserScreenProps = {
  user: User;
};

export default ({ user }: PendingUserScreenProps) => {
  const [movies, setMovies] = useState<TMDBMovie[]>();

  useEffect(() => {
    getPersonCredits(user.id).then(setMovies);
  }, [user]);

  return (
    <AppLayout section="register">
      <Alert
        message="Pending identity verification"
        description="Sit tight, Alan will contact you soon to verify your identity."
        type="warning"
        showIcon
        icon={<ClockCircleOutlined />}
        style={{ width: 400 }}
      />
      {movies && (
        <div style={{ marginTop: '2rem', maxWidth: '600px' }}>
          <h2>Pending revenue on WhiteRabbit</h2>
          <MovieListWithRevenue movies={movies} />
        </div>
      )}

    </AppLayout>
  );
};
