import ApolloClient from 'apollo-boost';
import { GET_AUTH } from './queries';

const backendEndpoint = process.env.NODE_ENV === 'development'
  ? 'http://localhost:4000/graphql'
  : 'https://be-dashboard.whiterabbit.one/graphql';

const client = new ApolloClient({
  uri: backendEndpoint,
  resolvers: {
    Mutation: {
      setAppState: (_root, { stateChange }, { cache }) => {
        cache.writeData({
          data: { ...stateChange },
        });
        return null;
      },
    },
  },
  request: (operation) => {
    const data = client.query({ query: GET_AUTH }).then((res) => res.data) as any;
    operation.setContext({
      headers: {
        'x-wr-signature': data.message,
        'x-wr-sigdata': JSON.stringify({ timestamp: data.timestamp }),
      },
    });
  },
});

client.writeData({
  data: {
    auth: {
      __typename: 'Auth',
    },
    provider: {
      __typename: 'Provider',
    },
  },
});

export default client;
