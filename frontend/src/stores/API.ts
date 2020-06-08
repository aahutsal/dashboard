import { User } from '@whiterabbitjs/dashboard-common';
import { GET_AUTH, GET_USER } from '../apollo/queries';
import client from '../apollo/client';

// TODO: add types
const getAuth = (): Promise<object> => client.query({ query: GET_AUTH }).then((res) => res.data);

const getUser = async (account: string): Promise<User> => client.query({
  query: GET_USER,
  variables: {
    accountAddress: account,
  },
})
  .then((res) => res.data.user)
  .catch(() => ({}));

export default {
  getAuth,
  getUser,
};
