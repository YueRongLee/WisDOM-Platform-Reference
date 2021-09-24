/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable consistent-return */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
// import Schema from './MenuItem/Dataset/Schema';
// import { Spin } from 'antd';
import { FUNCTIONS } from '~~constants/index';
import { WorkFlowApi } from '~~apis/';
import ScheduleNodeMenu from './ScheduleNodeMenu';
import ConditionNodeMenu from './ConditionNodeMenu';
import ScheduleNodeItem from './NodeItem';
import ConditionNodeItem from './ConditionNodeItem';
import SchedulePoperties from './MenuItem/Schedule/Poperties';
import InsertDataSubPoperties from './MenuItem/InsertData/SubPoperties';
import InsertDataPoperties from './MenuItem/InsertData/Poperties';
import SendMailPoperties from './MenuItem/SendMail/Poperties';
import ConditionPoperties from './MenuItem/Condition/Poperties';
import PostTeamsPoperties from './MenuItem/PostTeams/Poperties';
import PowerBiPoperties from './MenuItem/PowerBi/Poperties';
import PowerBiSubPoperties from './MenuItem/PowerBi/SubPoperties';
import PowerBiCondition from './MenuItem/PowerBi/Sub2Poperties';
import PowerBiEmailGroup from './MenuItem/PowerBi/Sub3Poperties';
import PostApiPoperties from './MenuItem/PostApi/Poperties';
import DataRobotPrediction from './MenuItem/DataRobot/MakeDataRobotPrediction/Poperties';
import DataRobotProject from './MenuItem/DataRobot/CreateDataRobotProject/Poperties';
import DataRobotAutoML from './MenuItem/DataRobot/CreateDataRobotProject/DataRobotAutoML';
import DataRobotAutoTS from './MenuItem/DataRobot/CreateDataRobotProject/DataRobotAutoTS';
// import { PostAPI } from './style';

