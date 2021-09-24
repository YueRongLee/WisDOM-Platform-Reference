import React from 'react';
import ReactDOM from 'react-dom';
import Main from './Main';
import { AppContextProvider } from '../store/appStore';
import setupApp from '../setup/setupApp';

setupApp();

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const App = () => (
  <AppContextProvider>
    <Main user={bootstrap.user} />
  </AppContextProvider>
);

ReactDOM.render(<App />, document.getElementById('app'));
