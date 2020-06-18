import express from 'express';
import { ApolloServer } from 'apollo-server-express';

import compression from 'compression';
import cors from 'cors';
import schema from './schema';
import movieAPI from './datasources/MovieAPI';
import userAPI from './datasources/UserAPI';
import priceAPI from './datasources/PriceAPI';
import { recoverSigner } from './auth';
import { first } from './util';

const app = express();
app.use('*', cors());
app.use(compression());


const server = new ApolloServer({
    schema,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataSources: (): any => ({ 
        userAPI,
        movieAPI,
        priceAPI,
    }),
    context: async ({ req }): Promise<object> => {     
        // Get the signed message from the headers.
        const signature = req.headers['x-wr-signature'];
        const rawSigData = req.headers['x-wr-sigdata'];
        if (!signature || !rawSigData) return { user: {} };

        const sigData = JSON.parse(first(rawSigData) || '{}');
        const isValid = Date.now() - sigData.timestamp < 86400000; // younger than 24 hours
        
        if (!isValid) return { user: {} };
        const account = await recoverSigner(sigData, first(signature));
        const user = await userAPI.findById(account).catch(() => ({}));
        // add the user to the context
        return { user };
      },
});
server.applyMiddleware({ app, path: '/graphql' });

const appServer = app.listen({ port: 4000 }, () =>
    console.log(`🚀 GraphQL ready at http://localhost:4000${server.graphqlPath} 🚀 \n`)
)

export default appServer;