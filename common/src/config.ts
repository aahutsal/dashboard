// eslint-disable-next-line import/prefer-default-export
export const NETWORK_ID = 1; // Using Mainnet to spare users switch to XDAI

const endpoints = {
  development: 'http://localhost:4000/graphql',
  staging: 'https://staging-api.whiterabbit.one/graphql',
  production: 'https://be-dashboard.whiterabbit.one/graphql',
} as { [env: string]: string };

export const apiEndpoint = (env?: string) => endpoints[env || 'development'];
