import { attribute, table } from '@aws/dynamodb-data-mapper-annotations';
import { Base } from './Base';
import { Medium } from '@whiterabbitjs/dashboard-common';

enum PriceType {
    WHITERABBIT = "WHITERABBIT",
    RIGHTSHOLDER = "RIGHTSHOLDER"
}

@table('movies')
export class Price extends Base {
    @attribute()
    type!: PriceType;

    @attribute()
    amount!: string;

    @attribute()
    regions!: string[];

    @attribute()
    medium!: Medium;

    @attribute()
    fromWindow!: string;

    @attribute()
    toWindow!: string;

    priceId(): string {
        return this.sk.replace('PRICE#', '');
    }
}

export class PriceResponse {
    success!: boolean;
    message!: string;
    pricing?: Price;
}
