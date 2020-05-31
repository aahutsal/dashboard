import { equals } from '@aws/dynamodb-expressions';
import { DataSource } from 'apollo-datasource';
import { Movie } from './Movie';
import DBConnection from './DB';
import { User } from './models/User';
import { ApprovalStatus } from './models/Base';
import { toArray } from '../util';

// TODO: rename to MovieAPI
export default class Dynamo extends DataSource {

    // Add new record
    async add(movie: Movie, user: User): Promise<{item: Movie}> {
        movie.pk = `USER#${user.accountAddress}`;
        movie.sk = `MOVIE#${movie.IMDB}`;
        movie.status = ApprovalStatus.PENDING;
        return await DBConnection.put({ item: movie });
    }

    // Delete a record
    async delete(movie: Movie): Promise<{ item: Movie } | undefined> {
        return await DBConnection.delete({ item: movie });
    }

    // Get record by id
    async findById(imdb: string): Promise<Movie|undefined> {
        let movie;
        for await (const item of DBConnection.query(Movie, { sk: `MOVIE#${imdb}`}, { indexName: 'movieByIdIndex' })) {
            movie = item;
        }
        return movie;
    }

    async findByUser(userId: string): Promise<Movie[]> {
        return toArray(
            DBConnection.query(Movie, { pk: `USER#${userId}` })
        );
    }

    // Get record by id
    // This function uses scan and should be avoided
    async filter(field: string, value: string): Promise<Movie[]> { 
        const filterCriteria = { // TODO allow more filter criteria
            valueConstructor: Movie,
            filter: {
                ...equals(value),
                subject: field,
            }
        };
        const movies: Movie[] = [];
        for await (const movie of DBConnection.scan(filterCriteria)) {
            movies.push(movie);
        }
        return movies;
    }

    // Update a record
    async update(movie: Movie): Promise<{ item: Movie }>  {
        return await DBConnection.update({ item: movie });
    }
}