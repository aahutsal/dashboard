import { attribute, table } from '@aws/dynamodb-data-mapper-annotations';
import { Base } from './Base';
import { TMDBMovieExtended } from '@whiterabbitjs/dashboard-common';
import { Price } from './Price';


export class MovieResponse {
  success!: boolean;
  message!: string;
  movies?: Movie;
}

export class MovieRecord {
    @attribute()
    source!: string;

    @attribute()
    value!: object; 
}

@table('movies')
export class Movie extends Base {
    constructor() {
      super();
    }

    @attribute()
    id!: number;

    @attribute()
    IMDB!: string;

    @attribute()
    record!: MovieRecord;

    metadata!: TMDBMovieExtended;

    @attribute()
    chainTitle!: string[];

    @attribute()
    pricing!: Price[];

    @attribute()
    companyId!: string;
}