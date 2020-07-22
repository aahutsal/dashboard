import client from '../apollo/client';
import { GET_AUTH } from '../apollo/queries';
import { REVENUE_API } from '../config';

// eslint-disable-next-line import/prefer-default-export
export const claimRevenue = async (movieId: string, region: string) => {
  const { data } = await client.query({ query: GET_AUTH }) as any;
  const headers = {
    'Content-Type': 'application/json',
    'x-wr-signature': data.auth.message,
    'x-wr-sigdata': JSON.stringify({ timestamp: data.auth.timestamp }),
  };

  const url = `${REVENUE_API}/pool/claim/${movieId}/${region}`;

  return fetch(url, { method: 'POST', headers })
    .then((res) => res.json());
};
