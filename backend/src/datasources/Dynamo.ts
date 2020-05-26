import { equals } from '@aws/dynamodb-expressions';
import { DataSource } from 'apollo-datasource';
import { Movie } from './Movie';
import DBConnection from './DB';

export default class Dynamo extends DataSource {

    // Add new record
    async add(movie: Movie): Promise<{item: Movie}> {
        return await DBConnection.put({ item: movie });
    }

    async all(): Promise<Movie[]> {
        const movies: Array<Movie> = [];
        for await (const movie of DBConnection.scan({ valueConstructor: Movie })) {
            movies.push(movie);
        }
        return movies;
    }

    // Delete a record
    async delete(movie: Movie): Promise<{ item: Movie } | undefined> {
        return await DBConnection.delete({ item: movie });
    }

    // Get record by id
    async find(id: string): Promise<{ item: Movie }> {
        const toFind = Object.assign(new Movie, { id });
        return await DBConnection.get({ item: toFind });
    }

    // Get record by id
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