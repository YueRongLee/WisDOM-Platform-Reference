/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React from 'react';
import { Result } from 'antd';
import { ROLE_TYPE } from '~~constants/index';

import { MasterTableList } from './components';
import setupApp from '../setup/setupApp';
import './MainStyle.less';

setupApp();

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const Main = () => (
  <div className="group-permission">
    <div className="PermissionTitle">Group Permission</div>
    {localStorage.getItem('role').includes(ROLE_TYPE.SYSTEM_MASTER) ? (
      <MasterTableList />
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
