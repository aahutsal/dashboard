import { apiEndpoint } from '@whiterabbitjs/dashboard-common';
import ApolloClient from 'apollo-boost';
import { GET_AUTH } from './queries';


const client = new ApolloClient({
  uri: apiEndpoint(process.env.REACT_APP_RABBIT_ENV),
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
  request: async (operation) => {
    const { data } = (await client.query({ query: GET_AUTH })) as any;
    operation.setContext({
      headers: {
        'x-wr-signature': data.auth.message,
        'x-wr-sigdata': JSON.stringify({ timestamp: data.auth.timestamp }),
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
