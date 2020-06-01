import gql from 'graphql-tag';

export const GET_PROVIDER_INFO = gql`
  {
    provider @client {
      account @client
    }
  }
`;

export const GET_AUTH = gql`
  {
    auth @client {
      message @client
      timestamp @client
      valid @client
    }
  }
`;

export const GET_USER = gql`
  query GET_USER($accountAddress: String) {
    user(accountAddress: $accountAddress) {
      name
      email
      status
      movies {
        IMDB
        metadata {
          title
          posterUrl
        }
      }
    }
  }
`;
