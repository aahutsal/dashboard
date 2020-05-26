import { IResolvers } from 'graphql-tools';
import { Movie, MovieResponse } from './datasources/Movie';

const resolverMap: IResolvers = {
    Query: {
        movies: (_, __,  { dataSources }): Promise<Movie[]> => {
            return dataSources.dynamo.all();
        },
        movie: (_, { id }, { dataSources }): Promise<{ item: Movie }> => {
            return dataSources.dynamo.find(id);
        },
    },
    Mutation: {
        addMovie: async (_, { movies }, { dataSources }): Promise<MovieResponse> => {
            const results: Movie[] = [];
            for (const input of movies) {
                const mapped = Object.assign(new Movie, input);
                const saved = await dataSources.dynamo.add(mapped);
                results.push(saved)
            }

            return {
                success: results && results.length === movies.length,
                message:
                    results.length === movies.length
                        ? 'Movies added successfully'
                        : `Movies failure`,
                movies: results,
            };
        },
        attachRightsHolder: async(_, { info }, { dataSources }): Promise<MovieResponse> => {
            const results: Movie[] = [];
            for (const id of info.movies) {
                const found = await dataSources.dynamo.find(id);
                found.rightsHolder = info.rightsHolder;
                await dataSources.dynamo.update(found);
                results.push(found)
            }

            return {
                success: results && results.length === info.movies.length,
                message:
                    results.length === info.movies.length
                        ? 'Movie updates successfully'
                        : `Movie updates failed`,
                movies: results,
            };
        }
    }
};
export default resolverMap;