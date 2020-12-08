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
      company {
        id
        name
        kind
      }
      licenses {
        regions
        fromDate
        toDate
        medium
        movie {
          IMDB
          metadata {
            id
            imdbId
            title
            posterUrl
            year
          }
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
        kind
      }
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
        id
        imdbId
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
      licenses {
        licenseId
        companyId
        medium
        regions
        fromDate
        toDate
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

export const DISTRIBUTORS = gql`
  {
    distributors {
      id
      name
      kind
    }
  }
`;

export const COMPANY_SUBLICENSEES = gql`
{
  companySublicensees {
    licenseId
    company {
      name
      kind
    }
    movieId
    movie {
      metadata {
        title
      }
    }
    medium
    fromDate
    toDate
    regions
  }
}
`;
