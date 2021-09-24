/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Tabs, Badge } from 'antd';
import {
  PREVIEW_STATUS,
  ROLE_TYPE,
  SYSTEM_TYPE,
  ROLEPERMISSION,
} from '~~constants/index';
import { TableApi } from '~~apis/';
import {
  TableList,
  CustomTableList,
  DeliverZoneList,
  GroupTableList,
  SyncDataTableList,
  CategoryTableList,
} from './components';
import ApplicationTableList from './components/ApplicationRecord/ApplicationTableList/ApplicationTableList';
import ApplicationCustomTableList from './components/ApplicationRecord/CustomTableList/CustomTableList';
import ApplicationDeliverZoneList from './components/ApplicationRecord/DeliverZoneList/DeliverZoneList';
import setupApp from '../setup/setupApp';
import './MainStyle.less';

setupApp();

const { TabPane } = Tabs;
const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const TAB_KEY = {
  GRANT_PERMISSION: 'GRANT_PERMISSION',
  APPLICATION_RECORD: 'APPLICATION_RECORD',
  GROUP_PERMISSION: 'GROUP_PERMISSION',
  REQUEST_SYNC_DATA: 'REQUEST_SYNC_DATA',
  CATEGORY_PERMISSION: 'CATEGORY_PERMISSION',
};

