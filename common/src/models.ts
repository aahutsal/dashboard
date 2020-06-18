
export enum UserRole {
  ADMIN = "ADMIN",
  RIGHTSHOLDER = "RIGHTSHOLDER",
}

export enum ApprovalStatus {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

export enum PendingStatus {
  USER = "Pending#USER",
  MOVIE = "Pending#MOVIE"
}

export type RevenuePerMovieRegion = {
  region: number;
  total: BigInt;
};

export type RevenuePerMovie = {
  id: string;
  total: BigInt;
  revenuePerMovieRegions: [RevenuePerMovieRegion]
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

export type TMDBMovieCredit = TMDBMovie & {
  department: string;
  credit_id: string;
};

export type Movie = {
  IMDB?: string;
  metadata: TMDBMovieExtended;
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
    return this.status === ApprovalStatus.APPROVED 
  }

  ownsMovie(imdbId: string) {
    return !!this.movies.find(m => m.IMDB === imdbId);
  }
};
