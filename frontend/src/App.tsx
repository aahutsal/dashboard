import React, { Fragment, useEffect, useState } from 'react';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import { ApolloProvider } from '@apollo/react-hooks';
import apolloClient from './apollo/client';
import Titles from './containers/Titles';
import Admin from './containers/Admin';
import MovieSearch from './containers/MovieSearch';
import MoviePage from './containers/MoviePage';

import './App.css';
import { recheckConnection } from './stores/Web3';
import DashboardContextProvider from './components/DashboardContextProvider';
import RegisterPage from './containers/RegisterPage';

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
          <Route path="/admin" exact component={Admin} />
          <Route path="/register" exact component={RegisterPage} />
          <Route path="/add_movie" exact component={MovieSearch} />
          <Route path="/movie/:IMDB" exact component={MoviePage} />
        </DashboardContextProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