const Main = () => {
  const [currTab, setCurrTab] = useState(TAB_KEY.APPLICATION_RECORD);

  const [categoryPermission, setCategoryPermission] = useState(0);
  const [datasetPermission, setDatasetPermission] = useState(0);
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));

  const getApprovingCounts = async () => {
    try {
      const result = await TableApi.getApprovingCounts();
      setCategoryPermission(result.categoryPermission);
      setDatasetPermission(result.datasetPermission);
    } catch (e) {
      console.log(e);
    }
  };

  const refreshCount = () => {
    getApprovingCounts();
  };

  useEffect(() => {
    getApprovingCounts();
  }, []);

  return (
    <div className="tablePermission">
      <div className="tabletitle">Table Permission</div>
      <Tabs
        type="card"
        onChange={setCurrTab}
        activeKey={currTab}
        tabBarStyle={{ margin: 0 }}
      >
        {ROLEPERMISSION.checkPermission(
          SYSTEMLIST,
          ROLEPERMISSION.dataPipeline.tablePremission.applicationRecord.pageView
            .value,
        ) ? (
          <TabPane
            tab="Application Record"
            key={TAB_KEY.APPLICATION_RECORD}
            forceRender
          />
        ) : null}
        {ROLEPERMISSION.checkPermission(
          SYSTEMLIST,
          ROLEPERMISSION.dataPipeline.tablePremission.datasetPermission.pageView
            .value,
        ) ? (
          <TabPane
            tab={
              <>
                <span style={{ marginRight: 5 }}>Dataset Permission </span>
                <Badge count={datasetPermission} />
              </>
            } // Grant Permission
            key={TAB_KEY.GRANT_PERMISSION}
            forceRender
          />
        ) : null}
        {ROLEPERMISSION.checkPermission(
          SYSTEMLIST,
          ROLEPERMISSION.dataPipeline.tablePremission.dataDomainPermission
            .pageView.value,
        ) ? (
          <TabPane
            tab={
              <>
                <span style={{ marginRight: 5 }}>Data Domain Permission</span>
                <Badge count={categoryPermission} />
              </>
            }
            key={TAB_KEY.CATEGORY_PERMISSION}
            forceRender
          />
        ) : null}

        {localStorage.getItem('role').includes(ROLE_TYPE.DATA_MASTER) &&
        ROLEPERMISSION.checkPermission(
          SYSTEMLIST,
          ROLEPERMISSION.dataPipeline.tablePremission.groupPermission.pageView
            .value,
        ) ? (
          <TabPane
            tab="Group Permission"
            key={TAB_KEY.GROUP_PERMISSION}
            forceRender
          />
        ) : null}
        {localStorage.getItem('role').includes(ROLE_TYPE.DATA_MASTER) &&
        ROLEPERMISSION.checkPermission(
          SYSTEMLIST,
          ROLEPERMISSION.dataPipeline.tablePremission.requestSyncDataPermission
            .pageView.value,
        ) ? (
          <TabPane
            tab="Request Sync Data"
            key={TAB_KEY.REQUEST_SYNC_DATA}
            forceRender
          />
        ) : null}
      </Tabs>
      {currTab === TAB_KEY.GRANT_PERMISSION &&
      ROLEPERMISSION.checkPermission(
        SYSTEMLIST,
        ROLEPERMISSION.dataPipeline.tablePremission.datasetPermission.pageView
          .value,
      ) ? (
        <div className="mainContainer">
          <TableList
            allowed={PREVIEW_STATUS.APPLYING.value}
            hideData={['allowed']}
            tableType={[SYSTEM_TYPE.props.WisDOM.key]}
            page="1"
            pageSize="9999"
            refreshCount={refreshCount}
          />

          <CustomTableList
            allowed={PREVIEW_STATUS.APPLYING.value}
            hideData={['status']}
            page="1"
            pageSize="9999"
            refreshCount={refreshCount}
          />

          <DeliverZoneList
            allowed={PREVIEW_STATUS.APPLYING.value}
            tableType={[SYSTEM_TYPE.props.WDC.key, SYSTEM_TYPE.props.WDL.key]}
            page="1"
            pageSize="9999"
            refreshCount={refreshCount}
          />
        </div>
      ) : null}
      {currTab === TAB_KEY.APPLICATION_RECORD &&
      ROLEPERMISSION.checkPermission(
        SYSTEMLIST,
        ROLEPERMISSION.dataPipeline.tablePremission.applicationRecord.pageView
          .value,
      ) ? (
        <div className="mainContainer">
          <ApplicationTableList
            userId={bootstrap.user.emplId}
            showDetail={false}
            tableType={[SYSTEM_TYPE.props.WisDOM.key]}
            page="1"
            pageSize="9999"
          />

          <ApplicationCustomTableList
            userId={bootstrap.user.emplId}
            showDetail={false}
            page="1"
            pageSize="9999"
          />

          <ApplicationDeliverZoneList
            userId={bootstrap.user.emplId}
            showDetail={false} // record不可以按
            tableType={[SYSTEM_TYPE.props.WDC.key, SYSTEM_TYPE.props.WDL.key]}
            page="1"
            pageSize="9999"
          />
        </div>
      ) : null}
      {currTab === TAB_KEY.GROUP_PERMISSION &&
      ROLEPERMISSION.checkPermission(
        SYSTEMLIST,
        ROLEPERMISSION.dataPipeline.tablePremission.groupPermission.pageView
          .value,
      ) ? (
        <div className="mainContainer">
          <GroupTableList page="1" pageSize="9999" />
        </div>
      ) : null}
      {currTab === TAB_KEY.REQUEST_SYNC_DATA &&
      ROLEPERMISSION.checkPermission(
        SYSTEMLIST,
        ROLEPERMISSION.dataPipeline.tablePremission.requestSyncDataPermission
          .pageView.value,
      ) ? (
        <div className="mainContainer">
          <SyncDataTableList />
        </div>
      ) : null}
      {currTab === TAB_KEY.CATEGORY_PERMISSION &&
      ROLEPERMISSION.checkPermission(
        SYSTEMLIST,
        ROLEPERMISSION.dataPipeline.tablePremission.dataDomainPermission
          .pageView.value,
      ) ? (
        <div className="mainContainer">
          <CategoryTableList refreshCount={refreshCount} />
        </div>
      ) : null}
    </div>
  );
};

Main.propTypes = {};

Main.defaultProps = {};

export default Main;
