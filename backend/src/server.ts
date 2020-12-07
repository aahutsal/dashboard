import express from 'express';
import { ApolloServer } from 'apollo-server-express';

import compression from 'compression';
import cors from 'cors';
import schema from './schema';
import DB from './datasources/DB';
import MovieAPI from './datasources/MovieAPI';
import UserAPI from './datasources/UserAPI';
import PriceAPI from './datasources/PriceAPI';
import { first } from './util';
import { verifyAuthToken } from '@whiterabbitjs/dashboard-common';
import CompanyAPI from './datasources/companyApi';
import LicenseAPI from './datasources/LicenseApi';

const app = express();
app.use('*', cors());
app.use(compression());

const userAPI = new UserAPI(DB);

export interface BackendDataSources {
    userAPI: UserAPI;
    movieAPI: MovieAPI;
    companyAPI: CompanyAPI;
    priceAPI: PriceAPI;
    licenseAPI: LicenseAPI;
}

const server = new ApolloServer({
    schema,
    dataSources: () => ({ 
        userAPI,
        movieAPI: new MovieAPI(DB),
        companyAPI: new CompanyAPI(DB),
        priceAPI: new PriceAPI(DB),
        licenseAPI: new LicenseAPI(DB),
    }),
    context: async ({ req }): Promise<object> => {     
        // Get the signed message from the headers.
        const rawSignature = req.headers['x-wr-signature'];
        const rawSigData = req.headers['x-wr-sigdata'];
        if (!rawSignature || !rawSigData) return { user: undefined };

        const sigData = JSON.parse(first(rawSigData) || '{}');
        const signature = first(rawSignature);
        const { isValid, signer } = verifyAuthToken(sigData, signature);
        
        if (!isValid) return { user: undefined };
        const user = await userAPI.findById(signer).catch(() => undefined);
        // add the user to the context
        return { user };
      },
});
server.applyMiddleware({ app, path: '/graphql' });

const appServer = app.listen({ port: 4000 }, () =>
    console.log(`🚀 GraphQL ready at http://localhost:4000${server.graphqlPath} 🚀 \n`)
)

export default appServer;