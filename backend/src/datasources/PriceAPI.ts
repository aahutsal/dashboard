import { beginsWith, ConditionExpression, contains, equals } from '@aws/dynamodb-expressions';
import { DataSource } from 'apollo-datasource';
import { v4 as uuidv4 } from 'uuid';
import { Price } from './models/Price';
import { toArray } from '../util';
import { DataMapper } from '@aws/dynamodb-data-mapper';

export class PriceAPI extends DataSource {
    private db: DataMapper;

    constructor(db: DataMapper) {
        super();
        this.db = db;
    }

    // Add new record
    async add(IMDB: string, price: Price): Promise<Price> {
        price.pk = `MOVIE#${IMDB}`;
        price.sk = `PRICE#${uuidv4()}`; //need unique identifier to allow updates
        return await this.db.put({ item: price }).then(({ item }) => item );
    }

    // Update a record
    async update(IMDB: string, priceId: string, price: Price): Promise<Price> {
        price.pk = `MOVIE#${IMDB}`;
        price.sk = `PRICE#${priceId}`;
        return await this.db.update({ item: price }).then(({ item }) => item );
    }

    // findByMovie
    async findByMovie(movieId: string, priceId?: string): Promise<Price[]> {
        return await toArray(
            this.db.query(Price, {
                pk: `MOVIE#${movieId}`,
                sk: beginsWith(`PRICE#${priceId || ''}`),
            })
        );
    }

    async findPrice(filter: { IMDB: string; region: string; medium: string }): Promise<Price> {

        const date = new Date();
        const andExpression: ConditionExpression = {
            type: 'And',
            conditions: [
                {
                    ...contains(filter.region),
                    subject: 'regions',
                },
                {
                    ...equals(filter.medium),
                    subject: 'medium',
                },
            ]
        };

        const prices = await toArray(
            this.db.query(Price, { pk: `MOVIE#${filter.IMDB}`, sk: beginsWith('PRICE#') }, { filter: andExpression })
        );


        let price = prices.find((p) => 
            (!p.fromWindow || new Date(p.fromWindow) < date) 
            && (!p.toWindow || new Date(p.toWindow) > date)
        );

        if (!price) {
            // Temporary for testing purposes used for non existent pricing
            // TODO:: seed to database & have admin update record
            price = Object.assign(new Price, {
                "priceId": "DEFAULT",
                "type": "WHITERABBIT",
                "regions": ["001"], // World aka Global
                "medium": "EST",
                "amount": "20000000000000000", // 2 cents
                "fromWindow": date.toUTCString(),
                "toWindow": date.toUTCString()
            });
        }
        return price;
    }

    // Delete a record
    async delete(IMDB: string, priceId: string): Promise<void> {
        const price = new Price();
        price.pk = `MOVIE#${IMDB}`;
        price.sk = `PRICE#${priceId}`;
        await this.db.delete({ item: price });
    }

    async deleteAllByMovie(movieId: string): Promise<void> {
        for await (const _ of this.db.batchDelete(await this.findByMovie(movieId))) {
            // nothing
        }
    }

    async deleteAll(): Promise<void> {
        for await (const _ of this.db.batchDelete(await this.getAll())) {
            // nothing
        }
    }

    async getAll(): Promise<Price[]> {
        const onlyPriceCriteria = {
            filter: {
                ...beginsWith('PRICE#'),
                subject: 'sk',
            }
        };
        return toArray(this.db.scan(Price, onlyPriceCriteria));
    }
}

export default PriceAPI;
