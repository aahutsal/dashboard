import { IResolvers } from 'graphql-tools';
import { DateTimeResolver as DateTime } from 'graphql-scalars';
import { MovieResponse, Movie } from './datasources/models/Movie';
import { UserResponse, User } from './datasources/models/User';
import { PriceResponse, Price } from './datasources/models/Price';
import config from './config';
import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { Config } from '@whiterabbitjs/dashboard-common';
import { Company } from './datasources/models/Company';

const resolverMap: IResolvers = {
    Query: {
        movie: (_, { IMDB }, { dataSources }): Promise<Movie> => {
            return dataSources.movieAPI.findById(IMDB);
        },
        allMovies: (_, params, { user, dataSources }): Promise<Movie[]> => {
            if (!user) throw new AuthenticationError('User is not authenticated');
            if (!user.isAdmin()) throw new ForbiddenError('User is not authorized for the operation');
            return dataSources.movieAPI.getAll();
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
        config: (): Config => config,
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
            if (!user.company || !user.company.id) {
                throw new UserInputError("No company specified");
            }
            const mapped = Object.assign(new User(), user);
            const existingUser = await dataSources.userAPI
                .findById(user.accountAddress)
                .catch(() => {/* happy case, swallow the error */});
            if (existingUser.accountAddress) {
                throw new UserInputError("User already exists");
            }

            let company = await dataSources.companyAPI.findById(user.company.id);
            if (!company) {
                company = await dataSources.companyAPI.add(user.company.id, user.company.name || `Company ${user.company.id}`);
            }
            const savedUser = await dataSources.userAPI.add(mapped, company.id);
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

        deleteMovie: async (_, { imdbId }, { user, dataSources }): Promise<MovieResponse> => {
            if (!user) throw new AuthenticationError('User is not authenticated');
            if (!user.isAdmin()) throw new ForbiddenError('User is not authorized for the operation');
            
            await dataSources.movieAPI.delete(imdbId);

            return {
                success: true,
                message: "Movie was unregistered",        
            };
        },

        deleteAllMovies: async (_, params, { user, dataSources }): Promise<MovieResponse> => {
            if (!user) throw new AuthenticationError('User is not authenticated');
            if (!user.isAdmin()) throw new ForbiddenError('User is not authorized for the operation');
            
            await dataSources.movieAPI.deleteAll();

            return {
                success: true,
                message: "Movies were unregistered",        
            };
        }



    },
    Movie : {
        rightsHolder: (parent, _ , { dataSources }): Promise<User> => {
            return dataSources.companyAPI.findById(parent.pk.split('#')[1]);
        },
        metadata: (parent): Promise<{ title?: string; posterUrl?: string }> => {
            if (!parent.record || !parent.record.value) {
                return Promise.resolve({});
            }
            const metadata = parent.record.value;
            return Promise.resolve({
                id: metadata.id,
                title: metadata.title,
                posterUrl: `https://image.tmdb.org/t/p/w500${metadata.poster_path}`,
                year: metadata.release_date ? metadata.release_date.slice(0, 4) : '',
            });
        },
        pricing: (parent, _ , { dataSources }): Promise<Price[]> => {
            return dataSources.priceAPI.findByMovie(parent.IMDB);
        },
    },
    User: {
        movies: async (parent, _ , { dataSources }): Promise<Movie[]> => {
            return parent.companyId ? dataSources.movieAPI.findByCompany(parent.companyId) : Promise.resolve([]);
        },
        company: async (parent, _, { dataSources }): Promise<Company> => {
            return dataSources.companyAPI.findById(parent.companyId);
        }
    },
    DateTime
};

export default resolverMap;