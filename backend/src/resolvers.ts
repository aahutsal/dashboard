import { IResolvers } from 'graphql-tools';
import { DateTimeResolver as DateTime } from 'graphql-scalars';
import { MovieResponse, Movie } from './datasources/models/Movie';
import { UserResponse, User } from './datasources/models/User';
import { PriceResponse, Price } from './datasources/models/Price';
import config from './config';
import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { Config } from '@whiterabbitjs/dashboard-common';
import { Company } from './datasources/models/Company';
import { BackendDataSources } from './server';
import { License, LicenseResponse } from './datasources/models/License';

const authorizeForMovie = async (
    user: User,
    movieId: string,
    dataSources: BackendDataSources
): Promise<void> => {
    if (!user.accountAddress) throw new AuthenticationError('User is not authenticated');
    if (!user.isRightsHolder()) throw new ForbiddenError('User is not authorized for the operation');

    const movie = await dataSources.movieAPI.findById(movieId);
    if (!movie) throw new UserInputError(`Movie ${movieId} does not exist`)
    if (movie.companyId() !== user.companyId) throw new ForbiddenError(`User is not authorized for the operation`);
};

const isProducer = async (user: User, { companyAPI }: BackendDataSources): Promise<boolean> => {
    const company = await companyAPI.findById(user.companyId);
    console.log(company);
    return company.kind === 'PRODUCTION';
};

const authorizeProducer = async (user: User, dataSources: BackendDataSources): Promise<void> => {
    if (!await isProducer(user, dataSources)) throw new ForbiddenError('User is not authorized for the operation');
};

interface ServerContext {
    user: User;
    dataSources: BackendDataSources;
}

