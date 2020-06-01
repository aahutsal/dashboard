import { IResolvers } from 'graphql-tools';
import { Movie, MovieResponse } from './datasources/Movie';
import { UserResponse, User } from './datasources/models/User';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';

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
        addMovie: async (_, { movies }, { user, dataSources }): Promise<MovieResponse> => {
            if (!user) throw new AuthenticationError('User is not authenticated');
            if (!user.isRightsHolder()) throw new ForbiddenError('User is not authorized for the operation');

            const results: Movie[] = [];
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
        metadata: (parent): Promise<{ title?: string; posterUrl?: string }> => {
            if (!parent.record || !parent.record.value) {
                return Promise.resolve({});
            }
            const metadata = parent.record.value;
            return Promise.resolve({
                title: metadata.title,
                posterUrl: `https://image.tmdb.org/t/p/w500${metadata.poster_path}`,
            });
        },
    },
    User: {
        movies: async (parent, _ , { dataSources }): Promise<Movie[]> =>
            dataSources.movieAPI.findByUser(parent.pk.split('#')[1]),
    }
};

export default resolverMap;