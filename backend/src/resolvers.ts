import { IResolvers } from 'graphql-tools';
import { Movie, MovieResponse } from './datasources/Movie';
import { UserResponse, User } from './datasources/models/User';
import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';

const resolverMap: IResolvers = {
    Query: {
        movie: (_, { IMDB }, { dataSources }): Promise<Movie> => {
            return dataSources.movieAPI.findById(IMDB);
        },
        user: (_, { accountAddress }, { dataSources }): Promise<User> => {
            return dataSources.userAPI.findById(accountAddress);
        },
        pendingUsers: (_, params, { user, dataSources }): Promise<User[]> => {
            if (!user) throw new AuthenticationError('User is not authenticated');
            if (!user.isAdmin()) throw new ForbiddenError('User is not authorized for the operation');

            return dataSources.userAPI.getPending();
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
            const existingUser = await dataSources.userAPI
                .findById(user.accountAddress)
                .catch(() => {/* happy case, swallow the error */});
            if (existingUser.accountAddress) {
                throw new UserInputError("User already exists");
            }
            const savedUser = await dataSources.userAPI.add(mapped);
            return {
                success: true,
                message: 'User has been added successfully',
                user: savedUser,
            };
        },
        approveUser: async (_, { userId }, { user, dataSources }): Promise<UserResponse> => {
            if (!user) throw new AuthenticationError('User is not authenticated');
            if (!user.isAdmin()) throw new ForbiddenError('User is not authorized for the operation');
            
            await dataSources.userAPI.approve(userId);

            return {
                success: true,
                message: "Rightsholder is approved",
            };
        },
        declineUser: async (_, { userId }, { user, dataSources }): Promise<UserResponse> => {
            if (!user) throw new AuthenticationError('User is not authenticated');
            if (!user.isAdmin()) throw new ForbiddenError('User is not authorized for the operation');
            
            await dataSources.userAPI.decline(userId);

            return {
                success: true,
                message: "Rightsholder is rejected",
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
            parent.pk ? dataSources.movieAPI.findByUser(parent.pk.split('#')[1]) : Promise.resolve([]),
    }
};

export default resolverMap;