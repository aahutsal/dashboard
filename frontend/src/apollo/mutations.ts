import gql from "graphql-tag";

export const SET_PROVIDER_INFO = gql`
  mutation setProviderInfo ($providerInfo: object!) {
    setProviderInfo(providerInfo: $providerInfo) @client
  }
`;