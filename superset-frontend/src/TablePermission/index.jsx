import React from 'react';
import ReactDOM from 'react-dom';
import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';
// import { Header } from 'react-bootstrap/lib/Modal';
import Main from './Main';
import { SET_MATOMO } from '~~constants/index';

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const instance = createInstance({
  urlBase: SET_MATOMO.URL_BASE,
  siteId: SET_MATOMO.SITE_ID,
  userId: bootstrap.user.lastName,
});

ReactDOM.render(
  <MatomoProvider value={instance}>
    <Main />
  </MatomoProvider>,
  document.getElementById('app'),
);
