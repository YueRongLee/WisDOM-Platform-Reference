/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Result } from 'antd';
import { DesktopOutlined } from '@ant-design/icons';
import { useQuery } from '~~hooks/';
import { UserApi } from '~~apis/';
import { PREVIEW_STATUS, GROUP_TYPE } from '~~constants/index';
import setupApp from '../setup/setupApp';
import { ETLList, ETLDetail, ETLShareDetail } from './components';
import './MainStyle.less';

setupApp();

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const Main = () => {
  const [curr, setCurr] = useState();
  const [shareCurr, setShareCurr] = useState();
  const [update, setUpdate] = useState(0);
  const [updateShare, setUpdateShare] = useState(0);
  const [groupList, setGroupList] = useState([]);
  const [selfGroupObject, setSelfGroupObject] = useState({});
  const getGroupsQuery = useQuery(UserApi.getGroups);

  const forceUpdate = () => {
    let nextUpdate = update;
    setUpdate((nextUpdate += 1));
  };

  const forceUpdateShare = () => {
    let nextUpdate = updateShare;
    setUpdateShare((nextUpdate += 1));
  };

  const updateCurr = newCurr => {
    setShareCurr();
    setCurr(newCurr);
  };

  const updateShareCurr = newShareCurr => {
    setCurr();
    setShareCurr(newShareCurr);
  };

  const getGroups = async () => {
    try {
      const result = await getGroupsQuery.exec({
        page: 1,
        pageSize: 9999,
        status: PREVIEW_STATUS.ALLOWED.value,
      });
      setGroupList(result);
      const selfDefaultGroup = result.groupListData.find(
        group =>
          group.groupType === GROUP_TYPE.DEFAULT &&
          group.owner.toLowerCase() === bootstrap.user.emplId.toLowerCase(),
      );
      setSelfGroupObject(selfDefaultGroup);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getGroups();
  }, []);

  return (
    <div className="workspaceContainer">
      <ETLList
        curr={curr}
        setCurr={updateCurr}
        setShareCurr={updateShareCurr}
        update={update}
        updateShare={updateShare}
      />
      {curr && (
        <ETLDetail
          curr={curr}
          setCurr={updateCurr}
          forceUpdate={forceUpdate}
          forceUpdateShare={forceUpdateShare}
          user={bootstrap.user}
        />
      )}
      {shareCurr && (
        <ETLShareDetail
          curr={shareCurr}
          setCurr={updateShareCurr}
          forceUpdate={forceUpdate}
          user={bootstrap.user}
          groupList={groupList}
          selfGroupObject={selfGroupObject}
        />
      )}
      {!curr && !shareCurr && (
        <Result
          style={{ flex: 1, paddingTop: 80 }}
          icon={<DesktopOutlined />}
          title="Welcome to Your Workspace!"
          subTitle="Choose a project to get started."
        />
      )}
    </div>
  );
};

Main.propTypes = {};

Main.defaultProps = {};

export default Main;
