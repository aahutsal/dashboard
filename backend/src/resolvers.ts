import { IResolvers } from 'graphql-tools';
import { DateTimeResolver as DateTime } from 'graphql-scalars';
import { MovieResponse, Movie } from './datasources/models/Movie';
import { UserResponse, User } from './datasources/models/User';
import { PriceResponse, Price } from './datasources/models/Price';
import config from './config';
import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { MovieBase, Config, movieFromTMDB, TMDBMovie, CompanyType, toCompanyType } from '@whiterabbitjs/dashboard-common';
import { Company } from './datasources/models/Company';
import { BackendDataSources } from './server';
import { License, LicenseResponse } from './datasources/models/License';


const isMainRightsholder = async (user: User, movieId: string, dataSources: BackendDataSources): Promise<boolean> => {
    const movie = await dataSources.movieAPI.findById(movieId);
    if (!movie) throw new UserInputError(`Movie ${movieId} does not exist`);
    return movie.companyId === user.companyId;
};

const authorizeForMovie = async (
    user: User,
    movieId: string,
    dataSources: BackendDataSources
): Promise<License> => {
    if (!user.accountAddress) throw new AuthenticationError('User is not authenticated');
    if (!user.isRightsHolder()) throw new ForbiddenError('User is not authorized for the operation');

    if (await isMainRightsholder(user, movieId, dataSources)) {
        return Object.assign(new License(), {
            movieId: movieId,
            companyId: user.companyId,
        });
    }

    const licenses = await dataSources.licenseAPI.findByLicensedCompany(user.companyId);
    const license = licenses.find(license => license.movieId === movieId);

    if (!license) throw new ForbiddenError(`User is not authorized for the operation`);
    return license;
};

const isProducer = async (user: User, { companyAPI }: BackendDataSources): Promise<boolean> => {
    const company = await companyAPI.findById(user.companyId);
    return toCompanyType(company.kind) === CompanyType.PRODUCTION;
};

const authorizeProducer = async (user: User, dataSources: BackendDataSources): Promise<void> => {
    if (!await isProducer(user, dataSources)) throw new ForbiddenError('User is not authorized for the operation');
};

const authorizeTypes = async (user: User, { companyAPI }: BackendDataSources, types: CompanyType[]): Promise<void> => {
    const company = await companyAPI.findById(user.companyId);
    if (!types.includes(toCompanyType(company.kind)))
        throw new ForbiddenError('User is not authorized for the operation');
};

interface ServerContext {
    user: User;
    dataSources: BackendDataSources;
}

