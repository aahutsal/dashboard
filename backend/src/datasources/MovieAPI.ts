import { equals, beginsWith } from '@aws/dynamodb-expressions';
import { DataSource } from 'apollo-datasource';
import { Movie } from './models/Movie';
import { User } from './models/User';
import { toArray } from '../util';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { ApprovalStatus } from '@whiterabbitjs/dashboard-common';

class MovieAPI extends DataSource {
    private db: DataMapper;

    constructor(db: DataMapper) {
        super();
        this.db = db;
    }    

    // Add new record
    async add(movie: Movie, user: User): Promise<Movie> {
        movie.pk = `COMPANY#${user.companyId}`;
        movie.sk = `MOVIE#${movie.IMDB}`;
        movie.status = ApprovalStatus.PENDING;
        movie.pendingStatus = `MOVIE#${ApprovalStatus.PENDING}`;

        const dbRecord = await this.findById(movie.IMDB);
        if (!dbRecord) {
            return await this.db.put({ item: movie }).then(({ item }) => item);
        }
        throw Error("The movie already exists");
    }

    // Delete a record
    async delete(imdbId: string): Promise<void> {
        const movie = await this.findById(imdbId);
        if (!movie) throw new Error(`No such movie ${imdbId}`);
        await this.db.delete({ item: movie });
    }

    async deleteAll(): Promise<void> {
        const allMovies = await this.getAll();
        for await (const _ of this.db.batchDelete(allMovies)) {
            // nothing
        }
    }

    // Get record by id
    async findById(imdb: string): Promise<Movie|undefined> {
        return toArray(
            this.db.query(Movie, { sk: `MOVIE#${imdb}`}, { indexName: 'byIdIndex' })
        ).then(m => m[0]);
    }

    async findByCompany(companyId: number): Promise<Movie[]> {
        return toArray(
            this.db.query(Movie, {
                pk: `COMPANY#${companyId}`,
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
        return toArray(this.db.scan(Movie, filterCriteria));
    }

    // Update a record
    async update(movie: Movie): Promise<Movie>  {
        return await this.db.update({ item: movie }).then(({ item }) => item);
    }

    async getAll(): Promise<Movie[]> {
        const onlyMovieCriteria = {
            filter: {
                ...beginsWith('MOVIE#'),
                subject: 'sk',
            }
        };
        return toArray(this.db.scan(Movie, onlyMovieCriteria));
    }
}

export default MovieAPI;