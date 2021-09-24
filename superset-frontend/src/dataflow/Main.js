/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect, useContext } from 'react';
import { Result } from 'antd';
import { DesktopOutlined, MenuOutlined, LeftOutlined } from '@ant-design/icons';
import { AppContext } from 'src/store/appStore';
import { useQuery } from '~~hooks/';
import { UserApi, UserManagementApi } from '~~apis/';
import { PREVIEW_STATUS, GROUP_TYPE } from '~~constants/index';
import {
  DataflowETLList,
  ETLMenu,
  DataflowETLDetail,
  WorkflowETLList,
  WorkflowETLDetail,
  WorkFlowETLInfo,
  DataflowExplore,
} from './components';
import './MainStyle.less';

const Main = ({ user }) => {
  const appStore = useContext(AppContext);
  const [curr, setCurr] = useState();
  const [workCurr, setWorkCurr] = useState();
  const [isCreateNewWork, setCreateNewWork] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState();
  const [tab, setTab] = useState('dataflow');
  const [selfGroupId, setSelfGroupId] = useState();
  const [update, setUpdate] = useState(0);
  const [drawer, setDrawer] = useState(true);
  const [groupList, setGroupList] = useState([]);
  const [selfGroupObject, setSelfGroupObject] = useState({});
  const getGroupsQuery = useQuery(UserApi.getGroups);
  // 紀錄dataflow是否為編輯狀態
  const [dataflowEdit, setDataflowEdit] = useState(false);

  // 紀錄workflow是否為編輯狀態
  const [workflowEdit, setWorkflowEdit] = useState(true);

  const getRolePermission = async () => {
    try {
      const container = document.getElementById('app');

      if (container !== null) {
        const bootstrap = JSON.parse(
          container.getAttribute('data-bootstrap') || '{}',
        );

        const result = await UserManagementApi.getUserPermission(
          bootstrap.user.emplId,
        );
        appStore.setUserInfo({ ...user, roles: result.data.role });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fourceUpdate = () => {
    let nextUpdate = update;
    setUpdate((nextUpdate += 1));
  };

  const updateCurr = newCurr => {
    setCurr(newCurr);
  };

  const updateWorkCurr = newWorkCurr => {
    setWorkCurr(newWorkCurr);
  };

  const getGroups = async () => {
    try {
      const result = await getGroupsQuery.exec({
        page: 1,
        pageSize: 9999,
        status: PREVIEW_STATUS.ALLOWED.value,
      });
      setGroupList(result.groupListData);
      const selfDefaultGroup = result.groupListData.find(
        group =>
          group.groupType === GROUP_TYPE.DEFAULT &&
          group.owner.toLowerCase() === user.emplId.toLowerCase(),
      );
      setSelfGroupId(selfDefaultGroup.groupId);
      setSelfGroupObject(selfDefaultGroup);
    } catch (e) {
      console.log(e);
    }
  };

  const dataFlowStatusRender = () => {
    if (curr !== 'new') {
      return (
        <DataflowETLDetail
          curr={curr}
          groupId={selfGroupId}
          fourceUpdate={fourceUpdate}
          setCurr={setCurr}
          edit={dataflowEdit}
          setEdit={setDataflowEdit}
        />
      );
    }

    const cart = JSON.parse(sessionStorage.getItem('cartData'));

    if (cart && cart.cartListData) {
      const selectGObj = cart.selectGroupObject;
      const selectG = cart.selectedGroup;
      const selectCol = cart.cartListData;
      sessionStorage.removeItem('cartData');

      return (
        <DataflowExplore
          selectGroupObject={selectGObj}
          selectedGroup={selectG}
          selectedColumns={selectCol}
          setSelectedColumns={setSelectedColumns}
          groupList={groupList}
          setCurr={setCurr}
          fourceUpdate={fourceUpdate}
        />
      );
    }

    return (
      <DataflowExplore
        selectGroupObject={selfGroupObject}
        selectedGroup={selfGroupId}
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
        groupList={groupList}
        setCurr={setCurr}
        fourceUpdate={fourceUpdate}
      />
    );
  };

  const workFlowStatusRender = () => {
    if (workCurr !== 'new') {
      return (
        <WorkFlowETLInfo
          curr={workCurr}
          setCurr={setWorkCurr}
          update={update}
          fourceUpdate={fourceUpdate}
          setCreateNewWork={setCreateNewWork}
          edit={workflowEdit}
          setEdit={setWorkflowEdit}
        />
      );
    }
    return (
      <WorkflowETLDetail
        curr={workCurr}
        setCurr={setWorkCurr}
        groupId={selfGroupId}
        user={user}
        groupList={groupList}
        selfGroupObject={selfGroupObject}
        fourceUpdate={fourceUpdate}
        isCreateNewWork={isCreateNewWork}
        setCreateNewWork={setCreateNewWork}
      />
    );
  };

  const checkCartData = () => {
    const cart = JSON.parse(sessionStorage.getItem('cartData'));
    if (cart) {
      setCurr('new');
      setSelfGroupId(cart.selectedGroup);
    }
  };

  useEffect(() => {
    getGroups();
    getRolePermission();
    checkCartData();
  }, []);

  return (
    <div className="workspaceContainer">
      <div
        className="list-menu"
        style={drawer ? { display: 'none' } : { display: 'flex' }}
      >
        <MenuOutlined
          onClick={() => {
            setDrawer(true);
          }}
        />
      </div>
      <div
        className="dataflowlist"
        style={
          drawer ? { display: 'block', maxWidth: '35vh' } : { display: 'none' }
        }
      >
        <div className="dataflowlist-icon">
          <LeftOutlined
            onClick={() => {
              setDrawer(false);
            }}
          />
        </div>
        <div className="list-area">
          <ETLMenu tab={tab} setTab={setTab} />
          {tab === 'dataflow' ? (
            <DataflowETLList
              curr={curr}
              setCurr={updateCurr}
              update={update}
              edit={dataflowEdit}
            />
          ) : (
            <WorkflowETLList
              setCurr={updateWorkCurr}
              curr={workCurr}
              update={update}
              setCreateNewWork={setCreateNewWork}
              edit={workflowEdit}
            />
          )}
        </div>
      </div>
      {tab === 'dataflow'
        ? curr &&
          selfGroupId &&
          //   (
          //     <DataflowETLDetail
          //       curr={curr}
          //       groupId={selfGroupId}
          //       fourceUpdate={fourceUpdate}
          //       setCurr={setCurr}
          //     />
          //   )
          dataFlowStatusRender()
        : workCurr && selfGroupId && workFlowStatusRender()}

      {!curr && !workCurr && (
        <Result
          style={{ flex: 1, paddingTop: 80 }}
          icon={<DesktopOutlined />}
          title="Welcome to Your Flows!"
          subTitle="Choose a project to get started."
        />
      )}
    </div>
  );
};

Main.propTypes = {};

Main.defaultProps = {};

export default Main;
