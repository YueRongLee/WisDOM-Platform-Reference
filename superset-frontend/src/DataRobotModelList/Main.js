import React from 'react';
// import { Result } from 'antd';
import setupApp from '../setup/setupApp';
import { DataRobotTable } from './components';
// import { ROLE_TYPE } from '~~constants/index';
// import { RoleApi } from '~~apis/';
import './MainStyle.less';

setupApp();

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const Main = () => (
  <div className="powerbi-template">
    <div className="ManaTitle">DataRobot Model List</div>
    <DataRobotTable />
  </div>
);

Main.propTypes = {};

Main.defaultProps = {};

export default Main;