const resolverMap: IResolvers = {
    Query: {
        movie: (_, { IMDB }, { dataSources }: ServerContext): Promise<Movie | undefined> => {
            return dataSources.movieAPI.findById(IMDB);
        },
        allMovies: (_, params, { user, dataSources }: ServerContext): Promise<Movie[]> => {
            if (!user) throw new AuthenticationError('User is not authenticated');
            if (!user.isAdmin()) throw new ForbiddenError('User is not authorized for the operation');
            return dataSources.movieAPI.getAll();
        },
        user: (_, { accountAddress }, { dataSources }: ServerContext): Promise<User | undefined> => {
            return dataSources.userAPI.findById(accountAddress);
        },
        prices: (_, { IMDB }, { dataSources }: ServerContext): Promise<Price[]> => {
            return dataSources.priceAPI.findByMovie(IMDB);
        },
        price: (_, { filter }, { dataSources }: ServerContext): Promise<Price> => {
            return dataSources.priceAPI.findPrice(filter);
        },    
        pendingUsers: (_, params, { user, dataSources }: ServerContext): Promise<User[]> => {
            if (!user) throw new AuthenticationError('User is not authenticated');
            if (!user.isAdmin()) throw new ForbiddenError('User is not authorized for the operation');

            return dataSources.userAPI.getPending();
        },
        distributors: (_, params, { dataSources }: ServerContext): Promise<Company[]> => {
            return dataSources.companyAPI.getDistributors(); 
        },
        config: (): Config => config,
        companySublicensees: async (_, params, { user, dataSources }: ServerContext): Promise<License[]> => {
            if (!user) throw new AuthenticationError('User is not authenticated');

            return dataSources.licenseAPI.findByIssuingCompany(user.companyId);
        }
    },
    Mutation: { //TODO:: Move to schema folder
        addMovie: async (_, { movie }, { user, dataSources }: ServerContext): Promise<MovieResponse> => {
            if (!user || !user.accountAddress) throw new AuthenticationError('User is not authenticated');
            await authorizeProducer(user, dataSources);

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
        addUser: async (_, { user }, { dataSources }: ServerContext): Promise<UserResponse> => {
            if (!user.company || !user.company.id) {
                throw new UserInputError("No company specified");
            }
            const mapped = Object.assign(new User(), user);
            const existingUser = await dataSources.userAPI
                .findById(mapped.accountAddress);
            if (existingUser && existingUser.accountAddress) {
                throw new UserInputError("User already exists");
            }

            let company = await dataSources.companyAPI.findById(mapped.company.id);
            if (!company) {
                company = await dataSources.companyAPI.add(Object.assign(new Company(), mapped.company));
            }
            const savedUser = await dataSources.userAPI.add(mapped, company.id);
            return {
                success: true,
                message: 'User has been added successfully',
                user: savedUser,
            };
        },
        addPrice: async (_, { pricing }, { user, dataSources }: ServerContext): Promise<PriceResponse> => {
            await authorizeForMovie(user, pricing.IMDB, dataSources);
            
            const mapped = Object.assign(new Price, pricing);
            const saved = await dataSources.priceAPI.add(pricing.IMDB, mapped);
            return {
                success: true,
                message: 'Pricing added successfully',
                pricing: saved,
            };
        },
        updatePrice: async (_, { pricing }, { user, dataSources }: ServerContext): Promise<PriceResponse> => {
            await authorizeForMovie(user, pricing.IMDB, dataSources);
            const mapped = Object.assign(new Price, pricing);
            const saved = await dataSources.priceAPI.update(pricing.IMDB, pricing.priceId, mapped);
            return {
                success: true,
                message: 'Pricing updated successfully',
                pricing: saved,
            };
        },
        deletePrice: async (_, { pricing }, { user, dataSources }: ServerContext): Promise<PriceResponse> => {
            await authorizeForMovie(user, pricing.IMDB, dataSources);

            await dataSources.priceAPI.delete(pricing.IMDB, pricing.priceId);
            return {
                success: true,
                message: 'Pricing deleted successfully'
            };
        },
        approveUser: async (_, { userId }, { user, dataSources }: ServerContext): Promise<UserResponse> => {
            if (!user) throw new AuthenticationError('User is not authenticated');
            if (!user.isAdmin()) throw new ForbiddenError('User is not authorized for the operation');
            
            const approvedUser = await dataSources.userAPI.approve(userId);
            await dataSources.companyAPI.approve(approvedUser.companyId);

            return {
                success: true,
                message: "Rightsholder is approved",
            };
        },
        declineUser: async (_, { userId }, { user, dataSources }: ServerContext): Promise<UserResponse> => {
            if (!user) throw new AuthenticationError('User is not authenticated');
            if (!user.isAdmin()) throw new ForbiddenError('User is not authorized for the operation');
            
            await dataSources.userAPI.decline(userId);

            return {
                success: true,
                message: "Rightsholder is rejected",        
            };
        },

        deleteMovie: async (_, { imdbId }, { user, dataSources }: ServerContext): Promise<MovieResponse> => {
            if (!user) throw new AuthenticationError('User is not authenticated');
            if (!user.isAdmin()) throw new ForbiddenError('User is not authorized for the operation');
            
            await dataSources.movieAPI.delete(imdbId);

            return {
                success: true,
                message: "Movie was unregistered",        
            };
        },

        deleteAllMovies: async (_, params, { user, dataSources }: ServerContext): Promise<MovieResponse> => {
            if (!user) throw new AuthenticationError('User is not authenticated');
            if (!user.isAdmin()) throw new ForbiddenError('User is not authorized for the operation');
            
            await dataSources.movieAPI.deleteAll();

            return {
                success: true,
                message: "Movies were unregistered",        
            };
        },

        addLicense: async (_, { license }, { user, dataSources }: ServerContext): Promise<LicenseResponse> => {
            await authorizeForMovie(user, license.movieId, dataSources);

            const mappedLicense = Object.assign(new License, license);
            const saved = await dataSources.licenseAPI.add(user.companyId, mappedLicense);
            return {
                success: true,
                message: 'License has been added successfully',
                license: saved,
            };
        },
        updateLicense: async (_, { license }, { user, dataSources }: ServerContext): Promise<LicenseResponse> => {
            await authorizeForMovie(user, license.movieId, dataSources);

            const oldLicense = await dataSources.licenseAPI.findById(license.licenseId);
            
            const mappedLicense = Object.assign(new License, oldLicense, license);

            await dataSources.licenseAPI.update(mappedLicense);
            return {
                success: true,
                message: 'License has been updated successfully',
                license: mappedLicense,
            };
        },
        deleteLicense: async (_, { license }, { user, dataSources }: ServerContext): Promise<LicenseResponse> => {
            await authorizeForMovie(user, license.movieId, dataSources);

            await dataSources.licenseAPI.delete(license.licenseId);
            return {
                success: true,
                message: 'License has been deleted successfully'
            };
        },



    },
    Movie : {
        rightsHolder: (parent, _ , { dataSources }: ServerContext): Promise<Company> => {
            return dataSources.companyAPI.findById(parent.companyId);
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
        pricing: (parent, _ , { dataSources }: ServerContext): Promise<Price[]> => {
            return dataSources.priceAPI.findByMovie(parent.IMDB);
        },
        licenses: async (parent, params, { user, dataSources }: ServerContext): Promise<License[]> => {
            const licenses = await dataSources.licenseAPI.findByIssuingCompany(user.companyId, parent.IMDB);
            return licenses;
        },
    },
    User: {
        movies: async (parent, _ , { user, dataSources }: ServerContext): Promise<Movie[]> => {
            
            if (!user) return [];
            if (await isProducer(user, dataSources)) {
                return dataSources.movieAPI.findByCompany(parent.companyId);
            }
            const licenses = await dataSources.licenseAPI.findByLicensedCompany(parent.companyId);
            
            const movies = await Promise.all(
                licenses.map(({ movieId }) => dataSources.movieAPI.findById(movieId))
            );
            
            return movies.filter((movie?: Movie) => !!movie) as Movie[];
        },
        company: async (parent, _, { dataSources }: ServerContext): Promise<Company> => {
            return dataSources.companyAPI.findById(parent.companyId);
        },
        licenses: async (parent, _, { dataSources }: ServerContext): Promise<License[]> => {
            return dataSources.licenseAPI.findByLicensedCompany(parent.companyId);
        },
    },
    License: {
        company: async (parent, _, { dataSources }: ServerContext): Promise<Company> => {
            return dataSources.companyAPI.findById(parent.companyId);
        },
        movie: async (parent, _, { dataSources }: ServerContext): Promise<Movie> => {
            const movie = await dataSources.movieAPI.findById(parent.movieId);
            if (!movie) throw new UserInputError(`Movie ${parent.movieId} does not exist`);
            return movie;
        },
    },
    DateTime
};

export default resolverMap;