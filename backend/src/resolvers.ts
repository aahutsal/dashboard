import { IResolvers } from 'graphql-tools';
import { Movie, MovieResponse } from './datasources/Movie';
import { UserResponse, User } from './datasources/models/User';

const resolverMap: IResolvers = {
    Query: {
        movie: (_, { IMDB }, { dataSources }): Promise<Movie> => {
            return dataSources.movieAPI.findById(IMDB);
        },
        user: (_, { accountAddress }, { dataSources }): Promise<User> => {
            return dataSources.userAPI.findById(accountAddress);
        },
    },
    Mutation: {
        addMovie: async (_, { movies, userId }, { dataSources }): Promise<MovieResponse> => {
            const results: Movie[] = [];
            const user = await dataSources.userAPI.findById(userId);
            for (const input of movies) {
                const mapped = Object.assign(new Movie, input);
                if (input.record) {
                    mapped.record.value = JSON.parse(input.record.value || {})
                }
                const saved = await dataSources.movieAPI.add(mapped, user);
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
        addUser: async (_, { user }, { dataSources }): Promise<UserResponse> => {
            const mapped = Object.assign(new User(), user);
            
            const savedUser = await dataSources.userAPI.add(mapped)
                .catch((e: Error) => {
                    console.error(e);
                    return {
                        success: false,
                        message: `Failed to add User:${e.message}`,
                    };
                });
            return {
                success: true,
                message: 'User has been added successfully',
                user: savedUser,
            };
        },
    },
    Movie : {
        rightsHolder: (parent, _ , { dataSources }): Promise<User> =>
            dataSources.userAPI.findById(parent.pk.split('#')[1]),
    },
    User: {
        movies: async (parent, _ , { dataSources }): Promise<Movie[]> =>
            dataSources.movieAPI.findByUser(parent.pk.split('#')[1]),
    }
};

export default resolverMap;