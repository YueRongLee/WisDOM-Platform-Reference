/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React from 'react';
import { Result } from 'antd';
import setupApp from '../setup/setupApp';
import { CategoryTable } from './components';
import { ROLE_TYPE } from '~~constants/index';
// import { RoleApi } from '~~apis/';
import './MainStyle.less';

setupApp();

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const Main = () => (
  <div className="category-management">
    <div className="ManaTitle">Data Domain Management</div>

    {localStorage.getItem('role').includes(ROLE_TYPE.DATA_MASTER) ? (
      <CategoryTable />
    ) : (
      <Result
        status="403"
        title="No permission"
        subTitle="Sorry, you are not authorized to access this page."
      />
    )}
  </div>
);
Main.propTypes = {};

Main.defaultProps = {};

export default Main;
