import ApolloClient from 'apollo-boost';

const defaultState = {
  providerInfo: null,
};

const createClient = () => {
  const client = new ApolloClient({
    resolvers: {
      Mutation: {
        setProviderInfo: (_root, { providerInfo }, { cache }) => {
          cache.writeData({
            data: { providerInfo },
          });
          return null;
        },
      },
    },
  });
  client.writeData({ data: defaultState });
  return client;
};

export default createClient();
