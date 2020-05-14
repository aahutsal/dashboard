import gql from "graphql-tag";

export const GET_ACCOUNT = gql`
  {
    account @client
  }
`;

export const GET_PROVIDER_INFO = gql`
  {
    providerInfo @client {
      account @client
    }
  }
`;