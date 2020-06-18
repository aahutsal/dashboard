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
      id
      imdbId
      email
      status
      roles
      movies {
        IMDB
        metadata {
          id
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
      imdbId
      email
    }
  }
`;

export const GET_MOVIE = gql`
  query GET_MOVIE($IMDB: String) {
    movie(IMDB: $IMDB) {
      IMDB
      metadata {
        title
        posterUrl
      }
      pricing {
        priceId
        medium
        region
        amount
        fromWindow
        toWindow
      }
    }
  }
`;
