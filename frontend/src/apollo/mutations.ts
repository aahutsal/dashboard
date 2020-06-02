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
