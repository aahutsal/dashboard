// TODO: move to /models/
import { attribute, table } from '@aws/dynamodb-data-mapper-annotations';
import { Base } from './models/Base';

enum PriceType {
  WHITERABBIT = "WHITERABBIT",
  RIGHTSHOLDER = "RIGHTSHOLDER"
}

export class MovieResponse {
  success!: boolean;
  message!: string;
  movies!: Movie[];
}

export class Pricing {
    @attribute()
    type!: PriceType;

    @attribute()
    amount!: number;

    @attribute()
    region!: string;
}

export class MovieRecord {
    @attribute()
    source!: string;

    @attribute()
    value!: object; 
}

@table('movies')
export class Movie extends Base {
    @attribute()
    IMDB!: string;

    @attribute()
    ISAN!: string;

    @attribute()
    record!: MovieRecord;

    @attribute()
    chainTitle!: Array<string>;

    @attribute()
    pricing!: Array<Pricing>;
}