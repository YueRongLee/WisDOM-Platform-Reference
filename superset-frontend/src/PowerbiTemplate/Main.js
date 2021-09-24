import React from 'react';
// import { Result } from 'antd';
import setupApp from '../setup/setupApp';
import { TemplateTable } from './components';
// import { RoleApi } from '~~apis/';
import './MainStyle.less';

setupApp();

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const Main = () => (
  <div className="powerbi-template">
    <div className="ManaTitle">Power BI Template</div>
    <TemplateTable />
  </div>
);

Main.propTypes = {};

Main.defaultProps = {};

export default Main;
