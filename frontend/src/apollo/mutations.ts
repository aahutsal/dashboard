import gql from 'graphql-tag';

// temporarily because we only have one export at present
// eslint-disable-next-line import/prefer-default-export
export const SET_APP_STATE = gql`
  mutation setAppState ($stateChange: object!) {
    setAppState(stateChange: $stateChange) @client
  }
`;
