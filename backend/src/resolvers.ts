import { IResolvers } from 'graphql-tools';
import { DateTimeResolver as DateTime } from 'graphql-scalars';
import { MovieResponse, Movie } from './datasources/models/Movie';
import { UserResponse, User } from './datasources/models/User';
import { PriceResponse, Price } from './datasources/models/Price';
import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';

const resolverMap: IResolvers = {
    Query: {
        movie: (_, { IMDB }, { dataSources }): Promise<Movie> => {
            return dataSources.movieAPI.findById(IMDB);
        },
        user: (_, { accountAddress }, { dataSources }): Promise<User> => {
            return dataSources.userAPI.findById(accountAddress);
        },
        prices: (_, { IMDB }, { dataSources }): Promise<Price[]> => {
            return dataSources.priceAPI.findByMovie(IMDB);
        },
        price: (_, { filter }, { dataSources }): Promise<Price> => {
            return dataSources.priceAPI.findPrice(filter);
        },    
        pendingUsers: (_, params, { user, dataSources }): Promise<User[]> => {
            if (!user) throw new AuthenticationError('User is not authenticated');
            if (!user.isAdmin()) throw new ForbiddenError('User is not authorized for the operation');

            return dataSources.userAPI.getPending();
        },
    },
    Mutation: { //TODO:: Move to schema folder
        addMovie: async (_, { movie }, { user, dataSources }): Promise<MovieResponse> => {
            if (!user.accountAddress) throw new AuthenticationError('User is not authenticated');
            if (!user.isRightsHolder()) throw new ForbiddenError('User is not authorized for the operation');

            const mapped = Object.assign(new Movie, movie);
            if (movie.record) {
                mapped.record.value = JSON.parse(movie.record.value || {})
            }
            const saved = await dataSources.movieAPI.add(mapped, user);
            return {
                success: true,
                message: 'Movie added successfully',
                movies: saved,
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
        addPrice: async (_, { pricing }, { user, dataSources }): Promise<PriceResponse> => {
            if (!user.accountAddress) throw new AuthenticationError('User is not authenticated');
            if (!user.isRightsHolder()) throw new ForbiddenError('User is not authorized for the operation');

            const movie = await dataSources.movieAPI.findById(pricing.IMDB);
            if (!movie) throw new UserInputError(`Movie ${movie.IMDB} does not exist`)
            if (movie.pk !== user.pk) throw new ForbiddenError(`User is not authorized for the operation`);

            const mapped = Object.assign(new Price, pricing);
            const saved = await dataSources.priceAPI.add(pricing.IMDB, mapped);
            return {
                success: true,
                message: 'Pricing added successfully',
                pricing: saved,
            };
        },
        updatePrice: async (_, { pricing }, { user, dataSources }): Promise<PriceResponse> => {
            if (!user.accountAddress) throw new AuthenticationError('User is not authenticated');
            if (!user.isRightsHolder()) throw new ForbiddenError('User is not authorized for the operation');

            const movie = await dataSources.movieAPI.findById(pricing.IMDB);
            if (!movie) throw new UserInputError(`Movie ${movie.IMDB} does not exist`)
            if (movie.pk !== user.pk) throw new ForbiddenError(`User is not authorized for the operation`);

            const mapped = Object.assign(new Price, pricing);
            const saved = await dataSources.priceAPI.update(pricing.IMDB, pricing.priceId, mapped);
            return {
                success: true,
                message: 'Pricing updated successfully',
                pricing: saved,
            };
        },
        deletePrice: async (_, { pricing }, { user, dataSources }): Promise<PriceResponse> => {
            if (!user.accountAddress) throw new AuthenticationError('User is not authenticated');
            if (!user.isRightsHolder()) throw new ForbiddenError('User is not authorized for the operation');

            const movie = await dataSources.movieAPI.findById(pricing.IMDB);
            if (!movie) throw new UserInputError(`Movie ${movie.IMDB} does not exist`)
            if (movie.pk !== user.pk) throw new ForbiddenError(`User is not authorized for the operation`);

            await dataSources.priceAPI.delete(pricing.IMDB, pricing.priceId);
            return {
                success: true,
                message: 'Pricing deleted successfully'
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
        rightsHolder: (parent, _ , { dataSources }): Promise<User> => {
            return dataSources.userAPI.findById(parent.pk.split('#')[1]);
        },
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
        pricing: (parent, _ , { dataSources }): Promise<Price[]> => {
            return dataSources.priceAPI.findByMovie(parent.IMDB);
        },
    },
    User: {
        movies: async (parent, _ , { dataSources }): Promise<Movie[]> => {
            return parent.pk ? dataSources.movieAPI.findByUser(parent.pk.split('#')[1]) : Promise.resolve([]);
        },
    },
    DateTime
};

export default resolverMap;