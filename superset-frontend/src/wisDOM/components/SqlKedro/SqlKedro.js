/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import KedroViz from '@wisdom_dataplatform/wisdom-kedro-viz';
// import PropTypes from 'prop-types';
import { Result } from 'antd';
// import moment from 'moment';
import { InfoCircleOutlined } from '@ant-design/icons';
// import { DataFlowApi } from '~~apis/';
import Menu from './components/Menu/Menu';
import Toolbar from './components/Toolbar/Toolbar';
import './sqlKedro.less';
import * as Style from './sqlKedroStyle';

const INIT_NODE = {
  id: undefined,
  name: 'new_node',
};

const SqlKedro = ({
  className,
  oEntity,
  dataFlowChangedGroupId,
  edit,
  setDiagram,
  sqlID,
  resetShowData,
  setResetShowData,
  changeGroupStatus,
  setChangeGroup,
  historyMode, // true = In workspace
  projectName,
  diagram,
  schedule,
  handleResume,
  setPublishChange,
  usedTargetList,
}) => {
  const [showData, setShowData] = useState(oEntity); // 起始帶入資料
  const [zoomSize, setZoomSize] = useState(0); // 傳入數值,kedro用比大小判斷zoom
  const [getNode, setGetNode] = useState({});
  const [nodeData, setNodeData] = useState({ ...INIT_NODE, edit }); // 點選node時kedro帶回來的資料
  const [finishDraw, setFinishDraw] = useState(false); // 判斷是否畫完圖
  const [focusNode, setFocusNode] = useState(undefined); // 先存起來等確認圖畫完才圈
  const [selectNodeId, setSelectNodeId] = useState(''); // 不可以是undefined
  const [selectFinish, setSelectFinish] = useState(false); // 判斷是否圈完
  const [selectPage, setSelectPage] = useState('dataset'); // dataset、transform、target
  const [hasZoomOut, setHasZoomOut] = useState(false); // 一進來要縮小
  const [menuLoading, setMenuLoading] = useState(false);
  const [nodeClickStatus, setNodeClickStatus] = useState(false);

  const handleZoomOut = () => {
    const size = (zoomSize * 10 - 1 * 10) / 10;
    setZoomSize(size);
    setHasZoomOut(true);
  };

  useEffect(() => {
    setDiagram(showData);
    if (nodeClickStatus) {
      setMenuLoading(true);
    }
  }, [showData]);

  useEffect(() => {
    if (historyMode === true && edit === true) {
      setMenuLoading(false);
    }
  }, [historyMode, edit]);

  useEffect(() => {
    if (changeGroupStatus) {
      setFinishDraw(true);
      setSelectFinish(true);
      setShowData({ edges: [], nodes: [] });
      setChangeGroup(false);
      setFocusNode(undefined);
      setNodeClickStatus(false);
    }
  }, [changeGroupStatus]);

  //   useEffect(() => {
  //     if (getNode.clicked !== undefined && getNode.clicked !== null) {
  //       setNodeData({
  //         id: getNode.clicked,
  //         name: getNode.fullName[getNode.clicked],
  //         type: getNode.type[getNode.clicked],
  //         edit,
  //       });
  //       if (focusNode !== undefined) {
  //         setFocusNode(undefined);
  //       }
  //       setNodeClickStatus(true);
  //     } else {
  //       setNodeData({
  //         id: getNode.clicked,
  //         name: undefined,
  //         type: undefined,
  //         edit,
  //       });

  //       if (selectFinish === true && getNode.clicked === null) {
  //         // 圈完後點旁邊要清除
  //         setFocusNode(undefined);
  //         setSelectFinish(false);
  //       }
  //       setNodeClickStatus(false);
  //     }
  //   }, [getNode, edit]);

  useEffect(() => {
    if (getNode.clicked !== undefined && getNode.clicked !== null) {
      setNodeData({
        id: getNode.clicked,
        name: getNode.fullName[getNode.clicked],
        type: getNode.type[getNode.clicked],
        edit,
      });
      setFocusNode({
        id: getNode.clicked,
        name: getNode.fullName[getNode.clicked],
        type: getNode.type[getNode.clicked],
        edit,
      });
      setNodeClickStatus(true);
    } else {
      setNodeData({
        id: getNode.clicked || (focusNode && focusNode.id),
        name: focusNode && focusNode.full_name,
        type: focusNode && focusNode.type,
        edit,
      });

      if (selectFinish === true && getNode.clicked === null) {
        // 圈完後點旁邊要清除
        setFocusNode(undefined);
        setSelectFinish(false);
      }
      setNodeClickStatus(false);
    }
  }, [getNode, edit]);

  useEffect(() => {
    if (
      focusNode !== undefined &&
      // focusNode !== '' &&
      focusNode.id !== undefined &&
      finishDraw === true
    ) {
      setSelectNodeId(focusNode.id);
      setNodeData({
        id: focusNode.id,
        name: focusNode.full_name,
        type: focusNode.type,
        edit,
      });
      setSelectFinish(true);
      setFinishDraw(false);
      setMenuLoading(false);
    } else if (finishDraw === true) {
      if (hasZoomOut === false) {
        // 只判斷一次
        if (Object.values(getNode.name).length === 1) {
          handleZoomOut();
        }
        setHasZoomOut(true);
      }
      setFinishDraw(false);
      setSelectFinish(false);
      setMenuLoading(false);
    }

    if (focusNode !== undefined) {
      setNodeClickStatus(true);
    }
  }, [finishDraw, focusNode]);

  useEffect(() => {
    if (resetShowData === true) {
      //   getDataFlowDetail();
      setShowData(oEntity);
      setResetShowData(false);
      setSelectFinish(true);
      setMenuLoading(true);
      setNodeData({
        id: undefined,
        name: undefined,
        type: undefined,
        edit,
      });
      setNodeClickStatus(false);
      setMenuLoading(false);
    }
  }, [resetShowData]);

  return (
    <>
      <div className={`kedro-wrapper ${className}`}>
        <div className={`toolbar-content ${!edit ? 'hidden' : ''}`}>
          <Toolbar
            // orgData={oEntity}
            data={showData}
            setData={setShowData}
            zoomSize={zoomSize}
            setZoomSize={setZoomSize}
            selectNode={getNode.clicked}
            setFocusNode={setFocusNode} // 設定要圈起來的node
            focusNode={focusNode}
            setSelectFinish={setSelectFinish}
            selectPage={selectPage}
            setMenuLoading={setMenuLoading}
            historyMode={historyMode}
            handleResume={handleResume}
            setResetShowData={setResetShowData}
          />
        </div>
        <Style.KedroContent>
          <KedroViz
            data={showData}
            setZoomLevel={zoomSize}
            theme="light"
            getSelectNode={setGetNode}
            selectNodeId={selectNodeId} // 圈node
            setFinishDraw={setFinishDraw} // 判斷是否畫完
          />
        </Style.KedroContent>
        <div className="menu-content">
          {/* {getNode.clicked || focusNode !== undefined ? ( */}
          {nodeClickStatus || menuLoading ? (
            // <Spin spinning={menuLoading}>//會影響scroll bar先拿掉
            <Menu
              data={showData}
              setData={setShowData}
              defaultTable={oEntity}
              nodeData={nodeData}
              setNodeData={setNodeData}
              groupId={dataFlowChangedGroupId}
              setFocusNode={setFocusNode}
              selectNode={getNode.clicked}
              focusNode={focusNode}
              setSelectFinish={setSelectFinish}
              setSelectPage={setSelectPage}
              selectPage={selectPage}
              sqlID={sqlID}
              projectName={projectName}
              diagram={diagram}
              schedule={schedule}
              setPublishChange={setPublishChange}
              historyMode={historyMode}
              usedTargetList={usedTargetList}
            />
          ) : (
            // </Spin>
            <Result
              style={{ flex: 1, paddingTop: 80 }}
              icon={<InfoCircleOutlined />}
              title="No node selected!"
              subTitle="Choose a node from the graph to view its configuration properties."
            />
          )}
        </div>
      </div>
    </>
  );
};

SqlKedro.propTypes = {};

SqlKedro.defaultProps = {};

export default SqlKedro;
