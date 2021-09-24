/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import React from 'react';
// import { Result } from 'antd';
import setupApp from '../setup/setupApp';
import { DataSetTable } from './components';
// import { ROLE_TYPE } from '~~constants/index';

import './MainStyle.less';

setupApp();

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const Main = () => (
  <div className="dataset-management">
    <div className="ManaTitle">Dataset Management</div>
    <DataSetTable />
  </div>
);

Main.propTypes = {};

Main.defaultProps = {};

export default Main;
