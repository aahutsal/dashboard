import React, { Fragment, useEffect, useState } from 'react';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import { ApolloProvider } from '@apollo/react-hooks';
import apolloClient from './apollo/client';
import Titles from './containers/Titles';
import Rightsholders from './containers/Rightsholders';
import Register from './containers/Register';
import MovieSearch from './containers/MovieSearch';
import MoviePrice from './containers/MoviePrice';

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
          <Route path="/rightsholders" exact component={Rightsholders} />
          <Route path="/register" exact component={Register} />
          <Route path="/movie/add" exact component={MovieSearch} />
          <Route path="/movie/prices/:IMDB" exact component={MoviePrice} />
        </DashboardContextProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