const resolverMap: IResolvers = {
    Query: {
        movie: async (_, { IMDB }, { dataSources }: ServerContext): Promise<Movie | undefined> => {
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
            const license = await authorizeForMovie(user, pricing.IMDB, dataSources);
            await authorizeTypes(user, dataSources, [CompanyType.DISTRIBUTION, CompanyType.PRODUCTION]);
            
            const price = Object.assign(new Price, pricing);
            if (!price.matchesLicense(license, true)) throw new ForbiddenError('User is not licensed for the operation'); 
            
            const saved = await dataSources.priceAPI.add(pricing.IMDB, price);
            return {
                success: true,
                message: 'Pricing added successfully',
                pricing: saved,
            };
        },
        updatePrice: async (_, { pricing }, { user, dataSources }: ServerContext): Promise<PriceResponse> => {
            const license = await authorizeForMovie(user, pricing.IMDB, dataSources);
            await authorizeTypes(user, dataSources, [CompanyType.DISTRIBUTION, CompanyType.PRODUCTION]);

            const price = Object.assign(new Price, pricing);
            if (!price.matchesLicense(license, true)) throw new ForbiddenError('User is not licensed for the operation'); 
  
            const saved = await dataSources.priceAPI.update(pricing.IMDB, pricing.priceId, price);
            return {
                success: true,
                message: 'Pricing updated successfully',
                pricing: saved,
            };
        },
        deletePrice: async (_, { pricing }, { user, dataSources }: ServerContext): Promise<PriceResponse> => {
            const license = await authorizeForMovie(user, pricing.IMDB, dataSources);
            await authorizeTypes(user, dataSources, [CompanyType.DISTRIBUTION, CompanyType.PRODUCTION]);

            const [price] = await dataSources.priceAPI.findByMovie(pricing.IMDB, pricing.priceId);
            if (!price.matchesLicense(license, true)) throw new ForbiddenError('User is not licensed for the operation'); 
   
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
            
            const movie = await dataSources.movieAPI.findById(imdbId);
            if (!movie) throw new UserInputError(`Movie ${imdbId} does not exist`);
            await dataSources.movieAPI.delete(imdbId);
            await dataSources.priceAPI.deleteAllByMovie(imdbId);
            const licenses = await dataSources.licenseAPI.findByIssuingCompany(movie.companyId, imdbId);
            await Promise.all(
                licenses.map(({ companyId, licenseId }) => dataSources.licenseAPI.delete(companyId, licenseId))
            );

            return {
                success: true,
                message: "Movie was unregistered",        
            };
        },

        deleteAllMovies: async (_, params, { user, dataSources }: ServerContext): Promise<MovieResponse> => {
            if (!user) throw new AuthenticationError('User is not authenticated');
            if (!user.isAdmin()) throw new ForbiddenError('User is not authorized for the operation');
            
            await dataSources.movieAPI.deleteAll();
            await dataSources.priceAPI.deleteAll();
            await dataSources.licenseAPI.deleteAll();

            return {
                success: true,
                message: "Movies were unregistered",        
            };
        },

        addLicense: async (_, { license }, { user, dataSources }: ServerContext): Promise<LicenseResponse> => {
            const userLicense = await authorizeForMovie(user, license.movieId, dataSources);
            await authorizeTypes(user, dataSources, [CompanyType.SALES, CompanyType.DISTRIBUTION, CompanyType.PRODUCTION]);

            const mappedLicense = Object.assign(new License, license);
            if (!mappedLicense.matchesLicense(userLicense, true)) throw new ForbiddenError('User is not licensed for the operation'); 
 
            const saved = await dataSources.licenseAPI.add(user.companyId, mappedLicense);
            return {
                success: true,
                message: 'License has been added successfully',
                license: saved,
            };
        },
        updateLicense: async (_, { license }, { user, dataSources }: ServerContext): Promise<LicenseResponse> => {
            const userLicense = await authorizeForMovie(user, license.movieId, dataSources);
            await authorizeTypes(user, dataSources, [CompanyType.SALES, CompanyType.DISTRIBUTION, CompanyType.PRODUCTION]);

            const oldLicense = await dataSources.licenseAPI.findById(license.licenseId);
            
            const mappedLicense = Object.assign(new License, oldLicense, license);
            if (!mappedLicense.matchesLicense(userLicense, true)) throw new ForbiddenError('User is not licensed for the operation');  

            await dataSources.licenseAPI.update(mappedLicense);
            return {
                success: true,
                message: 'License has been updated successfully',
                license: mappedLicense,
            };
        },
        deleteLicense: async (_, { license }, { user, dataSources }: ServerContext): Promise<LicenseResponse> => {
            const userLicense = await authorizeForMovie(user, license.movieId, dataSources);
            await authorizeTypes(user, dataSources, [CompanyType.SALES, CompanyType.DISTRIBUTION, CompanyType.PRODUCTION]);

            const oldLicense = await dataSources.licenseAPI.findById(license.licenseId);
            if (!oldLicense) throw new UserInputError(`No such license: ${license.licenseId}`);
            if (!oldLicense.matchesLicense(userLicense, true)) throw new ForbiddenError('User is not licensed for the operation'); 

            await dataSources.licenseAPI.delete(oldLicense.companyId, license.licenseId);
            return {
                success: true,
                message: 'License has been deleted successfully'
            };
        },
    },
    Movie : {
        rightsHolder: (parent: Movie, _ , { dataSources }: ServerContext): Promise<Company> => {
            return dataSources.companyAPI.findById(parent.companyId);
        },
        metadata: (parent: Movie): Promise<MovieBase | null> => {
            if (!parent.record || !parent.record.value) {
                return Promise.resolve(null);
            }
            return Promise.resolve({
                ...movieFromTMDB(parent.record.value as TMDBMovie),
                imdbId: parent.IMDB
             });
        },
        pricing: async (parent: Movie, _ , { user, dataSources }: ServerContext): Promise<Price[]> => {
            const [license] = await dataSources.licenseAPI.findByLicensedCompany(user.companyId, parent.IMDB);
            const prices = await dataSources.priceAPI.findByMovie(parent.IMDB);
            if (await isMainRightsholder(user, parent.IMDB, dataSources)) return prices; // Global
            if (!license) return [];
            return prices.filter(price => price.matchesLicense(license));
        },
        licenses: async (parent: Movie, _, { user, dataSources }: ServerContext): Promise<License[]> => {
            const licenses = await dataSources.licenseAPI.findByIssuingCompany(user.companyId, parent.IMDB);
            return licenses;
        },
    },
    User: {
        movies: async (parent: User, _ , { user, dataSources }: ServerContext): Promise<Movie[]> => {
            
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
        company: async (parent: User, _, { dataSources }: ServerContext): Promise<Company> => {
            return dataSources.companyAPI.findById(parent.companyId);
        },
        licenses: async (parent: User, _, { user, dataSources }: ServerContext): Promise<License[]> => {
            if (!user) return [];
            if (await isProducer(user, dataSources)) {
                const movies = await dataSources.movieAPI.findByCompany(parent.companyId);
                return movies.map((movie) => Object.assign(
                    new License(), {
                        movieId: movie.IMDB,
                        companyId: parent.companyId,
                    }
                ));
            }
            return dataSources.licenseAPI.findByLicensedCompany(parent.companyId);
        },
    },
    License: {
        company: async (parent: License, _, { dataSources }: ServerContext): Promise<Company> => {
            return dataSources.companyAPI.findById(parent.companyId);
        },
        movie: async (parent: License, _, { dataSources }: ServerContext): Promise<Movie> => {
            const movie = await dataSources.movieAPI.findById(parent.movieId);
            if (!movie) throw new UserInputError(`Movie ${parent.movieId} does not exist`);
            return movie;
        },
    },
    DateTime
};

export default resolverMap;