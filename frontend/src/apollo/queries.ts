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
      kind
      status
      roles
      company { 
        id
        name
      }
      movies {
        IMDB
        metadata {
          id
          title
          posterUrl
          year
        }
      }
    }
  }
`;

export const PENDING_USERS = gql`
  {
    pendingUsers {
      company {
        name
      }
      accountAddress
      name
      imdbId
      email
      kind
    }
  }
`;

export const GET_MOVIE = gql`
  query GET_MOVIE($IMDB: String) {
    movie(IMDB: $IMDB) {
      IMDB
      metadata {
        id
        title
        posterUrl
        year
      }
      pricing {
        priceId
        medium
        regions
        amount
        fromWindow
        toWindow
      }
    }
  }
`;


export const GET_CONFIG = gql`
  {
    config {
      factor
    }
  }
`;
