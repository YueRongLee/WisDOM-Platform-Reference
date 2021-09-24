/* eslint-disable no-restricted-imports */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { message } from 'antd';
import { DATAFLOW_TYPE, FUNCTIONS } from '~~constants/index';
import { DataFlowApi, TableApi } from '~~apis/';
import { useQuery } from '~~hooks/';
import NewNodeMenu from './NewNodeMenu';
import DatasetNodeMenu from './DatasetNodeMenu';
import DatasetNodeItem from './MenuItem/Dataset/NodeItem';
import NewNodeItem from './MenuItem/NewNode/NewNodeItem';
import Schema from './MenuItem/Dataset/Schema';
import Sample from './MenuItem/Dataset/Sample';
import CleansingNodeItem from './MenuItem/Cleansing/NodeItem';
import CleansingNodeMenu from './CleansingNodeMenu';
import MissingValue from './MenuItem/Cleansing/MissingValue';
import CustomValue from './MenuItem/Cleansing/CustomValue';
import TransformNodeItem from './MenuItem/Transform/NodeItem';
import TransformNodeMenu from './TransformNodeMenu';
import SelectFiled from './MenuItem/Transform/SelectFiled';
import Customize from './MenuItem/Transform/Customize';
import Filter from './MenuItem/Transform/Filter';
import JoinNode from './MenuItem/Transform/Join';
import Union from './MenuItem/Transform/Union';
import OutputSchema from './MenuItem/Transform/OutputSchema';
import TargetNodeMenu from './TargetNodeMenu';
import TargetNodeItem from './MenuItem/Target/NodeItem';
import TargetProperties from './MenuItem/Target/TargetProperties';
import OutputData from './MenuItem/Target/OutputData';
import ReNameFiled from './MenuItem/Transform/ReNameFiled';
import GroupBy from './MenuItem/Transform/GroupBy';
import JoinReNameFiled from './MenuItem/Transform/JoinReNameFiled';
import ChangeFormat from './MenuItem/Transform/ChangeFormat';
import MathFunction from './MenuItem/Transform/MathFunction';
import RemoveDuplicate from './MenuItem/Transform/RemoveDuplicate';
import MergeColumn from './MenuItem/Transform/MergeColumn';
import ChangeDataType from './MenuItem/Transform/ChangeDataType';

const JOINTYPE = ['innerjoin', 'leftjoin', 'rightjoin', 'join'];

