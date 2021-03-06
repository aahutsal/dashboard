// TODO: rename to tmdbApi
import { notification } from 'antd';
import {
  TMDBPerson, TMDBMovieWithCredits, TMDBCompany, TMDBMovie,
} from '@whiterabbitjs/dashboard-common';

const config = {
  theMovieDbApiKey: 'b1854cc7cd8f2e29da75a04a3c946e44',
};

// TODO: Merge together with TMDBMovie and Movie from `dashboard-common`
export type MovieInterface = {
  id: string,
  imdbId?: string,
  title: string;
  posterPath: string;
  overview?: string;
  director?: string;
  producer?: Array<any>;
  author?: string;
  writing?: Array<any>;
  sound?: Array<any>;
  actors?: Array<any>;
  productionCompanies?: Array<any>;
  rating: string;
  year: string;
  apiResponse?: string;
};

// TODO: reuse this API from @whiterabbitjs/client
export const getMovieDetails = async (imdbId: string): Promise<MovieInterface> => {
  const [details, credits] = await Promise.all([
    fetch(
      `https://api.themoviedb.org/3/movie/${imdbId}?api_key=${config.theMovieDbApiKey}`,
    ).then((resp) => resp.json()),
    fetch(
      `https://api.themoviedb.org/3/movie/${imdbId}/credits?api_key=${config.theMovieDbApiKey}`,
    ).then((resp) => resp.json()),
  ]);

  if (details.status_code === 34 || credits.status_code === 34) {
    throw Error(`Movie record for id ${imdbId} was not found.`);
  }

  const { cast, crew } = credits;

  const producer = crew.filter((c: any) => c.job === 'Producer');
  const director = crew.find((c: any) => c.job === 'Director');
  const writing = crew.filter((c: any) => c.department === 'Writing');
  const sound = crew.filter((c: any) => c.department === 'Sound');
  const year = details.release_date ? details.release_date.slice(0, 4) : '';

  return {
    id: details.id,
    imdbId: details.imdb_id,
    title: details.title,
    posterPath: details.poster_path,
    producer,
    director: director ? director.name : '',
    actors: cast,
    writing,
    sound,
    productionCompanies: details.production_companies,
    overview: details.overview,
    rating: details.vote_average,
    year,
    apiResponse: JSON.stringify({ ...details, crew, cast }),
  };
};


/**
 * Search for the person buy given `partOfTheName` in themoviedb.org database.
 * NOTE: some people don't have IMDB id in themoviedb.org. Use unofficial `searchPersonInIMDB`
 * in this case
 * @param partOfTheName String — part of the person name to search for
 */
export const searchPerson = async (partOfTheName: string): Promise<TMDBPerson[]> => {
  if (!partOfTheName) return [];
  const searchResult = await fetch(
    `https://api.themoviedb.org/3/search/person?api_key=${config.theMovieDbApiKey}&query=${partOfTheName}&page=1&include_adult=false`,
  ).then((resp) => resp.json());

  return searchResult.results;
};

export const getPersonByTMDB = async (tmdbId: number): Promise<TMDBPerson> => {
  const searchResult = await fetch(
    `https://api.themoviedb.org/3/person/${tmdbId}?api_key=${config.theMovieDbApiKey}`,
  ).then((resp) => resp.json());

  return searchResult.status_code === 34 ? null : searchResult;
};

export const getPersonCredits = async (tmdbId: number): Promise<TMDBMovieWithCredits[]> => {
  const searchResult = await fetch(
    `https://api.themoviedb.org/3/person/${tmdbId}/movie_credits?api_key=${config.theMovieDbApiKey}`,
  ).then((resp) => resp.json());

  const { cast, crew } = searchResult;

  const jobsByMovie = [...cast, ...crew].reduce((res, credit) => {
    const movie = res[credit.id] || credit;
    const { job, department } = credit;
    movie.jobs = movie.jobs || [];
    movie.jobs.push({ job: job || 'Actor', department });
    res[credit.id] = movie;
    return res;
  }, {});

  return Object.values(jobsByMovie);
};

export const getPersonByIMDBId = async (imdbId: string): Promise<TMDBPerson> => {
  const searchResult = await fetch(
    `https://api.themoviedb.org/3/find/${imdbId}?api_key=${config.theMovieDbApiKey}&external_source=imdb_id`,
  ).then((resp) => resp.json());

  return searchResult.person_results.length ? searchResult.person_results[0] : null;
};

export const getMovieByTMDB = async (tmdbId: number) => {
  const searchResult = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${config.theMovieDbApiKey}`,
  ).then((resp) => resp.json());

  return searchResult.status_code === 34 ? null : searchResult;
};

export const searchCompanies = async (name: string): Promise<TMDBCompany[]> => {
  const searchResult = await fetch(
    `https://api.themoviedb.org/3/search/company?api_key=${config.theMovieDbApiKey}&query=${name}`,
  ).then((resp) => resp.json());

  if (searchResult.status_message) {
    // todo: add rollbar/sentry event log
    return [];
  }

  return searchResult.results;
};

export const getCompanyMovies = async (companyId: string): Promise<TMDBMovie[]> => {
  // shortcut for custom companies which have non-integer IDs
  if (!parseInt(companyId, 10)) return [];

  const searchResult = await fetch(
    `https://api.themoviedb.org/3/discover/movie?api_key=${config.theMovieDbApiKey}&with_companies=${companyId}`,
  ).then((resp) => resp.json());

  if (searchResult.status_message) {
    // todo: add rollbar/sentry event log
    return [];
  }

  return searchResult.results;
};

export const searchMovies = async (id: string, title: string, year: string)
: Promise<MovieInterface[]> => {
  const raw : MovieInterface[] = [];
  if (id !== undefined && id !== '') {
    try {
      const withID = await getMovieDetails(id);
      raw.push(withID);
    } catch (e) {
      notification.open({
        message: 'Notification',
        description: e.message,
      });
    }
  }

  if (title !== 'undefined' && title !== '') {
    const { results } = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${config.theMovieDbApiKey}&query=${title}&year=${year}`,
    ).then((resp) => resp.json())
      .catch(() => { });

    for (let index = 0; index < results.length; index += 1) {
      const current = results[index];
      raw.push({
        id: current.id,
        title: current.original_title,
        overview: current.overview,
        posterPath: current.poster_path,
        year: current.release_date ? current.release_date.slice(0, 4) : '',
        rating: current.vote_average,
      });
    }
  }

  return raw;
};
