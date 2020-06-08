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