const Menu = ({
  data,
  groupId,
  defaultTable,
  nodeData,
  setData,
  setFocusNode,
  setSelectFinish,
  selectPage,
  setSelectPage,
  sqlID,
  focusNode,
  selectNode,
  projectName,
  diagram,
  schedule,
  setNodeData,
  setPublishChange,
  historyMode,
  usedTargetList,
}) => {
  const [nodeChange, setNodeChange] = useState({}); // for user change data
  const [edgeChange, setEdgeChange] = useState(undefined); // for user change edge
  const [optionPage, setOptionPage] = useState(); // transform -> selectField、customize
  const [recordHeader, setRecordHeader] = useState(); // 點選哪個header menu
  const [nodePublish, setNodePublish] = useState(false);
  const [schemaId, setSchema] = useState(false);
  const [preNodeData, setPreNodeData] = useState(nodeData); // 存變化前的nodeData
  const [selectItem, setSelectItem] = useState('node');
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [foundWisdomDate, setFoundWisdomDate] = useState(false);

  const getOutputSchemaQuery = useQuery(DataFlowApi.getOutputSchema);

  const getParentSource = thisId => {
    const getSource = data.edges.filter(e => e.target === thisId);
    const idAry = getSource.map(e => e.source);
    const getNode = data.nodes.filter(e => idAry.includes(e.id));
    return getNode;
  };

  const getNodebyId = nodeId => {
    const index = data.nodes.findIndex(e => e.id === nodeId);
    return data.nodes[index];
  };

  const getTransOption = type => {
    if (type === 'innerjoin' || type === 'leftjoin' || type === 'rightjoin') {
      return DATAFLOW_TYPE.TRANSFORM.props.JOIN.value;
    }
    return type;
  };

  const outputSchemaApi = async (thisNode, parentSchema) => {
    setSchemaLoading(true);
    try {
      const sendData = {
        node: thisNode,
        parent: parentSchema,
      };

      const result = await getOutputSchemaQuery.exec(sendData);
      const schema = result.outputSchema.map(item => ({
        name: item.name,
        type: item.type,
        description: item.description,
      }));
      return schema;
    } catch (e) {
      console.log(e);
      return null;
    } finally {
      setSchemaLoading(false);
    }
  };
  // getSchema
  const handleGetSchema = async thisNode => {
    const parentList = getParentSource(thisNode.id);
    const index = data.nodes.findIndex(e => e.id === thisNode.id);
    const node = data.nodes[index];

    if (index !== -1 && node && node.type === DATAFLOW_TYPE.DATASET.value) {
      if (node.args.name !== '' && node.args.name !== 'new_Node') {
        setSchemaLoading(true);
        const result = await TableApi.getAllowedTableColumns(
          node.args.table_name,
        );

        const foundWisdomDate = result.table.columns.find(
          column => column.name === 'wisdom_date',
        );
        if (foundWisdomDate) {
          setFoundWisdomDate(true);
        }
        // 測試用
        // setFoundWisdomDate(true);

        node.schema = result.table.columns.map(e => ({
          name: e.name,
          type: e.type,
          description: e.comment,
        }));
        setSchemaLoading(false);
      }
    } else if (
      index !== -1 &&
      node &&
      node.type !== DATAFLOW_TYPE.DATASET.value
    ) {
      setSchemaLoading(true);
      let isNull = false;
      parentList.forEach(e => {
        if (e.schema === null || e.schema === undefined) {
          isNull = true;
        }
      });

      if (isNull && node.schema !== null) {
        node.schema = null;
      } else if (parentList.length === 1 && node.type !== undefined) {
        if (node.type.toLowerCase() === DATAFLOW_TYPE.TARGET.key) {
          if (node.schema !== getNodebyId(parentList[0].id).schema) {
            node.schema = getNodebyId(parentList[0].id).schema;
          }
        } else if (node.type.toLowerCase() === DATAFLOW_TYPE.CLEANSING.key) {
          switch (node.args.classification) {
            case DATAFLOW_TYPE.CLEANSING.props.MISSINGVALUE.value:
              if (
                node.args.missingValue &&
                node.args.missingValue.length !== 0
              ) {
                const result = await outputSchemaApi(
                  node,
                  getNodebyId(parentList[0].id).schema,
                );
                if (node.schema === null) {
                  node.schema = result;
                } else if (
                  JSON.stringify(node.schema) !== JSON.stringify(result)
                ) {
                  node.schema = result;
                }
              } else if (node.schema !== null) {
                node.schema = null;
              }
              break;
            case DATAFLOW_TYPE.CLEANSING.props.CUSTOMVALUE.value:
              if (node.args.customValue && node.args.customValue.length !== 0) {
                const result = await outputSchemaApi(
                  node,
                  getNodebyId(parentList[0].id).schema,
                );
                if (node.schema === null) {
                  node.schema = result;
                } else if (
                  JSON.stringify(node.schema) !== JSON.stringify(result)
                ) {
                  node.schema = result;
                }
              } else if (node.schema !== null) {
                node.schema = null;
              }
              break;
            default:
              break;
          }
        } else if (node.type.toLowerCase() === DATAFLOW_TYPE.TRANSFORM.key) {
          switch (node.args.classification) {
            case DATAFLOW_TYPE.TRANSFORM.props.SELECTFIELDS.value:
              if (node.args.fields && node.args.fields.length !== 0) {
                const result = await outputSchemaApi(
                  node,
                  getNodebyId(parentList[0].id).schema,
                );
                if (node.schema === null) {
                  node.schema = result;
                } else if (
                  JSON.stringify(node.schema) !== JSON.stringify(result)
                ) {
                  node.schema = result;
                }
              } else if (node.schema !== null) {
                node.schema = null;
              }
              break;
            case DATAFLOW_TYPE.TRANSFORM.props.CUSTOMIZE.value:
              if (
                node.args.frontend &&
                node.args.frontend.sqlVerify &&
                node.args.frontend.sqlVerify === true
              ) {
                const result = await outputSchemaApi(
                  node,
                  getNodebyId(parentList[0].id).schema,
                );
                if (node.schema === null) {
                  node.schema = result;
                } else if (
                  JSON.stringify(node.schema) !== JSON.stringify(result)
                ) {
                  node.schema = result;
                }
              } else if (node.schema !== null) {
                node.schema = null;
              }
              break;
            case DATAFLOW_TYPE.TRANSFORM.props.JOIN.value:
              if (node.schema !== null) {
                node.schema = null;
              }
              break;
            case DATAFLOW_TYPE.TRANSFORM.props.RENAMEFIELDS.value:
            case 'JoinRenameFields':
              if (node.args.reSetDataField) {
                const result = await outputSchemaApi(
                  node,
                  getNodebyId(parentList[0].id).schema,
                );
                if (node.schema === null) {
                  node.schema = result;
                } else if (
                  JSON.stringify(node.schema) !== JSON.stringify(result)
                ) {
                  node.schema = result;
                }
              } else if (node.schema !== null) {
                node.schema = null;
              }
              break;
            case DATAFLOW_TYPE.TRANSFORM.props.FILTER.value:
              if (node.args.filter) {
                const result = await outputSchemaApi(
                  node,
                  getNodebyId(parentList[0].id).schema,
                );
                if (node.schema === null) {
                  node.schema = result;
                } else if (
                  JSON.stringify(node.schema) !== JSON.stringify(result)
                ) {
                  node.schema = result;
                }
              } else if (node.schema !== null) {
                node.schema = null;
              }
              break;
            case DATAFLOW_TYPE.TRANSFORM.props.CHANGEFORMAT.value:
              if (node.args.changeFormat) {
                const result = await outputSchemaApi(
                  node,
                  getNodebyId(parentList[0].id).schema,
                );
                if (node.schema === null) {
                  node.schema = result;
                } else if (
                  JSON.stringify(node.schema) !== JSON.stringify(result)
                ) {
                  node.schema = result;
                }
              } else if (node.schema !== null) {
                node.schema = null;
              }
              break;
            case DATAFLOW_TYPE.TRANSFORM.props.CHANGEDATATYPE.value:
              if (node.args.changeDataType) {
                const result = await outputSchemaApi(
                  node,
                  getNodebyId(parentList[0].id).schema,
                );
                if (node.schema === null) {
                  node.schema = result;
                } else if (
                  JSON.stringify(node.schema) !== JSON.stringify(result)
                ) {
                  node.schema = result;
                }
              } else if (node.schema !== null) {
                node.schema = null;
              }
              break;
            case DATAFLOW_TYPE.TRANSFORM.props.GROUPBY.value:
              if (node.args.groupByField) {
                const result = await outputSchemaApi(
                  node,
                  getNodebyId(parentList[0].id).schema,
                );
                if (node.schema === null) {
                  node.schema = result;
                } else if (
                  JSON.stringify(node.schema) !== JSON.stringify(result)
                ) {
                  node.schema = result;
                }
              } else if (node.schema !== null) {
                node.schema = null;
              }
              break;
            case DATAFLOW_TYPE.TRANSFORM.props.MATHFUNCTION.value:
              if (node.args.mathOperation) {
                const result = await outputSchemaApi(
                  node,
                  getNodebyId(parentList[0].id).schema,
                );
                if (node.schema === null) {
                  node.schema = result;
                } else if (
                  JSON.stringify(node.schema) !== JSON.stringify(result)
                ) {
                  node.schema = result;
                }
              } else if (node.schema !== null) {
                node.schema = null;
              }
              break;
            case DATAFLOW_TYPE.TRANSFORM.props.REMOVEDUPLICATES.value:
              if (node.args.fields && node.args.fields.length !== 0) {
                const result = await outputSchemaApi(
                  node,
                  getNodebyId(parentList[0].id).schema,
                );
                if (node.schema === null) {
                  node.schema = result;
                } else if (
                  JSON.stringify(node.schema) !== JSON.stringify(result)
                ) {
                  node.schema = result;
                }
              } else if (node.schema !== null) {
                node.schema = null;
              }
              break;
            case DATAFLOW_TYPE.TRANSFORM.props.MERGECOLUMN.value:
              if (
                node.args.separator &&
                node.args.fields.length !== 0 &&
                node.args.newColumn
              ) {
                const result = await outputSchemaApi(
                  node,
                  getNodebyId(parentList[0].id).schema,
                );
                if (node.schema === null) {
                  node.schema = result;
                } else if (
                  JSON.stringify(node.schema) !== JSON.stringify(result)
                ) {
                  node.schema = result;
                }
              } else if (node.schema !== null) {
                node.schema = null;
              }
              break;
            case DATAFLOW_TYPE.TRANSFORM.props.UNION.value:
              // parents length!=2,直接塞null
              if (node.schema !== null) {
                node.schema = null;
              }
              break;
            default:
              if (node.schema !== null) {
                node.schema = null;
              }
              break;
          }
        } else if (node.schema !== null) {
          node.schema = null;
        }

        if (node.schema && node.check === 'error') {
          node.check = undefined;
          setNodeChange(node);
        }
      } // 多個parents
      else {
        const parentsSchemaList = [];
        parentList.forEach(e => {
          parentsSchemaList.push(getNodebyId(e.id).schema);
        });
        // Join
        if (
          node.args.classification &&
          JOINTYPE.includes(node.args.classification.toLowerCase())
        ) {
          if (
            node.args.classification ===
              DATAFLOW_TYPE.TRANSFORM.props.JOIN.value &&
            node.schema !== null
          ) {
            node.schema = null;
          } else {
            let checkJoin = false;
            let leftId = null;
            let rightId = null;
            if (node.args.mapping) {
              node.args.mapping.forEach(e => {
                if (
                  e.from_node.length !== 0 &&
                  e.to_node &&
                  e.to_node.length !== 0 &&
                  e.from_column.length !== 0 &&
                  e.to_column &&
                  e.to_column.length !== 0
                ) {
                  checkJoin = true;
                  leftId = e.from_node;
                  rightId = e.to_node;
                } else checkJoin = false;
              });
            }
            // 沒有join type不call api
            if (
              node.args.classification !== 'Join' &&
              checkJoin &&
              leftId !== undefined &&
              rightId !== undefined
            ) {
              const fromSchema = getNodebyId(leftId).schema;
              const toSchema = getNodebyId(rightId).schema;

              const sendData = {
                node,
                parent: fromSchema,
                joinParent: toSchema,
              };

              const result = await getOutputSchemaQuery.exec(sendData);
              const schema = result.outputSchema.map(item => ({
                name: item.name,
                type: item.type,
                description: item.description,
              }));

              node.schema = schema;
            } else if (node.schema !== null) {
              node.schema = null;
            }
          }
        }
        // Union
        else if (
          node.args.classification &&
          node.args.classification === 'Union'
        ) {
          // const result = await outputSchemaApi(node, parentsSchemaList[0]);
          if (node.args.unionMapping && parentList.length === 2) {
            let checkOK = false;
            let totalCheck = true;

            node.args.unionMapping.forEach(e => {
              checkOK =
                e.outputColumn &&
                e.columnA &&
                e.columnB &&
                FUNCTIONS.COLUMN_TYPE_MAPPING(e.columnTypeA) ===
                  FUNCTIONS.COLUMN_TYPE_MAPPING(e.columnTypeB);

              if (!checkOK) {
                totalCheck = false;
              }
            });

            if (totalCheck !== false) {
              const sendData = {
                node,
                parent: getNodebyId(parentList[0].id).schema,
                joinParent: getNodebyId(parentList[1].id).schema,
              };

              const result = await getOutputSchemaQuery.exec(sendData);

              const tempResult = result.outputSchema.map(item => ({
                name: item.name,
                type: item.type,
                description: item.description,
              }));

              if (node.schema === null) {
                node.schema = tempResult;
              } else if (
                JSON.stringify(node.schema) !== JSON.stringify(tempResult)
              ) {
                node.schema = tempResult;
              }
            } else if (node.schema !== null) {
              node.schema = null;
            }
          } else if (node.schema !== null) {
            node.schema = null;
          }
        }
        // 除join外只有customer,groupby可以多個parents
        else if (
          parentsSchemaList[0] &&
          parentsSchemaList[0].length !== 0 &&
          node.args.classification &&
          ['Customize', 'GroupBy'].includes(node.args.classification)
        ) {
          const result = await outputSchemaApi(node, parentsSchemaList[0]);
          node.schema = result && result.length !== 0 ? result : null;
        } else {
          node.schema = null;
        }

        if (node.schema && node.check === 'error') {
          node.check = undefined;
          setNodeChange(node);
        }
      }
      // setTimeout(() => {
      setSchemaLoading(false);
      // }, 2000);
    }
  };

  const handleCheckArg = () => {
    if (!(focusNode === undefined && selectNode === null)) {
      if (nodeData.id !== undefined) {
        const index = data.nodes.findIndex(e => e.id === nodeData.id);
        if (index !== -1) {
          const nodeArg = data.nodes[index].args;

          const check = nodeArg.publish !== undefined ? nodeArg.publish : false;

          setFocusNode({
            full_name: nodeData.name,
            name: FUNCTIONS.NODE_NAME(nodeData.name),
            id: nodeData.id,
            type: nodeData.type,
            edit: nodeData.edit,
          });

          switch (nodeData.type.toLowerCase()) {
            case DATAFLOW_TYPE.TARGET.key:
              return setNodePublish(check);
            case DATAFLOW_TYPE.TRANSFORM.key:
              return setOptionPage(getTransOption(nodeArg.classification));
            default:
              return setNodePublish(false);
          }
        }
        return setNodePublish(false);
      }
    }
    return setNodePublish(false);
  };

  // filter node

  const turntoFrontendFormat = list => {
    if (list.length > 0) {
      const tempFrontendList = [];
      list.forEach(item => {
        tempFrontendList.push(item);
      });
      return tempFrontendList;
    }
    return [{}];
  };

  const filterArgsFilter = data => {
    // const tempDataFilterArgsNodes = data.nodes.filter(
    //   node => node.args.classification !== 'Filter',
    // );
    // const tempDataNodes = data.nodes
    //   .filter(node => node.args.classification === 'Filter')
    //   .map(item => ({
    //     ...item,
    //     args: {
    //       ...item.args,
    //       filter: turntoFrontendFormat(item.args.filter || []),
    //     },
    //   }));

    data.nodes.forEach(e => {
      if (e.args && e.args.classification === 'Filter') {
        e.args.filter = turntoFrontendFormat(e.args.filter || []);
      }
    });

    return {
      edges: data.edges,
      nodes: data.nodes,
    };
    // return {
    //   edges: data.edges,
    //   nodes: [...tempDataFilterArgsNodes, ...tempDataNodes],
    // };
  };

  // change format

  const turntoFrontendChangeFormat = list => {
    if (list.length > 0) {
      const tempFrontendList = [];
      list.forEach(item => {
        tempFrontendList.push(item);
      });
      return tempFrontendList;
    }
    return [{}];
  };

  const filterArgsChangeFormat = data => {
    const tempDataFilterArgsNodes = data.nodes.filter(
      node => node.args.classification !== 'ChangeFormat',
    );
    const tempDataNodes = data.nodes
      .filter(node => node.args.classification === 'ChangeFormat')
      .map(item => ({
        ...item,
        args: {
          ...item.args,
          changeFormat: turntoFrontendChangeFormat(
            item.args.changeFormat || [],
          ),
        },
      }));

    return {
      edges: data.edges,
      nodes: [...tempDataFilterArgsNodes, ...tempDataNodes],
    };
  };

  const getNodeParent = node => {
    if (data) {
      const getSource = data.edges.filter(e => e.target === node.id);
      const idAry = getSource.map(e => e.source);
      const getNode = data.nodes.filter(e => idAry.includes(e.id));

      const getNameAry = getNode.map(e => ({
        key: e.id,
        name: e.full_name,
        args: e.args,
        type: e.type,
        schema: e.schema,
      }));

      return getNameAry;
    }
    return [];
  };

  const getNodeParentTableInfo = node => {
    const nodeInfo = node.id !== null ? node : preNodeData;
    const getSource = data.edges.filter(e => e.target === nodeInfo.id);
    const idAry = getSource.map(e => e.source);
    const getNode = data.nodes.filter(e => idAry.includes(e.id));
    const getTable = getNode.map(item => item.tableInfo);

    return getTable[0] === undefined ? getNode[0] : getTable[0];
  };

  const getDataClassification = id => {
    const node = FUNCTIONS.GET_NODE_DETAIL(data, id);
    if (node.length > 0) {
      return node[0].args.classification;
    }
    return '';
  };

  useEffect(() => {
    if (nodeData && nodeData.type !== undefined) {
      if (preNodeData.id !== nodeData.id) {
        if (getDataClassification(preNodeData.id) !== '') {
          setRecordHeader('node');
          setSelectItem('node');
        }
        setSelectPage(
          nodeData.type === 'Empty'
            ? DATAFLOW_TYPE.NEWNODE.key
            : nodeData.type.toLowerCase(),
        );
        setPreNodeData(nodeData);
      }
      handleCheckArg(); // change data by Args
      if (nodeData.type === 'Target') {
        handleGetSchema(nodeData);
      }
    } else if (preNodeData && preNodeData.type !== undefined) {
      setNodeData({
        id: preNodeData.id,
        name: preNodeData.name,
        type: preNodeData.type,
        edit: preNodeData.edit,
      });

      setFocusNode({
        name: preNodeData.name,
        id: preNodeData.id,
        type: preNodeData.type,
        edit: preNodeData.edit,
        check: preNodeData.check,
      });
    }

    // 離開編輯 or Save時切到第一頁
    if (nodeData.edit === false) {
      setRecordHeader('node');
      setSelectItem('node');
    }
  }, [nodeData]);

  useEffect(() => {
    if (nodeData && nodeData.type !== undefined) {
      handleGetSchema(nodeData);
    }
  }, [data]);

  const handleRedrawKedro = async () => {
    try {
      const index = data.nodes.findIndex(e => e.id === nodeChange.id);
      if (
        Object.values(nodeChange).length !== 0 &&
        nodeData.id !== undefined &&
        index !== -1
      ) {
        setSelectFinish(false); // 有setData就要清

        const newID = nodeChange.type + moment().format('x');
        const getFullName = nodeChange.full_name
          ? nodeChange.full_name
          : nodeChange.name;

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

        const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeChange.id)[0];
        const changeNodeArg = nodeChange.args
          ? nodeChange.args
          : getArgNode.args;

        // 檢查parent的schema
        const parentList = getParentSource(nodeChange.id);
        let isNull = false;
        parentList.forEach(e => {
          if (e.schema === null || e.schema === undefined) {
            isNull = true;
          }
        });

        // 改變的那個node塞check
        switch (nodeChange.type) {
          case 'Dataset':
            if (getArgNode.schema && getArgNode.schema !== null) {
              getArgNode.check =
                getArgNode.check && getArgNode.check === 'error'
                  ? undefined
                  : getArgNode.check;
            } else {
              getArgNode.check = 'error';
            }
            break;
          case 'Cleansing':
            getArgNode.args.type = 'transform'; // 後端要求
            if (
              // MISSINGVALUE
              getArgNode.args.classification ===
              DATAFLOW_TYPE.CLEANSING.props.MISSINGVALUE.value
            ) {
              if (parentList.length === 1) {
                if (getArgNode.schema === null) {
                  getArgNode.schema = await outputSchemaApi(
                    getArgNode,
                    getNodebyId(parentList[0].id).schema,
                  );
                }
              } else {
                message.error('MissongValue node parents select 1 table only!');
              }
            } else if (
              getArgNode.args.classification ===
              DATAFLOW_TYPE.CLEANSING.props.CUSTOMVALUE.value
            ) {
              if (parentList.length === 1) {
                if (getArgNode.schema === null) {
                  getArgNode.schema = await outputSchemaApi(
                    getArgNode,
                    getNodebyId(parentList[0].id).schema,
                  );
                }
              } else {
                message.error('CustomValue node parents select 1 table only!');
              }
            }
            break;
          case 'Transform':
            if (
              // SELECTFIELDS
              getArgNode.args.classification ===
              DATAFLOW_TYPE.TRANSFORM.props.SELECTFIELDS.value
            ) {
              if (parentList.length === 1) {
                if (
                  getArgNode.schema === null &&
                  getArgNode.args.fields &&
                  getArgNode.args.fields.length !== 0
                ) {
                  getArgNode.schema = await outputSchemaApi(
                    getArgNode,
                    getNodebyId(parentList[0].id).schema,
                  );
                }
              } else {
                message.error('SelectFields node parents select 1 table only!');
              }
            } else if (
              // CUSTOMIZE
              getArgNode.args.classification ===
              DATAFLOW_TYPE.TRANSFORM.props.CUSTOMIZE.value
            ) {
              if (
                getArgNode.args.frontend &&
                getArgNode.args.frontend.sqlVerify &&
                getArgNode.args.frontend.sqlVerify !== false
              ) {
                getArgNode.check = undefined;
              } else {
                getArgNode.check = 'error';
              }
            } else if (
              // RENAMEFIELDS
              getArgNode.args.classification ===
              DATAFLOW_TYPE.TRANSFORM.props.RENAMEFIELDS.value
            ) {
              if (parentList.length === 1) {
                if (
                  getArgNode.args.reSetDataField &&
                  getArgNode.args.reSetDataField.length !== 0
                ) {
                  getArgNode.schema = await outputSchemaApi(
                    getArgNode,
                    getNodebyId(parentList[0].id).schema,
                  );
                }
              } else {
                message.error('RenameFields node parents select 1 table only!');
              }
            } else if (
              // CHANGEDATATYPE
              getArgNode.args.classification ===
              DATAFLOW_TYPE.TRANSFORM.props.CHANGEDATATYPE.value
            ) {
              if (parentList.length === 1) {
                if (
                  getArgNode.args.changeDataType &&
                  getArgNode.args.changeDataType.length !== 0
                ) {
                  getArgNode.schema = await outputSchemaApi(
                    getArgNode,
                    getNodebyId(parentList[0].id).schema,
                  );
                }
              } else {
                message.error(
                  'ChangeDataType node parents select 1 table only!',
                );
              }
            } else if (
              // CHANGEFORMAT
              getArgNode.args.classification ===
              DATAFLOW_TYPE.TRANSFORM.props.CHANGEFORMAT.value
            ) {
              let checkOK = false;
              if (parentList.length === 1) {
                if (changeNodeArg.changeFormat) {
                  changeNodeArg.changeFormat.forEach(e => {
                    if (e && e.columnName && e.formatType && e.value) {
                      checkOK = true;
                    } else {
                      checkOK = false;
                    }
                  });

                  getArgNode.schema = await outputSchemaApi(
                    getArgNode,
                    getNodebyId(parentList[0].id).schema,
                  );
                }
              } else {
                message.error('ChangeFormat node parents select 1 table only!');
              }

              getArgNode.check = checkOK ? undefined : 'error';
            } else if (
              // FILTER
              getArgNode.args.classification ===
              DATAFLOW_TYPE.TRANSFORM.props.FILTER.value
            ) {
              let checkOK = false;
              if (changeNodeArg.filter) {
                changeNodeArg.filter.forEach(e => {
                  if (e.columnName && e.columnType && e.operation && e.value) {
                    checkOK = true;
                  } else {
                    checkOK = false;
                  }
                });
              }
              if (parentList.length === 1) {
                getArgNode.schema = await outputSchemaApi(
                  getArgNode,
                  getNodebyId(parentList[0].id).schema,
                );
              } else {
                getArgNode.schema = null;
                message.error('Filter node parents select 1 table only!');
              }

              getArgNode.check =
                checkOK && getArgNode.schema ? undefined : 'error';
            } else if (
              // GROUPBY
              getArgNode.args.classification ===
              DATAFLOW_TYPE.TRANSFORM.props.GROUPBY.value
            ) {
              let checkOK = false;
              if (changeNodeArg.groupByField) {
                changeNodeArg.groupByField.forEach(e => {
                  if (e.aggregate && e.column && e.newColumn) {
                    checkOK = true;
                  } else {
                    checkOK = false;
                  }
                });
                getArgNode.schema = await outputSchemaApi(
                  getArgNode,
                  getNodebyId(parentList[0].id).schema,
                );
              }
              getArgNode.check = checkOK ? undefined : 'error';
            } else if (
              // MATHFUNCTION
              getArgNode.args.classification ===
              DATAFLOW_TYPE.TRANSFORM.props.MATHFUNCTION.value
            ) {
              let checkOK = false;
              if (parentList.length === 1) {
                if (changeNodeArg.mathOperation) {
                  const mathField = changeNodeArg.mathOperation;
                  if (
                    mathField.type &&
                    mathField.valueUsing &&
                    mathField.constantLeft !== undefined &&
                    mathField.columnLeft &&
                    mathField.newColumn
                  ) {
                    if (
                      mathField.type === 'round' &&
                      mathField.percise !== undefined
                    ) {
                      checkOK = true;
                    } else if (
                      mathField.type !== 'round' &&
                      mathField.columnRight
                    ) {
                      checkOK = true;
                    } else {
                      checkOK = false;
                    }
                  }
                  getArgNode.schema = await outputSchemaApi(
                    getArgNode,
                    getNodebyId(parentList[0].id).schema,
                  );
                }
              } else {
                getArgNode.schema = null;
                message.error('MathFunction node parents select 1 table only!');
              }
              getArgNode.check =
                checkOK && getArgNode.schema ? undefined : 'error';
            } else if (
              // REMOVEDUPLICATES
              getArgNode.args.classification ===
              DATAFLOW_TYPE.TRANSFORM.props.REMOVEDUPLICATES.value
            ) {
              if (parentList.length === 1) {
                if (
                  getArgNode.schema === null &&
                  getArgNode.args.fields &&
                  getArgNode.args.fields.length !== 0
                ) {
                  getArgNode.schema = await outputSchemaApi(
                    getArgNode,
                    getNodebyId(parentList[0].id).schema,
                  );
                }
              } else {
                message.error(
                  'RemoveDuplicates node parents select 1 table only!',
                );
              }
            } else if (
              // MERGECOLUMN
              getArgNode.args.classification ===
              DATAFLOW_TYPE.TRANSFORM.props.MERGECOLUMN.value
            ) {
              let checkOK = false;

              if (
                getArgNode.args.separator &&
                getArgNode.args.fields.length >= 2 &&
                getArgNode.args.newColumn
              ) {
                checkOK = true;
              }

              if (parentList.length === 1) {
                getArgNode.schema = await outputSchemaApi(
                  getArgNode,
                  getNodebyId(parentList[0].id).schema,
                );
              } else {
                message.error('MergeColumn node parents select 1 table only!');
              }

              getArgNode.check = checkOK ? undefined : 'error';
            } else if (
              // UNION
              getArgNode.args.classification ===
              DATAFLOW_TYPE.TRANSFORM.props.UNION.value
            ) {
              //   let checkOK = false;
              //   if (changeNodeArg.unionMapping) {
              //     changeNodeArg.unionMapping.forEach(e => {
              //       if (
              //         e.outputColumn &&
              //         e.columnA &&
              //         e.columnB &&
              //         FUNCTIONS.COLUMN_TYPE_MAPPING(e.columnTypeA) ===
              //           FUNCTIONS.COLUMN_TYPE_MAPPING(e.columnTypeB)
              //       ) {
              //         checkOK = true;
              //       } else {
              //         checkOK = false;
              //       }
              //     });
              //   }

              if (parentList.length !== 2) {
                message.error('Please select 2 tables for union node');
              }

              //   if (parentList.length === 2 && checkOK === true) {
              //     getArgNode.schema = await outputSchemaApi(
              //       getArgNode,
              //       getNodebyId(parentList[0].id).schema,
              //     );
              //   }

              //   getArgNode.check =
              //     checkOK && getArgNode.schema ? undefined : 'error';
            }
            break;
          case 'Target':
            if (!isNull) {
              if (getArgNode.args && getArgNode.args.publish === true) {
                if (!getArgNode.args.columnDescription) {
                  const tempDes = getArgNode.args.schema.map(e => ({
                    name: e.name,
                    type: e.type,
                    description: e.description || e.name,
                  }));
                  getArgNode.args.columnDescription = tempDes;
                }

                getArgNode.check =
                  getArgNode.args.table_name && getArgNode.check !== 'error'
                    ? undefined
                    : 'error';
              } else {
                getArgNode.check = undefined;
              }
            } else {
              getArgNode.check = 'error';
            }
            break;
          default:
            break;
        }

        let setNewArg = getArgNode.args !== undefined ? getArgNode.args : '';

        if (setNewArg.length !== 0) {
          // setNewArg.name = nodeChange.name;
          setNewArg.name = getFullName;
          setNewArg.type =
            nodeChange.type.toLowerCase() === DATAFLOW_TYPE.DATASET.key
              ? 'datasource'
              : nodeChange.type.toLowerCase();
        }

        // check setNewArg
        if (
          setNewArg.classification ===
            DATAFLOW_TYPE.TRANSFORM.props.FILTER.value ||
          getArgNode.args.classification ===
            DATAFLOW_TYPE.TRANSFORM.props.CHANGEFORMAT.value
        ) {
          setNewArg = changeNodeArg;
        }

        //   const index = data.nodes.findIndex(e => e.id === nodeChange.id);

        const newData = FUNCTIONS.SET_DATA(
          data,
          nodeChange,
          index,
          newID,
          getArgNode,
          setNewArg,
          newEdge,
        );

        setData(newData);

        setNodeData({
          id: newID,
          // name: nodeChange.name,
          name: getFullName,
          type: nodeChange.type,
          edit: nodeData.edit,
        });

        setFocusNode({
          full_name: getFullName,
          name: FUNCTIONS.NODE_NAME(getFullName),
          id: newID,
          type: nodeChange.type,
          edit: nodeChange.edit,
          check: nodeChange.check,
        });
        setSelectPage(
          nodeChange.type.toLowerCase() === 'empty'
            ? DATAFLOW_TYPE.NEWNODE.key
            : nodeChange.type.toLowerCase(),
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  // 重畫資料 setData
  useEffect(() => {
    handleRedrawKedro();
  }, [nodeChange]);

  // Parent change
  useEffect(() => {
    if (edgeChange !== undefined) {
      setSelectFinish(false);
      setData({
        edges: edgeChange,
        nodes: [...data.nodes],
      });

      setFocusNode({
        full_name: nodeData.name,
        name: FUNCTIONS.NODE_NAME(nodeData.name),
        id: nodeData.id,
        type: nodeData.type,
        edit: nodeData.edit,
      });
    }
  }, [edgeChange]);

  useEffect(() => {
    const index = data.nodes.findIndex(i => i.id === nodeData.id);

    setFocusNode({
      full_name: nodeData.name,
      name: FUNCTIONS.NODE_NAME(nodeData.name),
      id: nodeData.id,
      type: nodeData.type,
      edit: nodeData.edit,
    });

    if (index !== -1) {
      const nodeArg = data.nodes[index].args;
      if (
        optionPage === DATAFLOW_TYPE.TRANSFORM.props.SELECTFIELDS.key &&
        nodeArg.classification ===
          DATAFLOW_TYPE.TRANSFORM.props.SELECTFIELDS.key
      ) {
        if (nodeArg.sql !== undefined) {
          nodeArg.sql = '';
        }
      } else if (
        optionPage === DATAFLOW_TYPE.TRANSFORM.props.CUSTOMIZE.key &&
        nodeArg.classification === DATAFLOW_TYPE.TRANSFORM.props.CUSTOMIZE.key
      ) {
        if (nodeArg.fields !== undefined) {
          nodeArg.fields.length = 0;
        }
      }
    }
  }, [optionPage]);

  const renderHeaderMenu = () => {
    switch (selectPage) {
      case DATAFLOW_TYPE.NEWNODE.key:
        return (
          <NewNodeMenu
            setRecordHeader={setRecordHeader}
            selectItem={selectItem}
            setSelectItem={setSelectItem}
          />
        );
      case DATAFLOW_TYPE.DATASET.key:
        return (
          <DatasetNodeMenu
            // nodeChange={nodeChange}
            schemaId={schemaId}
            setRecordHeader={setRecordHeader}
            selectItem={selectItem}
            setSelectItem={setSelectItem}
          />
        );
      case DATAFLOW_TYPE.CLEANSING.key:
        return (
          <CleansingNodeMenu
            setRecordHeader={setRecordHeader}
            optionPage={optionPage}
            selectItem={selectItem}
            setSelectItem={setSelectItem}
            schemaLoading={schemaLoading}
            nodeData={nodeData}
            data={data}
          />
        );
      case DATAFLOW_TYPE.TRANSFORM.key:
        return (
          <TransformNodeMenu
            setRecordHeader={setRecordHeader}
            optionPage={optionPage}
            selectItem={selectItem}
            setSelectItem={setSelectItem}
            schemaLoading={schemaLoading}
            nodeData={nodeData}
            data={data}
          />
        );
      case DATAFLOW_TYPE.TARGET.key:
        return (
          <TargetNodeMenu
            publish={nodePublish}
            setRecordHeader={setRecordHeader}
            selectItem={selectItem}
            setSelectItem={setSelectItem}
          />
        );
      default:
        return <DatasetNodeMenu />;
    }
  };

  const renderMenuContent = () => {
    switch (selectPage) {
      case DATAFLOW_TYPE.NEWNODE.key:
        return (
          <NewNodeItem
            setSelectPage={setSelectPage}
            nodeData={nodeData}
            setNodeChange={setNodeChange}
          />
        );
      case DATAFLOW_TYPE.DATASET.key:
        if (!recordHeader || recordHeader === 'node') {
          return (
            <DatasetNodeItem
              data={data}
              nodeData={nodeData}
              defaultTable={defaultTable}
              selectPage={selectPage}
              setSelectPage={setSelectPage}
              setNodeChange={setNodeChange}
              setSchema={setSchema}
              groupId={groupId}
              setData={setData}
              setSelectFinish={setSelectFinish}
              foundWisdomDate={foundWisdomDate}
            />
          );
        }
        if (recordHeader === 'schema') {
          return (
            <Schema
              // schema={tableSchema(data, dataset)}
              nodeData={nodeData}
              data={data}
            />
          );
        }
        if (recordHeader === 'sample') {
          return <Sample groupId={groupId} data={data} nodeData={nodeData} />;
        }
        return <div />;
      case DATAFLOW_TYPE.CLEANSING.key:
        if (!recordHeader || recordHeader === 'node') {
          return (
            <CleansingNodeItem
              data={data}
              setData={setData}
              nodeData={nodeData}
              selectPage={selectPage}
              setSelectPage={setSelectPage}
              setNodeChange={setNodeChange}
              optionPage={optionPage}
              setOptionPage={setOptionPage}
              setEdgeChange={setEdgeChange}
              nodeParents={getNodeParent(nodeData)}
              setSelectFinish={setSelectFinish}
              setFocusNode={setFocusNode}
            />
          );
        }
        if (recordHeader === DATAFLOW_TYPE.CLEANSING.key) {
          switch (optionPage.toLowerCase()) {
            case DATAFLOW_TYPE.CLEANSING.props.MISSINGVALUE.key:
              return (
                <MissingValue
                  data={data}
                  nodeData={nodeData}
                  nodeParents={getNodeParent(nodeData)}
                  schemaLoading={schemaLoading}
                  setNodeChange={setNodeChange}
                />
              );
            case DATAFLOW_TYPE.CLEANSING.props.CUSTOMVALUE.key:
              return (
                <CustomValue
                  data={data}
                  nodeData={nodeData}
                  nodeParents={getNodeParent(nodeData)}
                  schemaLoading={schemaLoading}
                  setNodeChange={setNodeChange}
                />
              );
            default:
              break;
          }
        }
        if (recordHeader === DATAFLOW_TYPE.TRANSFORM.OUTPUTDATA.key) {
          return (
            <OutputSchema
              nodeData={nodeData}
              data={data}
              schemaLoading={schemaLoading}
            />
          );
        }
        return <div />;
      case DATAFLOW_TYPE.TRANSFORM.key:
        if (!recordHeader || recordHeader === 'node') {
          return (
            <TransformNodeItem
              data={data}
              setData={setData}
              nodeData={nodeData}
              selectPage={selectPage}
              setSelectPage={setSelectPage}
              setNodeChange={setNodeChange}
              optionPage={optionPage}
              setOptionPage={setOptionPage}
              setEdgeChange={setEdgeChange}
              nodeParents={getNodeParent(nodeData)}
              setSelectFinish={setSelectFinish}
              setFocusNode={setFocusNode}
            />
          );
        }
        if (recordHeader === DATAFLOW_TYPE.TRANSFORM.key) {
          switch (optionPage.toLowerCase()) {
            case DATAFLOW_TYPE.TRANSFORM.props.SELECTFIELDS.key:
              return (
                <SelectFiled
                  //   nodeParents={getNodeParentTableInfo(nodeData)}
                  nodeParents={getNodeParent(nodeData)}
                  setData={setData}
                  nodeData={nodeData}
                  data={data}
                  setSelectFinish={setSelectFinish}
                  setNodeChange={setNodeChange}
                  setFocusNode={setFocusNode}
                  selectPage={selectPage}
                  schemaLoading={schemaLoading}
                  setSelectPage={setSelectPage}
                />
              );
            case DATAFLOW_TYPE.TRANSFORM.props.CUSTOMIZE.key:
              return (
                <Customize
                  setData={setData}
                  nodeData={nodeData}
                  data={data}
                  setSelectFinish={setSelectFinish}
                  nodeParents={getNodeParentTableInfo(nodeData)}
                  setFocusNode={setFocusNode}
                  sqlID={sqlID}
                  groupId={groupId}
                  setSchemaLoading={setSchemaLoading}
                  schemaLoading={schemaLoading}
                  setNodeChange={setNodeChange}
                />
              );
            case DATAFLOW_TYPE.TRANSFORM.props.JOIN.key:
              return (
                <JoinNode
                  data={data}
                  nodeData={nodeData}
                  nodeParents={getNodeParent(nodeData)}
                  setData={setData}
                  setSelectFinish={setSelectFinish}
                  setFocusNode={setFocusNode}
                  setNodeChange={setNodeChange}
                />
              );
            case DATAFLOW_TYPE.TRANSFORM.props.FILTER.key:
              return (
                <Filter
                  nodeParents={getNodeParent(nodeData)}
                  setSelectFinish={setSelectFinish}
                  data={filterArgsFilter(data)}
                  nodeData={nodeData}
                  // setPayload={setFliterPoperties}
                  setData={setData}
                  setFocusNode={setFocusNode}
                  schemaLoading={schemaLoading}
                  setNodeChange={setNodeChange}
                />
              );
            case DATAFLOW_TYPE.TRANSFORM.props.RENAMEFIELDS.key:
              return (
                <ReNameFiled
                  nodeParents={getNodeParentTableInfo(nodeData)}
                  setSelectFinish={setSelectFinish}
                  setData={setData}
                  nodeData={nodeData}
                  data={data}
                  setFocusNode={setFocusNode}
                  schemaLoading={schemaLoading}
                  setNodeChange={setNodeChange}
                />
              );
            case DATAFLOW_TYPE.TRANSFORM.props.GROUPBY.key:
              return (
                <GroupBy
                  nodeParents={getNodeParent(nodeData)}
                  setSelectFinish={setSelectFinish}
                  setData={setData}
                  nodeData={nodeData}
                  data={data}
                  setFocusNode={setFocusNode}
                  schemaLoading={schemaLoading}
                  setNodeChange={setNodeChange}
                />
              );
            case 'joinrenamefields':
              return (
                <JoinReNameFiled
                  nodeParents={getNodeParentTableInfo(nodeData)}
                  setSelectFinish={setSelectFinish}
                  setData={setData}
                  nodeData={nodeData}
                  data={data}
                  setFocusNode={setFocusNode}
                  schemaLoading={schemaLoading}
                  setNodeChange={setNodeChange}
                />
              );
            case DATAFLOW_TYPE.TRANSFORM.props.CHANGEFORMAT.key:
              return (
                <ChangeFormat
                  nodeParents={getNodeParent(nodeData)}
                  setSelectFinish={setSelectFinish}
                  data={filterArgsChangeFormat(data)}
                  nodeData={nodeData}
                  // setPayload={setFormatPoperties}
                  setData={setData}
                  setFocusNode={setFocusNode}
                  schemaLoading={schemaLoading}
                  setNodeChange={setNodeChange}
                />
              );
            case DATAFLOW_TYPE.TRANSFORM.props.CHANGEDATATYPE.key:
              return (
                <ChangeDataType
                  nodeParents={getNodeParent(nodeData)}
                  setSelectFinish={setSelectFinish}
                  data={filterArgsChangeFormat(data)}
                  nodeData={nodeData}
                  // setPayload={setFormatPoperties}
                  setData={setData}
                  setFocusNode={setFocusNode}
                  schemaLoading={schemaLoading}
                  setNodeChange={setNodeChange}
                />
              );
            case DATAFLOW_TYPE.TRANSFORM.props.MATHFUNCTION.key:
              return (
                <MathFunction
                  nodeParents={getNodeParent(nodeData)}
                  setSelectFinish={setSelectFinish}
                  data={data}
                  nodeData={nodeData}
                  setData={setData}
                  setFocusNode={setFocusNode}
                  // schemaLoading={schemaLoading}
                  setNodeChange={setNodeChange}
                />
              );
            case DATAFLOW_TYPE.TRANSFORM.props.REMOVEDUPLICATES.key:
              return (
                <RemoveDuplicate
                  nodeParents={getNodeParentTableInfo(nodeData)}
                  nodeData={nodeData}
                  data={data}
                  setData={setData}
                  setSelectFinish={setSelectFinish}
                  setFocusNode={setFocusNode}
                  schemaLoading={schemaLoading}
                  setNodeChange={setNodeChange}
                />
              );
            case DATAFLOW_TYPE.TRANSFORM.props.MERGECOLUMN.key:
              return (
                <MergeColumn
                  nodeParents={getNodeParentTableInfo(nodeData)}
                  nodeData={nodeData}
                  data={data}
                  setData={setData}
                  setSelectFinish={setSelectFinish}
                  setFocusNode={setFocusNode}
                  schemaLoading={schemaLoading}
                  setNodeChange={setNodeChange}
                />
              );
            case DATAFLOW_TYPE.TRANSFORM.props.UNION.key:
              return (
                <Union
                  nodeParents={getNodeParent(nodeData)}
                  setSelectFinish={setSelectFinish}
                  setData={setData}
                  nodeData={nodeData}
                  data={data}
                  setFocusNode={setFocusNode}
                  schemaLoading={schemaLoading}
                  setNodeChange={setNodeChange}
                />
              );
            default:
              break;
          }
        }
        if (recordHeader === DATAFLOW_TYPE.TRANSFORM.OUTPUTDATA.key) {
          return (
            <OutputSchema
              nodeData={nodeData}
              data={data}
              schemaLoading={schemaLoading}
            />
          );
        }
        return <div />;
      case DATAFLOW_TYPE.TARGET.key:
        if (!recordHeader || recordHeader === 'node') {
          return (
            <TargetNodeItem
              usedTargetName={
                usedTargetList && usedTargetList.map(e => e.fullName)
              }
              data={data}
              setPublishChange={setPublishChange}
              nodeData={nodeData}
              selectPage={selectPage}
              setSelectPage={setSelectPage}
              setNodeChange={setNodeChange}
              nodePublish={nodePublish}
              setNodePublish={setNodePublish}
              setFocusNode={setFocusNode}
              historyMode={historyMode}
            />
          );
        }
        if (recordHeader === DATAFLOW_TYPE.TARGET.PROPERTIES.key) {
          return (
            <TargetProperties
              sqlID={sqlID}
              data={data}
              nodeData={nodeData}
              setSelectFinish={setSelectFinish}
              setData={setData}
              setFocusNode={setFocusNode}
              setNodeChange={setNodeChange}
            />
          );
        }
        if (recordHeader === DATAFLOW_TYPE.TARGET.OUTPUTDATA.key) {
          return (
            <OutputData
              nodeData={nodeData}
              sqlID={sqlID}
              projectName={projectName}
              groupId={groupId}
              diagram={diagram}
              schedule={schedule}
              focusNode={focusNode}
            />
          );
        }
        if (recordHeader === DATAFLOW_TYPE.TRANSFORM.OUTPUTDATA.key) {
          return (
            <OutputSchema
              nodeData={nodeData}
              data={data}
              schemaLoading={schemaLoading}
            />
          );
        }
        return <div />;
      default:
        return <div />;
    }
  };

  return (
    <>
      {renderHeaderMenu()}
      {renderMenuContent()}
    </>
  );
};

export default Menu;
