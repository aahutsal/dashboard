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
      contact
      status
      roles
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

export const PENDING_USERS = gql`
  {
    pendingUsers {
      accountAddress
      name
      contact
    }
  }
`;
