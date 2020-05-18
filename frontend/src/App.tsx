import React, { Fragment } from 'react';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import { ApolloProvider } from '@apollo/react-hooks';
import apolloClient from './apollo/client';
import Titles from './containers/Titles';
import Payments from './containers/Payments';

import './App.css';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <Fragment>
          <Route path="/" exact component={Titles} />
          <Route path="/payments" exact component={Payments} />
        </Fragment>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
