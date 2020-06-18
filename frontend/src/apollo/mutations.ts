import gql from 'graphql-tag';

export const SET_APP_STATE = gql`
  mutation setAppState ($stateChange: object!) {
    setAppState(stateChange: $stateChange) @client
  }
`;

export const ADD_USER = gql`
  mutation addUser ($user: UserInput!) {
    addUser(user: $user) {
      success
      message
    }
  }
`;

export const ADD_MOVIE = gql`
  mutation addMovie ($movie: MovieInput!) {
    addMovie(movie: $movie) {
      success
      message
    }
  }
`;

export const ADD_PRICE = gql`
  mutation addPrice ($pricing: PriceInput!) {
    addPrice(pricing: $pricing) {
      success
      message
    }
  }
`;

export const UPDATE_PRICE = gql`
  mutation updatePrice ($pricing: PriceInput!) {
    updatePrice(pricing: $pricing) {
      success
      message
    }
  }
`;

export const DELETE_PRICE = gql`
  mutation deletePrice ($pricing: PriceInput!) {
    deletePrice(pricing: $pricing) {
      success
      message
    }
  }
`;

export const APPROVE_USER = gql`
  mutation approveUser ($userId: String!) {
    approveUser(userId: $userId) {
      success
      message
    }
  }
`;

export const DECLINE_USER = gql`
  mutation declineUser ($userId: String!) {
    declineUser(userId: $userId) {
      success
      message
    }
  }
`;
