import { ConditionExpression, equals } from '@aws/dynamodb-expressions';
import { DataSource } from 'apollo-datasource';
import { v4 as uuidv4 } from 'uuid';
import { Price } from './models/Price';
import DBConnection from './DB';
import { toArray } from '../util';

class PriceAPI extends DataSource {

    // Add new record
    async add(IMDB: string, price: Price): Promise<{ item: Price }> {
        price.pk = `MOVIE#${IMDB}`;
        price.sk = uuidv4(); //need unique identifier to allow updates
        return await DBConnection.put({ item: price });
    }

    // Update a record
    async update(IMDB: string, priceId: string, price: Price): Promise<{ item: Price }> {
        price.pk = `MOVIE#${IMDB}`;
        price.sk = priceId;
        return await DBConnection.update({ item: price });
    }

    // findByMovie
    async findByMovie(movieId: string): Promise<Price[]> {
        return await toArray(
            DBConnection.query(Price, {  pk: `MOVIE#${movieId}` })
        );
    }

    async findPrice(filter: { IMDB: string; region: string; medium: string }): Promise<Price> {

        const date = new Date();
        const andExpression: ConditionExpression = {
            type: 'And',
            conditions: [
                {
                    ...equals(filter.region),
                    subject: 'region',
                },
                {
                    ...equals(filter.medium),
                    subject: 'medium',
                },
            ]
        };

        const prices = await toArray(
            DBConnection.query(Price, { pk: `MOVIE#${filter.IMDB}` }, { filter: andExpression })
        );

        let price = prices.find((p) => {
            return new Date(p.fromWindow) < date && new Date(p.toWindow) > date;
        });

        if (!price) {
            // Temporary for testing purposes used for non existent pricing
            // TODO:: seed to database & have admin update record
            price = Object.assign(new Price, {
                "priceId": "DEFAULT",
                "type": "WHITERABBIT",
                "region": "DEFAULT",
                "medium": "EST",
                "amount": "20000000000000000", // 2 cents
                "fromWindow": date.toUTCString(),
                "toWindow": date.toUTCString()
            });
        }
        return price;
    }

    // Delete a record
    async delete(IMDB: string, priceId: string): Promise<{ item: Price } | undefined> {
        const price = new Price();
        price.pk = `MOVIE#${IMDB}`;
        price.sk = priceId;
        return await DBConnection.delete({ item: price });
    }
}

export default new PriceAPI();