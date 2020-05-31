import express from 'express';
import { ApolloServer } from 'apollo-server-express';

import compression from 'compression';
import cors from 'cors';
import schema from './schema';
import Dynamo from './datasources/Dynamo';
import UserAPI from './datasources/UserAPI';

const app = express();
app.use('*', cors());
app.use(compression());

const server = new ApolloServer({
    schema,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataSources: (): any => ({ 
        userAPI: new UserAPI(),
        movieAPI: new Dynamo()
    })
});
server.applyMiddleware({ app, path: '/graphql' });

const appServer = app.listen({ port: 4000 }, () =>
    console.log(`🚀 GraphQL ready at http://localhost:4000${server.graphqlPath} 🚀 \n`)
)

export default appServer;