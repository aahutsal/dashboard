import React, { Fragment, useEffect, useState } from 'react';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import { ApolloProvider } from '@apollo/react-hooks';
import apolloClient from './apollo/client';
import Titles from './containers/Titles';
import Payments from './containers/Payments';
import Register from './containers/Register';

import './App.css';
import { recheckConnection } from './stores/Web3';
import DashboardContextProvider from './components/DashboardContextProvider';

function App() {
  const [inited, setInited] = useState(false);
  useEffect(() => {
    recheckConnection().then(() => setInited(true));
  }, []);

  if (!inited) return (<Fragment />);

  return (
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <DashboardContextProvider>
          <Route path="/" exact component={Titles} />
          <Route path="/payments" exact component={Payments} />
          <Route path="/register" exact component={Register} />
        </DashboardContextProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
