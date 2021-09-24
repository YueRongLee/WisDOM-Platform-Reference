/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React from 'react';
import { Result } from 'antd';
import { ROLE_TYPE } from '~~constants/index';
import setupApp from '../setup/setupApp';
import UserTable from './User/UserTable';
import './MainStyle.less';

setupApp();

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const Main = () => (
  <div id="user-management">
    <div className="role-management-title">User Management</div>
    {localStorage.getItem('role').includes(ROLE_TYPE.SYSTEM_MASTER) ? (
      <UserTable />
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
