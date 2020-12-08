import {
  MovieBase, Company, License as BaseLicense, User as BaseUser, RevenuePerMovie, Movie, CompanyType, toCompanyType,
} from '@whiterabbitjs/dashboard-common';

export type License = BaseLicense & {
  movie: Movie;
};

export type MovieExtended = MovieBase & {
  license?: License;
  revenue?: RevenuePerMovie;
};

export class User extends BaseUser {
  movies: MovieBase[] = [];

  licenses: License[] = [];

  company!: Company;

  isProducer(): boolean {
    return this.company && toCompanyType(this.company.kind) === CompanyType.PRODUCTION;
  }

  isSales(): boolean {
    return this.company && toCompanyType(this.company.kind) === CompanyType.SALES;
  }

  isDistributor(): boolean {
    return this.company && toCompanyType(this.company.kind) === CompanyType.DISTRIBUTION;
  }

  licensedRegions(givenMovieId: string): string[] | null {
    if (!this.licenses.length) return null; // no licenses, no regions
    const license = this.licenses.find(({ movie }) => movie.IMDB === givenMovieId);
    if (!license) return null; // no license, no regions
    return license?.regions || []; // [] means Global
  }
}
