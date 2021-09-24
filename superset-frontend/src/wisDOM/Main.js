/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { AppContext } from 'src/store/appStore';
import { useModal } from '~~hooks/';
import { UserManagementApi } from '~~apis/';
import { TAB_KEY, ROLE_TYPE, ROLEPERMISSION } from '~~constants/index';
import {
  Explore,
  //   ExploreDataFlow,
  SearchData,
  ImportModal,
  UploadModal,
  SyncDataModal,
  CreateSyncData,
  ApplySyncDataModal,
} from './components';
import './MainStyle.less';
import * as Style from './style';

const Main = ({ user }) => {
  const appStore = useContext(AppContext);
  const [currTab, setCurrTab] = useState(TAB_KEY.FIND_DATA);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState();
  const [selectGroupObject, setSelectedGroupObject] = useState({});
  const [groupList, setGroupList] = useState([]);
  const importModal = useModal();
  const uploadModal = useModal();
  const syncDataModal = useModal();
  const createSyncData = useModal();
  const applySyncDataModal = useModal();
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));

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

        setRoles(result.data.role);
        appStore.setUserInfo({ ...user, roles: result.data.role });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleUrlToDataflow = () => {
    const cartData = {
      cartListData: selectedColumns,
      selectedGroup,
      selectGroupObject,
      groupList,
    };
    sessionStorage.setItem('cartData', JSON.stringify(cartData));
    // window.history.pushState(cartData, '', '/pipeline/newworkspace');
    window.location.href = `${window.location.origin}/pipeline/newworkspace`;
  };

  const renderExploreOrDataView = () => {
    switch (currTab) {
      case TAB_KEY.FIND_DATA:
        return (
          <div
            key={TAB_KEY.FIND_DATA}
            style={{
              height: '100%',
              // height: "100%",
              padding: '0 10px',
              backgroundColor: 'white',
              // backgroundColor: "white",
            }}
          >
            <SearchData
              next={setCurrTab}
              selectedColumns={selectedColumns}
              setSelectedColumns={setSelectedColumns}
              user={user}
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
              setSelectedGroupObject={setSelectedGroupObject}
              setGroupList={setGroupList}
            />
          </div>
        );
      case TAB_KEY.EXPLORE:
        return (
          <div key={TAB_KEY.EXPLORE} className="mainContainer">
            <Explore
              currTab={currTab}
              back={() => setCurrTab(TAB_KEY.FIND_DATA)}
              selectedColumns={selectedColumns}
              setSelectedColumns={setSelectedColumns}
              selectGroupObject={selectGroupObject}
            />
          </div>
        );
      case TAB_KEY.DATAFLOW:
        handleUrlToDataflow();
        // return (
        //   <div key={TAB_KEY.DATAFLOW} className="mainContainer">
        //     <ExploreDataFlow
        //       // back={() => setCurrTab(TAB_KEY.DATAFLOW)}
        //       selectGroupObject={selectGroupObject}
        //       selectedGroup={selectedGroup}
        //       selectedColumns={selectedColumns}
        //       setSelectedColumns={setSelectedColumns}
        //       groupList={groupList}
        //     />
        //   </div>
        // );
        return null;
      default:
        return (
          <div key={TAB_KEY.FIND_DATA} className="mainContainer">
            <SearchData
              next={setCurrTab}
              selectedColumns={selectedColumns}
              setSelectedColumns={setSelectedColumns}
              user={user}
              setGroupList={setGroupList}
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
              setSelectedGroupObject={setSelectedGroupObject}
              bolMaster={localStorage
                .getItem('role')
                .includes(ROLE_TYPE.DATA_MASTER)} // true/false
            />
          </div>
        );
    }
  };

  useEffect(() => {
    getRolePermission();
  }, []);

  return (
    <div className="wisdom">
      <Style.MainTop>
        {currTab === TAB_KEY.FIND_DATA ? (
          <div className="mainTitle">Create Data Pipeline</div>
        ) : null}
        {currTab === TAB_KEY.EXPLORE ? (
          <div className="mainTitle">Explore</div>
        ) : null}
        {currTab === TAB_KEY.FIND_DATA ? (
          <Style.ButtonGroup>
            {ROLEPERMISSION.checkPermission(
              SYSTEMLIST,
              ROLEPERMISSION.dataPipeline.createPipeline.applySyncData.value,
            ) ? (
              <Button
                bsStyle="primary"
                onClick={applySyncDataModal.openModal}
                style={
                  currTab === TAB_KEY.DATAFLOW
                    ? { display: 'none' }
                    : { display: 'block', width: 140 }
                }
              >
                Apply Sync Data
              </Button>
            ) : null}
            {localStorage.getItem('role').includes(ROLE_TYPE.DATA_MASTER) &&
            ROLEPERMISSION.checkPermission(
              SYSTEMLIST,
              ROLEPERMISSION.dataPipeline.createPipeline.syncData.value,
            ) ? (
              <Button
                bsStyle="primary"
                onClick={syncDataModal.openModal}
                style={
                  currTab === TAB_KEY.DATAFLOW
                    ? { display: 'none' }
                    : { display: 'block' }
                }
              >
                Sync Data
              </Button>
            ) : null}
            {ROLEPERMISSION.checkPermission(
              SYSTEMLIST,
              ROLEPERMISSION.dataPipeline.createPipeline.uploadData.value,
            ) ? (
              <Button
                bsStyle="primary"
                onClick={uploadModal.openModal}
                style={
                  currTab === TAB_KEY.DATAFLOW
                    ? { display: 'none', width: 120 }
                    : { display: 'block', width: 120 }
                }
              >
                Upload
              </Button>
            ) : null}
          </Style.ButtonGroup>
        ) : null}
      </Style.MainTop>
      {renderExploreOrDataView()}
      <ImportModal modal={importModal} onUploadExist={uploadModal.openModal} />
      <UploadModal modal={uploadModal} onCreateNew={importModal.openModal} />
      <CreateSyncData
        modal={createSyncData}
        roles={roles}
        onUploadExist={syncDataModal.openModal}
      />
      <SyncDataModal
        modal={syncDataModal}
        onCreateNew={createSyncData.openModal}
      />
      <ApplySyncDataModal modal={applySyncDataModal} />
    </div>
  );
};

Main.propTypes = {
  user: PropTypes.shape({}),
};

Main.defaultProps = {
  user: {},
};

export default Main;
