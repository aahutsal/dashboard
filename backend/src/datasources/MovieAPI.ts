import { equals, beginsWith } from '@aws/dynamodb-expressions';
import { DataSource } from 'apollo-datasource';
import { Movie } from './models/Movie';
import { User } from './models/User';
import DBConnection from './DB';
import { toArray } from '../util';

class MovieAPI extends DataSource {

    // Add new record
    async add(movie: Movie, user: User): Promise<{item: Movie}> {
        movie.pk = `USER#${user.accountAddress}`;
        movie.sk = `MOVIE#${movie.IMDB}`;

        const dbRecord = await this.findById(movie.IMDB);
        if (!dbRecord) {
            return await DBConnection.put({ item: movie });
        }
        throw Error("The movie already exists");
    }

    // Delete a record
    async delete(imdbId: string): Promise<{ item: Movie } | undefined> {
        const movie = await this.findById(imdbId);
        if (!movie) throw new Error(`No such movie ${imdbId}`);
        return await DBConnection.delete({ item: movie });
    }

    async deleteAll(): Promise<void> {
        const allMovies = await this.getAll();
        for await (const found of DBConnection.batchDelete(allMovies)) {
            // nothing
        }
    }

    // Get record by id
    async findById(imdb: string): Promise<Movie|undefined> {
        return toArray(
            DBConnection.query(Movie, { sk: `MOVIE#${imdb}`}, { indexName: 'movieByIdIndex' })
        ).then(m => m[0]);
    }

    async findByUser(userId: string): Promise<Movie[]> {
        return toArray(
            DBConnection.query(Movie, {
                pk: `USER#${userId}`,
                sk: beginsWith('MOVIE#')
            })
        );
    }

    // Get record by id
    // This function uses scan and should be avoided
    async filter(field: string, value: string): Promise<Movie[]> { 
        const filterCriteria = { // TODO allow more filter criteria
            filter: {
                ...equals(value),
                subject: field,
            }
        };
        return toArray(DBConnection.scan(Movie, filterCriteria));
    }

    // Update a record
    async update(movie: Movie): Promise<{ item: Movie }>  {
        return await DBConnection.update({ item: movie });
    }

    async getAll(): Promise<Movie[]> {
        const onlyMovieCriteria = {
            filter: {
                ...beginsWith('MOVIE#'),
                subject: 'sk',
            }
        };
        return toArray(DBConnection.scan(Movie, onlyMovieCriteria));
    }
}

export default new MovieAPI();