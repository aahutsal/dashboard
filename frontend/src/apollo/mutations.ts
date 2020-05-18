import gql from 'graphql-tag';

// temporarily because we only have one export at present
// eslint-disable-next-line import/prefer-default-export
export const SET_PROVIDER_INFO = gql`
  mutation setProviderInfo ($providerInfo: object!) {
    setProviderInfo(providerInfo: $providerInfo) @client
  }
`;
