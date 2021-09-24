/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import KedroViz from '@wisdom_dataplatform/wisdom-kedro-viz';
// eslint-disable-next-line no-restricted-imports
import { Result } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { WorkFlowApi } from '~~apis/';
// import { FUNCTIONS } from '~~constants/index';
import Menu from './components/Menu/Menu';
import Toolbar from './components/Toolbar/Toolbar';
import './WorkflowKedro.less';
import * as Style from './WorkflowKedroStyle';

const INIT_NODE = {
  id: undefined,
  name: 'new_node',
};

const WorkflowKedro = ({
  oEntity,
  dataFlowChangedGroupId,
  edit,
  setDiagram,
  sqlID,
  resetShowData,
  setResetShowData,
  historyMode, // true = In workspace
  save,
  setSave,
  selectGroupId,
  setCreateNewWork,
  isCreateNewWork,
}) => {
  const [showData, setShowData] = useState(oEntity); // 起始帶入資料
  const [zoomSize, setZoomSize] = useState(0); // 傳入數值,kedro用比大小判斷zoom
  const [getNode, setGetNode] = useState({});
  const [nodeData, setNodeData] = useState(INIT_NODE);
  const [finishDraw, setFinishDraw] = useState(false); // 判斷是否畫完圖
  const [focusNode, setFocusNode] = useState(undefined); // 先存起來等確認圖畫完才圈
  const [selectNodeId, setSelectNodeId] = useState(''); // 不可以是undefined
  const [resetSelectNode, setResetSelectNode] = useState(); // 不可以是undefined
  const [selectFinish, setSelectFinish] = useState(false); // 判斷是否圈完
  const [selectPage, setSelectPage] = useState('trigger'); // schedule api condition insert_data send_mail
  const [menuLoading, setMenuLoading] = useState(false);
  const [nodeClickStatus, setNodeClickStatus] = useState(false);
  const [openModalState, setOpenModalState] = useState(true);
  // const [closeModalState, setCloseModalState] = useState(false);

  const getOriginalWorkFlowData = async () => {
    if (sqlID !== undefined) {
      try {
        const result = await WorkFlowApi.getWorkFlowDetail(sqlID);
        setShowData(JSON.parse(result.diagram));
      } catch (e) {
        console.log(e);
      }
    }
  };
  // if data change
  const setSaveStatus = () => {
    setSave(false);
  };

  const setPassword = () => {
    if (showData.nodes && save === true) {
      showData.nodes.forEach((item, index) => {
        if (item.args !== undefined && item.args.frontend !== undefined) {
          showData.nodes[index].args.frontend.showPwd = '********';
        } else if (item.args !== undefined && item.args.dbInfo !== undefined) {
          showData.nodes[index].args.frontend = {
            testConnect: false,
            showPwd: '********',
          };
        }
      });
      setSaveStatus();
    }
  };

  // group 改變時回復預設值
  useEffect(() => {
    setShowData(oEntity);
    setCreateNewWork(false);
    setNodeClickStatus(false);
    setMenuLoading(false);
  }, [selectGroupId, isCreateNewWork]);

  useEffect(() => {
    setMenuLoading(true);
    setDiagram(showData);
  }, [showData]);

  useEffect(() => {
    if (historyMode === true && edit === true) {
      setMenuLoading(false);
    }
    if (edit) {
      setPassword(showData);
    }
  }, [historyMode, edit]);

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
    if (selectNodeId === undefined && resetSelectNode) {
      setSelectNodeId(resetSelectNode.id);
      setResetSelectNode();
      setNodeData({
        id: resetSelectNode.id,
        name: resetSelectNode.full_name,
        type: resetSelectNode.type,
        edit,
      });
      setSelectFinish(true);
      setFinishDraw(false);
      setMenuLoading(false);
    }
  }, [resetSelectNode]);

  useEffect(() => {
    if (
      focusNode !== undefined &&
      focusNode.id !== undefined &&
      finishDraw === true
    ) {
      if (focusNode.id === selectNodeId) {
        setSelectNodeId(undefined);
        setResetSelectNode(focusNode);
      } else {
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
      }
    } else if (finishDraw === true) {
      setFinishDraw(false);
      setSelectFinish(false);
      setMenuLoading(false);
    }

    if (focusNode !== undefined) {
      setNodeClickStatus(true);
    }
  }, [finishDraw, focusNode]);

  useEffect(() => {
    if (resetShowData) {
      getOriginalWorkFlowData();
      setResetShowData(false);
      setSelectFinish(true);
      // setMenuLoading(true);
    }
  }, [resetShowData]);

  // useEffect(() => {
  //   if (closeModalState === true && selectNodeId) {
  //     const getNode = showData.nodes.filter(e => e.id === selectNodeId);
  //     if (getNode[0] !== undefined) {
  //       setSelectFinish(false);
  //       setNodeData({
  //         edit: nodeData.edit,
  //         id: selectNodeId,
  //         name: getNode[0].full_name,
  //         type: getNode[0].type,
  //       });
  //       setFocusNode({
  //         full_name: getNode[0].full_name,
  //         name: FUNCTIONS.NODE_NAME(getNode[0].full_name),
  //         id: selectNodeId,
  //         type: getNode[0].type,
  //         edit: nodeData.edit,
  //       });
  //     }
  //     setCloseModalState(false);
  //   }
  // }, [closeModalState]);

  const closeModal = () => {
    // setNodeClickStatus(false);
    setOpenModalState(true);
    // setCloseModalState(true);
    setFocusNode(undefined);
  };

  const openModal = () => {
    setOpenModalState(false);
  };

  return (
    <>
      <div className="workflow-kedro-wrapper">
        {openModalState ? (
          <>
            <div
              className="workflow-toolbar-content"
              style={
                !edit ? { display: 'none' } : { display: 'flex', height: '90%' }
              }
            >
              <Toolbar
                nodeClickStatus={nodeClickStatus}
                orgData={oEntity}
                data={showData}
                setData={setShowData}
                zoomSize={zoomSize}
                setZoomSize={setZoomSize}
                selectNode={getNode.clicked}
                setFocusNode={setFocusNode} // 設定要圈起來的node
                focusNode={focusNode}
                setSelectFinish={setSelectFinish}
                selectPage={selectPage}
                setResetShowData={setResetShowData}
              />
            </div>
            <Style.WorkflowKedroContent>
              {/* <div className={`kedro-content ${!edit ? 'hidden' : ''}`}> */}
              {/* <KedroViz theme="light" data={tableDataformat(oEntity)} /> */}
              <KedroViz
                data={showData}
                setZoomLevel={zoomSize}
                theme="light"
                getSelectNode={setGetNode}
                selectNodeId={selectNodeId} // 圈node
                setFinishDraw={setFinishDraw} // 判斷是否畫完
              />
            </Style.WorkflowKedroContent>
          </>
        ) : (
          <>
            <div
              className="workflow-toolbar-content"
              style={{ display: 'flex', backgroundColor: '#C5D0CB' }}
            />
            <div
              className="workflow-kedro-content"
              style={{ backgroundColor: '#C5D0CB' }}
            />
          </>
        )}

        <div className="menu-content">
          {/* <Menu data={tableDataformat(oEntity)} selectNodeName={getNode.clicked && getNode.name[getNode.clicked]} /> */}
          {/* {getNode.clicked || focusNode !== undefined ? ( */}
          {nodeClickStatus || menuLoading ? (
            <Menu
              data={showData}
              setData={setShowData}
              nodeData={nodeData}
              groupId={dataFlowChangedGroupId}
              setFocusNode={setFocusNode}
              selectNode={getNode.clicked}
              focusNode={focusNode}
              setSelectFinish={setSelectFinish}
              setSelectPage={setSelectPage}
              selectPage={selectPage}
              workflowSeqId={historyMode ? sqlID : ''}
              historyMode={historyMode}
              menuLoading={menuLoading}
              setMenuLoading={setMenuLoading}
              openModal={openModal}
              closeModal={closeModal}
            />
          ) : (
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

export default WorkflowKedro;
