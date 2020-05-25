import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('connect button is available', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Connecto/i);
  expect(linkElement).toBeInTheDocument();
});
