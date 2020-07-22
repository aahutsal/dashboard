import { RevenuePerMovie } from '@whiterabbitjs/dashboard-common';
import { THE_GRAPH_API } from '../config';

type RevenuePerMovieResponse = {
  data: {
    revenuePerMovie: RevenuePerMovie;
  }
};

/* eslint-disable-next-line import/prefer-default-export */
export const getRevenuePerMovie = async (movieId: string): Promise<RevenuePerMovieResponse> => {
  const query = `
  {
    revenuePerMovie(id: ${movieId}) {
      id
      total
      revenuePerMovieRegions {
        region
        total
        unclaimed
      }
    }
  }`;

  return fetch(THE_GRAPH_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  }).then((res) => res.json());
};
