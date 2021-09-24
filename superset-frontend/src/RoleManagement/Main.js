/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState } from 'react';
import { Tabs, Result } from 'antd';

import setupApp from '../setup/setupApp';
import { ROLEPERMISSION, ROLE_TYPE } from '~~constants/index';
import DataRoleTable from './components/DataRole/DataRoleTable';
import SystemRoleTable from './components/SystemRole/SystemRoleTable';

// import GroupRoleTable from './components/GroupRole/GroupRoleTable';
import './MainStyle.less';

setupApp();

const { TabPane } = Tabs;

const TAB_KEY = {
  SYSTEM_ROLE: 'System Role',
  DATA_ROLE: 'Data Role',
  // GROUP_ROLE: 'Group Role',
};

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const Main = () => {
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));
  const [currTab, setCurrTab] = useState(
    ROLEPERMISSION.checkPermission(
      SYSTEMLIST,
      ROLEPERMISSION.setting.roleManagement.systemRole.pageView.value,
    )
      ? TAB_KEY.SYSTEM_ROLE
      : TAB_KEY.DATA_ROLE,
  );

  return (
    <div id="role-management">
      <div className="role-management-title">Role Management</div>
      {localStorage.getItem('role').includes(ROLE_TYPE.SYSTEM_MASTER) ? (
        <>
          <Tabs
            type="card"
            activeKey={currTab}
            size="large"
            onChange={setCurrTab}
            tabBarStyle={{ margin: 0 }}
          >
            <>
              {SYSTEMLIST &&
              ROLEPERMISSION.checkPermission(
                SYSTEMLIST,
                ROLEPERMISSION.setting.roleManagement.systemRole.pageView.value,
              ) ? (
                <TabPane
                  tab="System Role"
                  key={TAB_KEY.SYSTEM_ROLE}
                  forceRender
                />
              ) : null}
            </>
            <>
              {SYSTEMLIST &&
              ROLEPERMISSION.checkPermission(
                SYSTEMLIST,
                ROLEPERMISSION.setting.roleManagement.dataRole.pageView.value,
              ) ? (
                <TabPane tab="Data Role" key={TAB_KEY.DATA_ROLE} forceRender />
              ) : null}
            </>

            {/* <TabPane tab="Group Role" key={TAB_KEY.GROUP_ROLE} forceRender /> */}
          </Tabs>
          {currTab === TAB_KEY.SYSTEM_ROLE &&
          SYSTEMLIST &&
          ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.setting.roleManagement.systemRole.pageView.value,
          ) ? (
            <SystemRoleTable />
          ) : null}
          {currTab === TAB_KEY.DATA_ROLE &&
          SYSTEMLIST &&
          ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.setting.roleManagement.dataRole.pageView.value,
          ) ? (
            <DataRoleTable />
          ) : null}
        </>
      ) : (
        <Result
          status="403"
          title="No permission"
          subTitle="Sorry, you are not authorized to access this page."
        />
      )}
    </div>
  );
};

Main.propTypes = {};

Main.defaultProps = {};

export default Main;
