import { utils as wrUtils } from '@whiterabbitjs/client';
import { MovieBase } from '@whiterabbitjs/dashboard-common';
import { MovieExtended } from '../apollo/models';
import { getMovieByTMDB } from './API';
import { getRevenuePerMovie } from './theGraph';


const getImdbId = async (movieId: number) => {
  const tmdbMovie = await getMovieByTMDB(movieId);
  return tmdbMovie.imdb_id;
};

/* eslint-disable-next-line import/prefer-default-export */
export const toExtended = async (movie: MovieBase): Promise<MovieExtended> => {
  const extMovie:MovieExtended = movie;

  // skip non-movies
  if (!extMovie.title || extMovie.revenue) return extMovie;

  extMovie.imdbId = extMovie.imdbId || await getImdbId(extMovie.id);
  if (!extMovie.imdbId) return extMovie;

  const tokenId = wrUtils.imdbToToken(extMovie.imdbId);
  const revenue = await getRevenuePerMovie(tokenId);
  if (revenue.data) {
    extMovie.revenue = revenue.data.revenuePerMovie;
  } else {
    // todo: add rollbar/sentry event log
  }
  return extMovie;
};
