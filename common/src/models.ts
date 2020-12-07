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
  metadata: TMDBMovieExtended;
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

  movies: Movie[] = [];

  company!: Company;

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

  isProducer(): boolean {
    return this.company && this.company.kind === 'PRODUCTION';
  }

  isApproved(): boolean {
    return this.status === ApprovalStatus.APPROVED;
  }

  ownsMovie(imdbId: string) {
    return !!this.movies.find((m) => m.IMDB === imdbId);
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

export type License = {
  licenseId?: string;
  movieId: string;
  companyId: string;
  regions?: string[];
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
