import { utils as wrUtils } from '@whiterabbitjs/client';
import { TMDBMovie, TMDBMovieExtended } from '@whiterabbitjs/dashboard-common';
import { getMovieByTMDB } from './API';
import { getRevenuePerMovie } from './theGraph';

/* eslint-disable-next-line import/prefer-default-export */
export const toExtended = async (movie: TMDBMovie): Promise<TMDBMovieExtended> => {
  const extMovie:TMDBMovieExtended = movie;

  extMovie.posterUrl = extMovie.posterUrl || `https://image.tmdb.org/t/p/w500${extMovie.poster_path}`;

  // skip non-movies
  if (!movie.title) return extMovie;

  const { imdb_id: imdbId } = await getMovieByTMDB(movie.id);
  if (!imdbId) return extMovie;

  extMovie.imdb_id = imdbId;
  const tokenId = wrUtils.imdbToToken(imdbId);
  const revenue = await getRevenuePerMovie(tokenId);
  if (revenue.data) {
    extMovie.revenue = revenue.data.revenuePerMovie;
  } else {
    // todo: add rollbar/sentry event log
  }
  return extMovie;
};
