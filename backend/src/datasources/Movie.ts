// TODO: move to /models/
import { attribute, table } from '@aws/dynamodb-data-mapper-annotations';
import { Base } from './models/Base';
import { ApprovalStatus, PendingStatus } from '@whiterabbitjs/dashboard-common';

enum PriceType {
  WHITERABBIT = "WHITERABBIT",
  RIGHTSHOLDER = "RIGHTSHOLDER"
}

export class MovieResponse {
  success!: boolean;
  message!: string;
  movies?: Movie[];
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
    constructor() {
      super();
      this.status = ApprovalStatus.PENDING;
      this.pendingStatus = PendingStatus.MOVIE;
    }

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