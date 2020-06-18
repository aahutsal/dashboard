import { ApolloError } from 'apollo-boost';

export default (error: ApolloError) => {
  if (error.graphQLErrors) {
    return error.graphQLErrors.map((e) => e.message);
  }
  return error.message;
};
