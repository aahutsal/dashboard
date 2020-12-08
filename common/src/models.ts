export type Config = {
  factor: number;
};

export enum UserRole {
  ADMIN = 'ADMIN',
  RIGHTSHOLDER = 'RIGHTSHOLDER',
}

export enum ApprovalStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

export type RevenuePerMovieRegion = {
  region: number;
  total: BigInt;
  unclaimed: BigInt;
};

export type RevenuePerMovie = {
  id: string;
  total: BigInt;
  revenuePerMovieRegions: [RevenuePerMovieRegion];
};

interface TMDBEvent {
  first_air_date?: string;
  name?: string;
}

export interface TMDBPerson {
  id: number;
  name: string;
  imdb_id?: string;
  profile_path?: string;
  known_for_department: string;
  known_for: [TMDBMovie & TMDBEvent];
}

export interface TMDBCompany {
  id: string;
  name: string;
}

// TODO: cleanup the types for Movie
export type MovieBase = {
  id: number;
  imdbId: string;
  title: string;
  year: string;
  posterUrl: string;
};

// TODO: Merge together with MovieInterface
export type TMDBMovie = {
  poster_path: string;
  id: number;
  imdb_id?: string;
  title: string;
  release_date: string;
  overview?: string;
  vote_average: string;
};

export type TMDBMovieExtended = TMDBMovie & {
  posterUrl?: string;
  production_companies?: any[];
  revenue?: RevenuePerMovie;
};

export type TMDBMovieWithCredits = TMDBMovieExtended & {
  jobs: { job: string; department?: string }[];
};

export type Movie = {
  IMDB?: string;
  metadata: MovieBase;
};

export type Company = {
  id: string;
  name: string;
  kind: string;
};

export class User {
  accountAddress!: string;

  name!: string;

  id!: number;

  imdbId!: string;

  email!: string;

  status!: ApprovalStatus;

  pendingStatus!: string;

  roles: UserRole[] = [];

  constructor(seed?: object) {
    if (seed) {
      Object.assign(this, seed);
    }
  }

  isRightsHolder(): boolean {
    return this.isApproved() && this.roles.indexOf(UserRole.RIGHTSHOLDER) >= 0;
  }

  isAdmin(): boolean {
    return this.isApproved() && this.roles.indexOf(UserRole.ADMIN) >= 0;
  }

  isApproved(): boolean {
    return this.status === ApprovalStatus.APPROVED;
  }
}

export enum CompanyType {
  PRODUCTION = 'Production',
  SALES = 'Sales',
  DISTRIBUTION = 'Distribution',
  FINANCING = 'Financing',
  PUBLIC_INSTITUION = 'Public Institution',
  OTHER = 'Other',
}

export const toCompanyType = (type: string) => (CompanyType as any)[type];

export type License = {
  licenseId?: string;
  movieId: string;
  companyId: string;
  regions?: string[];
  medium?: Medium;
  fromDate?: Date;
  toDate?: Date;
};

export enum Medium {
  THEATER = 'THEATER',
  EST = 'EST',
  DTR = 'DTR',
  PAYTV = 'PAYTV',
  SVOD = 'SVOD',
  FREETV = 'FREETV',
}

export const movieFromTMDB = (tmdbMovie: TMDBMovie): MovieBase => ({
  id: tmdbMovie.id,
  title: tmdbMovie.title,
  imdbId: tmdbMovie.imdb_id || '',
  posterUrl: `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`,
  year: tmdbMovie.release_date ? tmdbMovie.release_date.slice(0, 4) : '',
});
