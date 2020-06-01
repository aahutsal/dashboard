import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('connect button is available', () => {
  const { getByText } = render(<App />);
  expect(getByText(/Connect/)).toBeInTheDocument();
  expect(
    getByText(/Please connect your wallet first/)
  ).toBeInTheDocument();
});
