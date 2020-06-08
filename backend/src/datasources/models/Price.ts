import { attribute, table } from '@aws/dynamodb-data-mapper-annotations';
import { Base } from './Base';

enum PriceType {
    WHITERABBIT = "WHITERABBIT",
    RIGHTSHOLDER = "RIGHTSHOLDER"
}

enum MovieMedium {
    THEATER = "THEATER",
    EST = "EST",
    DTR = "DTR",
    PAYTV = "PAYTV",
    SVOD = "SVOD",
    FREETV = "FREETV"
}

@table('movies')
export class Price extends Base {
    @attribute()
    type!: PriceType;

    @attribute()
    amount!: string;

    @attribute()
    region!: string;

    @attribute()
    medium!: MovieMedium;

    @attribute()
    fromWindow!: string;

    @attribute()
    toWindow!: string;

    priceId(): string {
        return this.sk;
    }
}

export class PriceResponse {
    success!: boolean;
    message!: string;
    pricing?: Price;
}
