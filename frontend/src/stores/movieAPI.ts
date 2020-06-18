import { utils as wrUtils } from '@whiterabbitjs/client';
import { TMDBMovie, TMDBMovieExtended, getMovieByTMDB } from './API';
import { getRevenuePerMovie } from './theGraph';

/* eslint-disable-next-line import/prefer-default-export */
export const withRevenue = async (movie: TMDBMovie): Promise<TMDBMovieExtended> => {
  const extMovie:TMDBMovieExtended = movie;

  // skip non-movies
  if (!movie.title) return extMovie;

  const { imdb_id: imdbId } = await getMovieByTMDB(movie.id);
  if (!imdbId) return extMovie;

  extMovie.imdb_id = imdbId;
  const tokenId = wrUtils.imdbToToken(imdbId);
  extMovie.revenue = (await getRevenuePerMovie(tokenId)).data.revenuePerMovie;
  return extMovie;
};
