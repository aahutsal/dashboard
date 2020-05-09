import express from 'express';
import { ApolloServer } from 'apollo-server-express';

import compression from 'compression';
import cors from 'cors';
import schema from './schema';

const app = express();
app.use('*', cors());
app.use(compression());

const server = new ApolloServer({
    schema,
});
server.applyMiddleware({ app, path: '/graphql' });

app.listen({ port: 4000 }, () =>
    console.log(`🚀 GraphQL ready at http://localhost:4000${server.graphqlPath}`)
)