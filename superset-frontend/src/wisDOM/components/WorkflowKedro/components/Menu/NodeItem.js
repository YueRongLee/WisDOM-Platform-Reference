/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Tooltip, Checkbox } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
  INPUT_RULES,
  FLOW_NAME_RULES,
  FUNCTIONS,
  NODE_INFO_TEXT,
} from '~~constants/index';
// import { TableApi } from '~~apis/';

import * as Style from './style';

const { Option } = Select;

const ScheduleNodeItem = ({
  selectPage,
  setSelectPage,
  nodeData,
  setNodeChange,
  // setSchema,
  data,
  setData,
  action,
  setAction,
  groupId,
  setFocusNode,
  setSelectFinish,
}) => {
  const [form] = Form.useForm();
  // const [tableLoading, setTableLoading] = useState(false);
  const [inputClick, setInputClick] = useState(false);
  const [inputChange, setInputChange] = useState(undefined);
  const [showCheckBox, setShowCheckBox] = useState(false);
  const [showHelp, setShowHelp] = useState('');
  // const [groupAtlasTable, setGroupAtlasTable] = useState([]);
  //   const [eventHub, setEventHub] = useState(false);

  const handleSelectNodeType = type => {
    setSelectPage(type.toLowerCase());
  };

  const checkClearArg = () => {
    // node頁的args要留,其他清除
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter.length > 0 && nodeFilter[0].args !== undefined) {
      nodeFilter[0].args = {
        classification: nodeFilter[0].args.classification,
        name: nodeFilter[0].args.name,
        type: nodeFilter[0].args.type,
        needNotify: nodeFilter[0].args.needNotify,
        cron: nodeFilter[0].args.cron,
      };
    }
  };

  const disableCondition = () => {
    const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

    if (
      getArgNode.length > 0 &&
      getArgNode[0].args !== undefined &&
      getArgNode[0].args.classification === 'condition'
    ) {
      return true;
    }
    return false;
  };

  const handleSelectAction = async value => {
    // setSchema(value);
    checkClearArg();
    setAction(value);
  };

  useEffect(() => {
    if (nodeData.name !== undefined && nodeData.name !== null) {
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      if (index !== -1) {
        const nodeArg = data.nodes[index].args;

        let checkBox = false;
        let showMsg = '';
        switch (nodeArg.classification) {
          case 'insertData':
            checkBox = true;
            break;
          case 'createDataRobotProject':
            showMsg =
              'Dataset must contain enough rows. The minimum number of rows required is 20';
            break;
          default:
            break;
        }
        setShowHelp(showMsg);
        setShowCheckBox(checkBox);

        form.setFieldsValue({
          name: nodeData.name,
          nodetype: nodeData.type,
          classification: nodeArg.classification,
          eventHub:
            nodeArg.needNotify !== undefined ? nodeArg.needNotify : false,
        });
        handleSelectNodeType(
          nodeData.type === 'Empty' ? 'action' : nodeData.type,
        );
        // handleSelectAction(nodeData.action);
      }
    }
  }, [nodeData]);

  useEffect(() => {
    form.setFieldsValue({ action });
  }, [groupId]);

  useEffect(() => {
    if (inputClick === false && inputChange !== undefined) {
      setNodeChange(inputChange);
      setInputChange(undefined); // 判斷完清空
    }
  }, [inputClick]);

  const addConditionNode = () => {
    // for condition count
    // const ifFilter = data.nodes.filter(
    // e => e.type === 'YES' || e.type === 'NO',
    // );
    // const ifCount = Object.values(ifFilter).length;
    // const ifStr =
    // ifCount === 0 ? '' : String(Object.values(ifFilter)[ifCount - 1].id);
    // const ifNum =
    // ifCount === 0 ? 1 : parseInt(ifStr.substring(9, ifStr.length), 10) + 1;
    // const newIDIF = `Condition${ifNum}`;
    // const newIDNO = `Condition${ifNum + 1}`;
    const newIDIF = `Condition${moment().format('x')}`;
    const newIDNO = `Condition${moment().format('x')}1`;

    // for Action count
    // const actFilter = data.nodes.filter(e => e.type === 'Action');
    // const actCount = Object.values(actFilter).length;
    // const actStr =
    // actCount === 0 ? '' : String(Object.values(actFilter)[actCount - 1].id);
    // const actNum =
    // actCount === 0 ? 1 : parseInt(actStr.substring(6, actStr.length), 10) + 1;
    // const newID = `Action${actNum}`;
    const newID = `Action${moment().format('x')}`;

    if (nodeData !== undefined && nodeData !== null) {
      //   const nodeFilter = data.nodes.filter(e => e.id !== nodeData.id);
      const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const setNewArg =
        getArgNode && getArgNode.length > 0 ? getArgNode[0].args : '';
      if (setNewArg.length !== 0) {
        setNewArg.ifyes = newIDIF;
        setNewArg.ifno = newIDNO;
      }
      const newEdges = data.edges;
      newEdges.forEach((item, index) => {
        if (item.target === nodeData.id) {
          newEdges[index].target = newID;
        }
      });

      const newEdgeIF = {
        source: newID,
        target: newIDIF,
      };
      const newEdgeNO = {
        source: newID,
        target: newIDNO,
      };
      setSelectFinish(false);

      const index = data.nodes.findIndex(e => e.id === nodeData.id);

      const newData = FUNCTIONS.SET_DATA(
        data,
        nodeData,
        index,
        newID,
        getArgNode[0],
        setNewArg,
        [...newEdges, newEdgeIF, newEdgeNO],
      );

      setData({
        edges: [...newEdges, newEdgeIF, newEdgeNO],
        nodes: [
          ...newData.nodes,
          {
            full_name: 'Condition-Y',
            name: 'Condition-Y',
            id: newIDIF,
            type: 'YES',
            args: {
              name: 'Condition-Y',
              type: 'YES',
              classification: 'condition',
            },
          },
          {
            full_name: 'Condition-N',
            name: 'Condition-N',
            id: newIDNO,
            type: 'NO',
            args: {
              name: 'Condition-N',
              type: 'NO',
              classification: 'condition',
            },
          },
        ],
      });

      //   setData({
      //     edges: [...newEdges, newEdgeIF, newEdgeNO],
      //     nodes: [
      //       ...nodeFilter,
      //       {
      //         full_name: nodeData.name,
      //         name: FUNCTIONS.NODE_NAME(nodeData.name),
      //         id: newID,
      //         type: nodeData.type,
      //         args: setNewArg,
      //       },
      //       {
      //         full_name: 'Condition-Y',
      //         name: 'Condition-Y',
      //         id: newIDIF,
      //         type: 'YES',
      //         args: {
      //           name: 'Condition-Y',
      //           type: 'YES',
      //           classification: 'condition',
      //         },
      //       },
      //       {
      //         full_name: 'Condition-N',
      //         name: 'Condition-N',
      //         id: newIDNO,
      //         type: 'NO',
      //         args: {
      //           name: 'Condition-N',
      //           type: 'NO',
      //           classification: 'condition',
      //         },
      //       },
      //     ],
      //   });

      setFocusNode({
        full_name: nodeData.name,
        name: nodeData.name,
        id: newID,
        type: nodeData.type,
      });
    }
  };

  // 找出 condition 下的子節點
  // const findChildNode = (length, list) => {
  //   const tempList = [];
  //   data.edges.forEach(edge => {
  //     list.forEach(node => {
  //       if (node === edge.source) {
  //         tempList.push(edge.source);
  //         tempList.push(edge.target);
  //       }
  //     });
  //   });
  //   const newList = tempList.filter((element, index, arr) => {
  //     return arr.indexOf(element) === index;
  //   });
  //   if (length === newList.length) {
  //     return list;
  //   }
  //   return findChildNode(newList.length, newList);
  // };

  // const conditionDelete = async node => {
  //   const list = [node[0].id, node[0].args.ifyes, node[0].args.ifno];
  //   const childList = findChildNode(list.length, list);
  //   let tempEdges = data.edges;
  //   let tempNodes = data.nodes;
  //   const result = await Promise.all(
  //     childList.map(async deleteID => {
  //       const newEdge = tempEdges.filter(
  //         e => e.target !== deleteID && e.source !== deleteID,
  //       );
  //       const newNode = tempNodes.filter(e => e.id !== deleteID);
  //       tempEdges = newEdge;
  //       tempNodes = newNode;
  //       return { newEdge: tempEdges, nodes: tempNodes };
  //     }),
  //   );
  //   setData({
  //     edges: result[result.length - 1].newEdge,
  //     nodes: result[result.length - 1].nodes,
  //   });

  //   setFocusNode(undefined); // focus的刪除只能刪一次
  // };

  // const handleDelete = () => {
  //   // const deleteID = data.edges.length!==0?data.edges[data.edges.length - 1].target:"";
  //   if (nodeData) {
  //     if (nodeData.type === 'Action') {
  //       const findNode = data.nodes.filter(n => n.id === nodeData.id);
  //       if (findNode[0].args.classification === 'condition') {
  //         conditionDelete(findNode);
  //       }
  //     }
  //   }
  // };

  //

  const showCondition = () => {
    const findSource = data.edges.findIndex(
      edge => edge.source === nodeData.id,
    );
    const findTarget = data.edges.findIndex(
      edge => edge.target === nodeData.id,
    );
    if (findSource > -1 && findTarget > -1) {
      return false;
    }
    return true;
  };

  const hangeValueChange = changeValue => {
    if (changeValue !== undefined) {
      const changeColumn = Object.keys(changeValue)[0];
      const newNode = {
        id: nodeData.id,
        name:
          changeColumn === 'name'
            ? Object.values(changeValue)[0]
            : nodeData.name,
        type:
          changeColumn === 'nodetype'
            ? Object.values(changeValue)[0].charAt(0).toUpperCase() +
              Object.values(changeValue)[0].slice(1) // 開頭改大寫
            : nodeData.type,
      };
      setInputChange(newNode);
      if (changeColumn === 'nodetype') {
        setInputChange(undefined); // type可以直接改
        setNodeChange(newNode);
      } else if (changeColumn === 'classification') {
        const index = data.nodes.findIndex(e => e.id === nodeData.id);
        if (index !== -1) {
          const nodeArg = data.nodes[index].args;
          nodeArg.classification = Object.values(changeValue)[0];

          if (Object.values(changeValue)[0] === 'schedule') {
            nodeArg.cron = ''; // 不管有沒有都把它填入空字串
          }

          if (Object.values(changeValue)[0] === 'condition') {
            addConditionNode();
          } else {
            setNodeChange(newNode);
          }
        }
      } else if (changeColumn === 'eventHub') {
        const index = data.nodes.findIndex(e => e.id === nodeData.id);
        if (index !== -1) {
          const nodeArg = data.nodes[index].args;
          nodeArg.needNotify = Object.values(changeValue)[0];
        }
      } else {
        setInputChange(newNode);
      }
    }
  };

  const handleValidate = () => {
    form
      .validateFields()
      .then(() => setInputClick(false))
      .catch(info => {
        if (info.values.name !== undefined) {
          form.setFieldsValue({ name: nodeData.name });
        }
      });
  };

  const disableNodeType = () => {
    if (nodeData.id) {
      if (nodeData.id.indexOf('Trigger') > -1) {
        return true;
      }
      return false;
    }
    return true;
  };

  return (
    // <Spin spinning={tableLoading}>
    <Form
      form={form}
      className="node-wrapper"
      initialValues={{
        name: nodeData.name,
        nodetype: selectPage,
        action: nodeData.action,
      }}
      onValuesChange={hangeValueChange}
    >
      <Style.FormItem
        label="Name"
        name="name"
        rules={[
          { required: true, message: 'Please input a node Name!' },
          {
            pattern: FLOW_NAME_RULES.pattern,
            message:
              'Start with alphabet,only letters, numbers and underline(_)',
          },
        ]}
      >
        <Input
          data-test="nodeItemInput"
          onFocus={() => setInputClick(true)}
          //   onBlur={() => setInputClick(false)}
          disabled={!nodeData.edit}
          maxLength={INPUT_RULES.TABLE_NAME.value}
          onBlur={() => handleValidate()}
        />
      </Style.FormItem>
      <Style.FormItem label="Node Type" name="nodetype">
        <Select
          showSearch
          onChange={value => handleSelectNodeType(value)}
          disabled={!nodeData.edit || disableNodeType()}
        >
          {nodeData.type === 'Empty' || nodeData.type === 'Action' ? null : (
            <Option value="Trigger">Trigger</Option>
          )}
          <Option value="Action">Action</Option>
        </Select>
      </Style.FormItem>
      {nodeData.type === 'Empty' ? null : (
        <Style.FormItem
          label="Trigger/Action type"
          name="classification"
          help={showHelp}
        >
          {selectPage === 'trigger' ? (
            <Select
              showSearch
              onChange={value => handleSelectAction(value)}
              disabled={!nodeData.edit}
            >
              <Option value="schedule">
                <Style.OptionBlock>
                  <div>Schedule</div>
                  <div>
                    <Tooltip
                      placement="bottomRight"
                      title={NODE_INFO_TEXT.schedule}
                    >
                      <InfoCircleOutlined />
                    </Tooltip>
                  </div>
                </Style.OptionBlock>
              </Option>
              <Option value="api">
                <Style.OptionBlock>
                  <div>Post API</div>
                  <div>
                    <Tooltip
                      placement="bottomRight"
                      title={NODE_INFO_TEXT.postAPI}
                    >
                      <InfoCircleOutlined />
                    </Tooltip>
                  </div>
                </Style.OptionBlock>
              </Option>
            </Select>
          ) : (
            <Select
              showSearch
              onChange={value => handleSelectAction(value)}
              disabled={!nodeData.edit || disableCondition(nodeData.id)}
            >
              <Option value="insertData">
                <Style.OptionBlock>
                  {/* <div>InsertData</div> */}
                  {/* 只有選單顯示修改,後端還是用inserData */}
                  <div>Export Data</div>
                  <div>
                    <Tooltip
                      placement="bottomRight"
                      title={NODE_INFO_TEXT.insertData}
                    >
                      <InfoCircleOutlined />
                    </Tooltip>
                  </div>
                </Style.OptionBlock>
              </Option>
              {showCondition() && (
                <Option value="condition">
                  <Style.OptionBlock>
                    <div>Condition</div>
                    <div>
                      <Tooltip
                        placement="bottomRight"
                        title={NODE_INFO_TEXT.condition}
                      >
                        <InfoCircleOutlined />
                      </Tooltip>
                    </div>
                  </Style.OptionBlock>
                </Option>
              )}
              <Option value="sendMail">
                <Style.OptionBlock>
                  <div>Send a mail notification</div>
                  <div>
                    <Tooltip
                      placement="bottomRight"
                      title={NODE_INFO_TEXT.sendMail}
                    >
                      <InfoCircleOutlined />
                    </Tooltip>
                  </div>
                </Style.OptionBlock>
              </Option>
              <Option value="postTeams">
                <Style.OptionBlock>
                  <div>Post a teams message</div>
                  <div>
                    <Tooltip
                      placement="bottomRight"
                      title={NODE_INFO_TEXT.postTeam}
                    >
                      <InfoCircleOutlined />
                    </Tooltip>
                  </div>
                </Style.OptionBlock>
              </Option>
              <Option value="powerBi">
                <Style.OptionBlock>
                  <div>Publish a Power BI Report</div>
                  <div>
                    <Tooltip
                      placement="bottomRight"
                      title={NODE_INFO_TEXT.powerBi}
                    >
                      <InfoCircleOutlined />
                    </Tooltip>
                  </div>
                </Style.OptionBlock>
              </Option>
              <Option value="makeDataRobotPrediction">
                <Style.OptionBlock>
                  <div>Make predictions via DataRobot</div>
                  <div>
                    <Tooltip
                      placement="bottomRight"
                      title={NODE_INFO_TEXT.makeDataRobotPrediction}
                    >
                      <InfoCircleOutlined />
                    </Tooltip>
                  </div>
                </Style.OptionBlock>
              </Option>
              <Option value="createDataRobotProject">
                <Style.OptionBlock>
                  <div>Create a project on DataRobot</div>
                  <div>
                    <Tooltip
                      placement="bottomRight"
                      title={NODE_INFO_TEXT.createDataRobotProject}
                    >
                      <InfoCircleOutlined />
                    </Tooltip>
                  </div>
                </Style.OptionBlock>
              </Option>
            </Select>
          )}
        </Style.FormItem>
      )}

      {/* {form.getFieldValue('classification') === 'insertData' ? ( */}

      {showCheckBox ? (
        <Style.FormItem
          label="Data Update Event"
          name="eventHub"
          //   tooltip={{
          //     title: 'Send an event when data is prepared in deliveryzone.',
          //     icon: <InfoCircleOutlined />,
          //   }}
          valuePropName="checked"
        >
          <Checkbox disabled={!nodeData.edit}>
            Send an event when data is prepared in deliveryzone
          </Checkbox>
        </Style.FormItem>
      ) : null}
    </Form>
    // </Spin>
  );
};

ScheduleNodeItem.propTypes = {
  data: PropTypes.object,
};

ScheduleNodeItem.defaultProps = {
  data: {},
};

export default ScheduleNodeItem;