const Menu = ({
  data,
  groupId,
  nodeData,
  setData,
  setFocusNode,
  setSelectFinish,
  selectPage,
  setSelectPage,
  selectNode,
  focusNode,
  menuLoading,
  workflowSeqId,
  setMenuLoading,
  historyMode,
  closeModal,
  openModal,
}) => {
  const [nodeChange, setNodeChange] = useState({}); // for user change data
  // const [edgeChange, setEdgeChange] = useState(undefined); // for user change edge
  const [action, setAction] = useState(); // 記錄選擇哪個dataset(table)
  const [recordHeader, setRecordHeader] = useState(); // 點選哪個header menude
  const [selectItem, setSelectItem] = useState('node');
  const [outputType, setOutputType] = useState();
  const [classificationType, setClassificationType] = useState(false);
  const [preNodeData, setPreNodeData] = useState(nodeData); // 存變化前的nodeData
  const [dataflowList, setDataflowList] = useState();
  const [dataflowLoading, setDataflowLoading] = useState();
  const [dataRobotTarget, setDataRobotTarget] = useState();
  const [tables, setTables] = useState([]);

  const getDataflowList = async () => {
    setDataflowLoading(true);
    try {
      const result = await WorkFlowApi.getDataflowByGroup(groupId); // check editing
      const list = result.map(e => ({
        key: e.seqId,
        value: e.projectName,
      }));

      setDataflowList(list);
    } catch (e) {
      console.log(e);
    } finally {
      setDataflowLoading(false);
    }
  };

  useEffect(() => {
    if (groupId !== undefined && groupId !== '') {
      getDataflowList(groupId);
    }
  }, []);

  useEffect(() => {
    if (groupId !== undefined && groupId !== '') {
      getDataflowList(groupId);
    }
  }, [groupId]);

  const handleCheckArg = () => {
    if (!(focusNode === undefined && selectNode === null)) {
      if (nodeData.id !== undefined) {
        const index = data.nodes.findIndex(e => e.id === nodeData.id);
        if (index !== -1 && data.nodes[index].args !== undefined) {
          const nodeArg = data.nodes[index].args;
          const tempClassification =
            nodeArg.classification !== undefined ? nodeArg.classification : '';
          const tempOutputType =
            nodeArg.output !== undefined ? nodeArg.output : '';

          setClassificationType(tempClassification);
          if (tempClassification === 'insertData') {
            setOutputType(tempOutputType);
          } else if (tempClassification === 'powerBi') {
            setOutputType(tempClassification);
          } else if (tempClassification === 'createDataRobotProject') {
            let robotType;
            if (nodeArg.triggerAutoML === true) {
              robotType = 'dataRobotAutoML';
              if (nodeArg.triggerTimeSeries === true) {
                robotType = 'dataRobotAutoTS';
              }
            }
            nodeArg.dataRobotType = robotType;
            setOutputType(robotType);
          }

          setFocusNode({
            full_name: nodeData.name,
            name: FUNCTIONS.NODE_NAME(nodeData.name),
            id: nodeData.id,
            type: nodeData.type,
            edit: nodeData.edit,
          });
        }
        return null;
      }
    }
    return null;
  };

  // 找出 condition 下的子節點
  const findChildNode = (length, list) => {
    const tempList = [];
    data.edges.forEach(edge => {
      list.forEach(node => {
        if (node === edge.source) {
          tempList.push(edge.source);
          tempList.push(edge.target);
        }
      });
    });
    const newList = tempList.filter(
      (element, index, arr) => arr.indexOf(element) === index,
    );
    if (length === newList.length) {
      return list;
    }
    return findChildNode(newList.length, newList);
  };

  const conditionDeleteByChangeClassification = async (node, newNode) => {
    const list = [node[0].id, node[0].args.ifyes, node[0].args.ifno];
    const childList = findChildNode(list.length, list);
    const filterFocuseNodeList = childList.filter(node => node !== nodeData.id);
    let tempEdges = data.edges;
    let tempNodes = data.nodes;
    const result = await Promise.all(
      filterFocuseNodeList.map(async deleteID => {
        const newEdge = tempEdges.filter(
          e => e.target !== deleteID && e.source !== deleteID,
        );
        const newNode = tempNodes.filter(e => e.id !== deleteID);
        tempEdges = newEdge;
        tempNodes = newNode;
        return { newEdge: tempEdges, nodes: tempNodes };
      }),
    );
    const nodeFilter = result[result.length - 1].nodes.filter(
      e => e.id !== nodeData.id,
    );
    const getArgNode = result[result.length - 1].nodes.filter(
      e => e.id === nodeData.id,
    );
    const setNewArg =
      getArgNode && getArgNode.length > 0 ? getArgNode[0].args : '';
    if (setNewArg.length !== 0) {
      setNewArg.name = newNode.name;
      setNewArg.type =
        newNode.type.toLowerCase() === 'trigger'
          ? 'trigger'
          : newNode.type.toLowerCase();
      delete setNewArg.ifyes;
      delete setNewArg.ifno;
    }
    setSelectFinish(false);
    const tempNode = {
      full_name: newNode.name,
      name: FUNCTIONS.NODE_NAME(nodeData.name),
      id: nodeData.id,
      type: newNode.type,
      args: setNewArg,
    };
    setData({
      edges: result[result.length - 1].newEdge,
      nodes: [...nodeFilter, tempNode],
    });

    setNodeChange(tempNode);
  };

  const conditionDeleteByChangeType = async (node, newNode) => {
    const list = [node[0].id, node[0].args.ifyes, node[0].args.ifno];
    const childList = findChildNode(list.length, list);
    const filterFocuseNodeList = childList.filter(node => node !== nodeData.id);
    let tempEdges = data.edges;
    let tempNodes = data.nodes;
    const result = await Promise.all(
      filterFocuseNodeList.map(async deleteID => {
        const newEdge = tempEdges.filter(
          e => e.target !== deleteID && e.source !== deleteID,
        );
        const newNode = tempNodes.filter(e => e.id !== deleteID);
        tempEdges = newEdge;
        tempNodes = newNode;
        return { newEdge: tempEdges, nodes: tempNodes };
      }),
    );
    const nodeFilter = result[result.length - 1].nodes.filter(
      e => e.id !== nodeData.id,
    );
    const getArgNode = result[result.length - 1].nodes.filter(
      e => e.id === nodeData.id,
    );
    const setNewArg =
      getArgNode && getArgNode.length > 0 ? getArgNode[0].args : '';
    if (setNewArg.length !== 0) {
      setNewArg.name = newNode.name;
      setNewArg.type =
        newNode.type.toLowerCase() === 'trigger'
          ? 'trigger'
          : newNode.type.toLowerCase();
      setNewArg.classification = '';
    }
    setSelectFinish(false);
    const tempNode = {
      full_name: newNode.name,
      name: FUNCTIONS.NODE_NAME(newNode.name),
      id: nodeData.id,
      type: newNode.type,
      args: setNewArg,
    };
    setData({
      edges: result[result.length - 1].newEdge,
      nodes: [...nodeFilter, tempNode],
    });

    setNodeChange(tempNode);
    // setFocusNode(undefined); // focus的刪除只能刪一次
  };

  const handleDelete = newNode => {
    if (nodeData) {
      if (nodeData.type === 'Action') {
        const findNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
        if (findNode[0] && findNode[0].args.classification === 'condition') {
          conditionDeleteByChangeType(findNode, newNode);
        } else {
          conditionDeleteByChangeClassification(findNode, newNode);
        }
      }
    }
  };

  useEffect(() => {
    if (nodeData && nodeData.type !== undefined) {
      if (preNodeData.type !== nodeData.type) {
        // 切換type 要回到node header
        setRecordHeader('node');
        setSelectItem('node');
        setSelectPage(nodeData.type.toLowerCase());

        setPreNodeData(nodeData);
      }
      setOutputType();
      handleCheckArg(); // change data by Args
    }
  }, [nodeData]);

  // 重畫資料 setData
  useEffect(() => {
    if (Object.values(nodeChange).length !== 0 && nodeData.id !== undefined) {
      setSelectFinish(false); // 有setData就要清
      const newID = nodeChange.type + moment().format('x');
      const newEdge = data.edges.map(e =>
        e.source === nodeChange.id || e.target === nodeChange.id
          ? {
              source: e.source === nodeChange.id ? newID : e.source,
              target: e.target === nodeChange.id ? newID : e.target,
            }
          : {
              source: e.source,
              target: e.target,
            },
      );

      const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeChange.id);
      const setNewArg =
        getArgNode && getArgNode.length > 0 ? getArgNode[0].args : '';
      if (setNewArg.length !== 0) {
        setNewArg.name = nodeChange.name;
        setNewArg.type =
          nodeChange.type.toLowerCase() === 'trigger'
            ? 'trigger'
            : nodeChange.type.toLowerCase();
      }

      setSelectFinish(false);

      const index = data.nodes.findIndex(e => e.id === nodeChange.id);
      const newData = FUNCTIONS.SET_DATA(
        data,
        nodeChange,
        index,
        newID,
        getArgNode[0],
        setNewArg,
        newEdge,
      );
      setData(newData);

      const newNode = {
        full_name: nodeChange.name,
        name: FUNCTIONS.NODE_NAME(nodeChange.name),
        id: newID,
        type: nodeChange.type,
        args: setNewArg,
      };

      //   setData({
      //     edges: [...newEdge],
      //     nodes: [...nodeFilter, newNode],
      //   });

      setFocusNode({
        full_name: nodeChange.name,
        name: FUNCTIONS.NODE_NAME(nodeChange.name),
        id: newID,
        type: nodeChange.type,
      });

      if (
        !(nodeData.id === nodeChange.id && nodeData.name !== nodeChange.name)
      ) {
        if (
          nodeData.type === 'Action' &&
          nodeChange.type === 'Trigger' &&
          setNewArg
        ) {
          handleDelete(newNode);
        }
        if (nodeData.type === 'Action' && setNewArg) {
          if (setNewArg.ifyes && setNewArg.ifno) {
            handleDelete(newNode);
          }
        }
      }

      const tempClassification =
        setNewArg.classification !== undefined ? setNewArg.classification : '';
      setClassificationType(tempClassification);
    }
  }, [nodeChange]);

  const turntoFrontendFormat = list => {
    if (list.length > 0) {
      const tempFrontendList = [];
      list.forEach(item => {
        item.columns.forEach(data => {
          const obj = { ...data, target: item.target };
          tempFrontendList.push(obj);
        });
      });
      return tempFrontendList;
    }
    return [{}];
  };

  const filterArgsCondition = data => {
    const tempDataFilterArgsNodes = data.nodes.filter(
      node =>
        node.args.classification !== 'condition' && node.type !== 'Action',
    );
    const tempDataNodes = data.nodes
      .filter(
        node =>
          node.args.classification === 'condition' && node.type === 'Action',
      )
      .map(item => ({
        ...item,
        args: {
          ...item.args,
          filters: turntoFrontendFormat(item.args.filters || []),
        },
      }));

    return {
      edges: data.edges,
      nodes: [...tempDataFilterArgsNodes, ...tempDataNodes],
    };
  };

  const turnToBackendFormat = payload => {
    const tempFilters = [];
    if (payload) {
      payload.forEach(item => {
        if (tempFilters.length > 0) {
          const findIdx = tempFilters.findIndex(
            data => data.target === item.target,
          );
          if (findIdx > -1) {
            const obj = {
              columnName: item.columnName,
              operation: item.operation,
              value: item.value,
              columnType: item.columnType,
            };
            tempFilters[findIdx].columns.push(obj);
          } else {
            const obj = {
              columnName: item.columnName,
              operation: item.operation,
              value: item.value,
              columnType: item.columnType,
            };
            const tempObj = {
              target: item.target,
              columns: [obj],
            };
            tempFilters.push(tempObj);
          }
        } else {
          const obj = {
            columnName: item.columnName,
            operation: item.operation,
            value: item.value,
            columnType: item.columnType,
          };
          const tempObj = {
            target: item.target,
            columns: [obj],
          };
          tempFilters.push(tempObj);
        }
      });
    }
    return tempFilters;
  };

  const setConditionPoperties = (payload, logicalOperator, dataflowId) => {
    if (nodeData.id !== undefined) {
      //   const nodeFilter = data.nodes.filter(e => e.id !== nodeData.id);
      const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const setNewArg =
        getArgNode && getArgNode.length > 0 ? getArgNode[0].args : '';
      if (setNewArg.length !== 0) {
        setNewArg.logicalOperator = logicalOperator;
        setNewArg.dataflowId = dataflowId;
        setNewArg.filters = turnToBackendFormat(payload);
        // setNewArg.filters = payload;
      }
      setSelectFinish(false);
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      const newData = FUNCTIONS.SET_DATA(
        data,
        nodeData,
        index,
        nodeData.id,
        getArgNode[0],
        setNewArg,
        data.edges,
      );

      setData(newData);
      //   setData({
      //     edges: [...data.edges],
      //     nodes: [
      //       ...nodeFilter,
      //       {
      //         full_name: nodeData.name,
      //         name: FUNCTIONS.NODE_NAME(nodeData.name),
      //         id: nodeData.id,
      //         type: nodeData.type,
      //         args: setNewArg,
      //       },
      //     ],
      //   });
      setFocusNode({
        full_name: nodeData.name,
        name: FUNCTIONS.NODE_NAME(nodeData.name),
        id: nodeData.id,
        type: nodeData.type,
      });
    }
  };

  const setUItoValue = cron => {
    // if (cron && nodeData.id !== undefined) {
    if (nodeData.id !== undefined) {
      const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const setNewArg =
        getArgNode && getArgNode.length > 0 ? getArgNode[0].args : '';

      if (setNewArg.length !== 0) {
        setNewArg.cron = cron || '';
      }
      setSelectFinish(false);
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      const newData = FUNCTIONS.SET_DATA(
        data,
        nodeData,
        index,
        nodeData.id,
        getArgNode[0],
        setNewArg,
        data.edges,
      );

      setData(newData);
      //   setData({
      //     edges: [...data.edges],
      //     nodes: [
      //       ...nodeFilter,
      //       {
      //         full_name: nodeData.name,
      //         name: FUNCTIONS.NODE_NAME(nodeData.name),
      //         id: nodeData.id,
      //         type: nodeData.type,
      //         args: setNewArg,
      //       },
      //     ],
      //   });
      setFocusNode({
        full_name: nodeData.name,
        name: FUNCTIONS.NODE_NAME(nodeData.name),
        id: nodeData.id,
        type: nodeData.type,
      });
    }
  };

  const setTeamsData = tempArgs => {
    if (tempArgs && nodeData.id !== undefined) {
      //   const nodeFilter = data.nodes.filter(e => e.id !== nodeData.id);
      const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const setNewArg = getArgNode !== undefined ? tempArgs : '';
      setSelectFinish(false);

      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      const newData = FUNCTIONS.SET_DATA(
        data,
        nodeData,
        index,
        nodeData.id,
        getArgNode[0],
        setNewArg,
        data.edges,
      );

      setData(newData);

      setFocusNode({
        full_name: nodeData.name,
        name: FUNCTIONS.NODE_NAME(nodeData.name),
        id: nodeData.id,
        type: nodeData.type,
      });
    }
  };

  const setMailData = tempArgs => {
    if (tempArgs && nodeData.id !== undefined) {
      //   const nodeFilter = data.nodes.filter(e => e.id !== nodeData.id);
      const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const setNewArg = getArgNode !== undefined ? tempArgs : '';
      setSelectFinish(false);
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      const newData = FUNCTIONS.SET_DATA(
        data,
        nodeData,
        index,
        nodeData.id,
        getArgNode[0],
        setNewArg,
        data.edges,
      );

      setData(newData);

      setFocusNode({
        full_name: nodeData.name,
        name: FUNCTIONS.NODE_NAME(nodeData.name),
        id: nodeData.id,
        type: nodeData.type,
      });
    }
  };

  const renderHeaderMenu = () => {
    switch (selectPage) {
      case 'trigger':
      case 'action':
      case 'empty':
        return (
          <ScheduleNodeMenu
            setRecordHeader={setRecordHeader}
            setSelectItem={setSelectItem}
            selectItem={selectItem}
            outputType={outputType}
            classificationType={classificationType}
            nodeData={nodeData}
          />
        );
      default:
        return <ConditionNodeMenu />;
    }
  };

  const renderMenuContent = () => {
    switch (selectPage) {
      case 'trigger':
      case 'action':
      case 'empty':
        if (!recordHeader || recordHeader === 'node') {
          return (
            <ScheduleNodeItem
              data={data}
              setData={setData}
              nodeData={nodeData}
              selectPage={selectPage}
              setSelectPage={setSelectPage}
              setNodeChange={setNodeChange}
              // setSchema={setSchema}
              setAction={setAction}
              action={action}
              groupId={groupId}
              setFocusNode={setFocusNode}
              setSelectFinish={setSelectFinish}
            />
          );
        }
        if (recordHeader === 'poperties') {
          switch (classificationType) {
            case 'schedule':
              return (
                <SchedulePoperties
                  data={data}
                  nodeData={nodeData}
                  setUItoValue={setUItoValue}
                />
              );
            case 'api':
              return (
                <PostApiPoperties
                  data={data}
                  nodeData={nodeData}
                  workflowSeqId={workflowSeqId}
                />
              );
            case 'sendMail':
              return (
                <SendMailPoperties
                  data={data}
                  nodeData={nodeData}
                  setMailData={setMailData}
                />
              );
            case 'postTeams':
              return (
                <PostTeamsPoperties
                  data={data}
                  nodeData={nodeData}
                  setTeamsData={setTeamsData} // 跟setMailData一樣要找時間整理
                />
              );
            case 'powerBi':
              return (
                <PowerBiPoperties
                  data={data}
                  setData={setData}
                  setFocusNode={setFocusNode}
                  setSelectFinish={setSelectFinish}
                  nodeData={nodeData}
                  dataflowList={dataflowList}
                  dataflowLoading={dataflowLoading}
                  seqId={workflowSeqId}
                  closeModal={closeModal}
                  openModal={openModal}
                  menuLoading={menuLoading}
                  setNodeChange={setNodeChange}
                />
              );
            case 'insertData':
              return (
                <InsertDataPoperties
                  setOutputType={setOutputType}
                  data={data}
                  nodeData={nodeData}
                  setSelectFinish={setSelectFinish}
                  setData={setData}
                  setFocusNode={setFocusNode}
                  dataflowList={dataflowList}
                  dataflowLoading={dataflowLoading}
                  seqId={workflowSeqId}
                  menuLoading={menuLoading}
                  setMenuLoading={setMenuLoading}
                  history={historyMode}
                  closeModal={closeModal}
                  openModal={openModal}
                />
              );
            case 'makeDataRobotPrediction':
              return (
                <DataRobotPrediction
                  setOutputType={setOutputType}
                  data={data}
                  nodeData={nodeData}
                  setSelectFinish={setSelectFinish}
                  setData={setData}
                  setFocusNode={setFocusNode}
                  dataflowList={dataflowList}
                  dataflowLoading={dataflowLoading}
                  seqId={workflowSeqId}
                  menuLoading={menuLoading}
                  setMenuLoading={setMenuLoading}
                  history={historyMode}
                  closeModal={closeModal}
                  openModal={openModal}
                />
              );
            case 'createDataRobotProject':
              return (
                <DataRobotProject
                  data={data}
                  nodeData={nodeData}
                  setSelectFinish={setSelectFinish}
                  setNodeChange={setNodeChange}
                  setOutputType={setOutputType}
                  setData={setData}
                  setFocusNode={setFocusNode}
                  dataflowList={dataflowList}
                  dataflowLoading={dataflowLoading}
                  menuLoading={menuLoading}
                  closeModal={closeModal}
                  openModal={openModal}
                  setDataRobotTarget={setDataRobotTarget}
                  dataRobotTarget={dataRobotTarget}
                />
              );
            case 'condition':
              return (
                <ConditionPoperties
                  data={filterArgsCondition(data)}
                  nodeData={nodeData}
                  tables={tables}
                  setTables={setTables}
                  setPayload={setConditionPoperties}
                  dataflowList={dataflowList}
                  dataflowLoading={dataflowLoading}
                  setDataflowLoading={setDataflowLoading}
                  closeModal={closeModal}
                  openModal={openModal}
                />
              );
            default:
              break;
          }
        }
        if (
          recordHeader === 'subPoperties' &&
          (classificationType === 'insertData' ||
            classificationType === 'powerBi' ||
            classificationType === 'createDataRobotProject')
        ) {
          switch (outputType) {
            case 'OUTPUTCUSTOM':
              return (
                <InsertDataSubPoperties
                  data={data}
                  nodeData={nodeData}
                  setData={setData}
                  setFocusNode={setFocusNode}
                  setSelectFinish={setSelectFinish}
                />
              );
            case 'powerBi':
              return (
                <PowerBiSubPoperties
                  data={data}
                  nodeData={nodeData}
                  seqId={workflowSeqId}
                />
              );
            case 'dataRobotAutoML':
              return (
                <DataRobotAutoML
                  dataRobotTarget={dataRobotTarget}
                  data={data}
                  nodeData={nodeData}
                />
              );
            case 'dataRobotAutoTS':
              return (
                <DataRobotAutoTS
                  dataRobotTarget={dataRobotTarget}
                  data={data}
                  nodeData={nodeData}
                  setNodeChange={setNodeChange}
                />
              );
            default:
              break;
          }
        }

        if (
          recordHeader === 'sub2Poperties' &&
          (classificationType === 'powerBi' ||
            classificationType === 'createDataRobotProject')
        ) {
          switch (outputType) {
            case 'powerBi':
              return (
                <PowerBiCondition
                  setNodeChange={setNodeChange}
                  data={data}
                  nodeData={nodeData}
                  setData={setData}
                  setFocusNode={setFocusNode}
                  setSelectFinish={setSelectFinish}
                />
              );
            default:
              break;
          }
        }
        if (
          recordHeader === 'sub3Poperties' &&
          classificationType === 'powerBi'
        ) {
          switch (outputType) {
            case 'powerBi':
              return <PowerBiEmailGroup data={data} nodeData={nodeData} />;
            default:
              break;
          }
        }
        return <div />;
      case 'yes':
      case 'no':
        return (
          <ConditionNodeItem
            data={data}
            nodeData={nodeData}
            selectPage={selectPage}
          />
        );
      default:
        return <div />;
    }
  };

  return (
    <>
      {/* <Spin spinning={menuLoading}> */}
      {renderHeaderMenu()}
      {renderMenuContent()}
      {/* </Spin> */}
    </>
  );
};

export default Menu;
