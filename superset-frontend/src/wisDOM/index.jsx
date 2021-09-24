import React from 'react';
import ReactDOM from 'react-dom';
import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';
import { SET_MATOMO } from '~~constants/index';
import Main from './Main';
import { AppContextProvider } from '../store/appStore';
import setupApp from '../setup/setupApp';

setupApp();

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const instance = createInstance({
  urlBase: SET_MATOMO.URL_BASE,
  siteId: SET_MATOMO.SITE_ID,
  userId: bootstrap.user.lastName,
});

const App = () => (
  <AppContextProvider>
    <Main user={bootstrap.user} />
  </AppContextProvider>
);

ReactDOM.render(
  <MatomoProvider value={instance}>
    <App />
  </MatomoProvider>,
  document.getElementById('app'),
);
