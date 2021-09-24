/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import { Select, Button, Form, Space, Spin, Tooltip } from 'antd';
import moment from 'moment';
import { MinusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import {
  DATAFLOW_TYPE,
  SVGICONS,
  NODE_INFO_TEXT,
  FUNCTIONS,
} from '~~constants/index';
import { TableApi } from '~~apis/';
import * as Style from './style';

const Join = ({
  nodeData,
  nodeParents,
  data,
  setData,
  setSelectFinish,
  setFocusNode,
  //   getParentSchema,
  //   sqlID,
  //   groupId,
  setNodeChange,
}) => {
  const [form] = Form.useForm();
  const [lock, setLock] = useState(false);
  const [selectJoin, setSelectJonin] = useState(false);
  const [leftList, setLeftList] = useState([]);
  const [rightList, setRightList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [leftListSchema, setLeftListSchema] = useState([]);
  const [rightListSchema, setRightListSchema] = useState([]);

  const getTableColumns = async () => {
    setListLoading(true);
    try {
      // Left
      if (nodeParents[0].type === DATAFLOW_TYPE.DATASET.value) {
        const result1 = await TableApi.getAllowedTableColumns(
          nodeParents[0].args.table_name,
        );
        setLeftListSchema(result1.table.columns);
        setLeftList(result1.table.columns.map(e => e.name));
      } else {
        const index = data.nodes.findIndex(e => e.id === nodeParents[0].key);
        const thisNode = data.nodes[index];
        const leftCol = thisNode.schema.map(e => e.name);
        setLeftListSchema(thisNode.schema);
        setLeftList(leftCol);
      }

      // Right
      if (nodeParents[1].type === DATAFLOW_TYPE.DATASET.value) {
        const result2 = await TableApi.getAllowedTableColumns(
          nodeParents[1].args.table_name,
        );
        setRightListSchema(result2.table.columns);
        setRightList(result2.table.columns.map(e => e.name));
      } else {
        const indexR = data.nodes.findIndex(e => e.id === nodeParents[1].key);
        const thisNodeR = data.nodes[indexR];
        const rightCol = thisNodeR.schema.map(e => e.name);
        setRightListSchema(thisNodeR.schema);
        setRightList(rightCol);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setListLoading(false);
    }
  };

  const getJoinType = type => {
    if (type === DATAFLOW_TYPE.TRANSFORM.props.JOIN.value) {
      setSelectJonin(true);
      return null;
    }
    return type;
  };

  useEffect(() => {
    if (nodeParents[0] === undefined || nodeParents[1] === undefined) {
      setLock(true);
    } else {
      setLock(false);
      if (data !== undefined) {
        getTableColumns();
      }
    }
  }, []);

  const addRenameFieldNode = repeat => {
    // const ifFilter = data.nodes.filter(e => e.type === 'Transform');
    // const ifCount = Object.values(ifFilter).length;
    // const ifStr =
    //   ifCount === 0 ? '' : String(Object.values(ifFilter)[ifCount - 1].id);
    // const ifNum =
    //   ifCount === 0 ? 1 : parseInt(ifStr.substring(9, ifStr.length), 10) + 1;
    // const newID = `Transform${ifNum}`;
    const newID = `Transform${moment().format('x')}`;
    const newArgs = {
      classification: 'JoinRenameFields',
      name: 'new_Node',
      type: 'transform',
      autoProduce: 'Join',
      repeat,
    };
    if (nodeData !== undefined && nodeData !== null) {
      const edgeFilter = data.edges.filter(e => {
        if (e.source === nodeParents[1].key && e.target === nodeData.id) {
          return false;
        }
        return e;
      });
      const newEdgeSource = {
        source: nodeParents[1].key,
        target: newID,
      };
      const newEdgeTarget = {
        source: newID,
        target: nodeData.id,
      };
      setSelectFinish(false);
      setData({
        edges: [...edgeFilter, newEdgeSource, newEdgeTarget],
        nodes: [
          ...data.nodes,
          {
            full_name: 'new_Node',
            name: 'new_Node',
            id: newID,
            type: 'Transform',
            args: newArgs,
          },
        ],
      });

      setFocusNode({
        full_name: 'new_Node',
        name: 'new_Node',
        id: newID,
        type: 'Transform',
      });
      setNodeChange({
        full_name: 'new_Node',
        name: 'new_Node',
        id: newID,
        type: 'Transform',
      });
    }
  };

  useEffect(() => {
    if (leftListSchema.length > 0 && rightListSchema.length > 0) {
      const repeat = [];
      [...rightListSchema].forEach(rightItem => {
        [...leftListSchema].forEach(leftItem => {
          if (rightItem.name === leftItem.name) {
            repeat.push(rightItem);
          }
        });
      });

      if (repeat.length > 0) {
        addRenameFieldNode(repeat);
      }
    }
  }, [leftListSchema, rightListSchema]);

  useEffect(() => {
    if (nodeData.name !== undefined && nodeData.name !== null) {
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      if (index !== -1) {
        const nodeArg = data.nodes[index].args;
        if (nodeArg.mapping !== undefined) {
          const map = nodeArg.mapping.map(e => ({
            column1: e.from_column,
            column2: e.to_column,
          }));
          form.setFieldsValue({ payload: map });
        }

        form.setFieldsValue({
          joinType:
            nodeArg.classification !== undefined
              ? getJoinType(nodeArg.classification)
              : '',
        });
      }
    }
  }, [nodeData]);

  const handleValueChange = changeValue => {
    const changeKey = Object.keys(changeValue)[0];
    const changeValues = Object.values(changeValue)[0];

    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    if (index !== -1) {
      const thisNode = data.nodes[index];
      const nodeArg = thisNode.args;
      let map;
      switch (changeKey) {
        case 'joinType':
          nodeArg.classification = changeValues;
          setSelectJonin(false);
          break;
        case 'payload':
          map =
            form.getFieldsValue() &&
            form.getFieldsValue().payload.map(e => ({
              from_node: nodeParents[0] && nodeParents[0].key, // node id
              from_column: e.column1,
              to_node: nodeParents[1] && nodeParents[1].key,
              to_column: e.column2,
            }));
          nodeArg.mapping = map;
          break;
        default:
          break;
      }

      let checkMapping = false;
      if (nodeArg.mapping) {
        nodeArg.mapping.forEach(e => {
          if (e && e.from_column && e.from_node && e.to_node && e.to_column) {
            checkMapping = true;
          } else {
            checkMapping = false;
          }
        });
      }

      let change = false;
      if (thisNode) {
        if (thisNode && !checkMapping && thisNode.check !== 'error') {
          thisNode.check = 'error';
          change = true;
        } else if (thisNode && checkMapping) {
          if (thisNode.check !== undefined) {
            thisNode.check = undefined;
            change = true;
          }
        }
      }

      if (change) {
        setNodeChange(thisNode);
      } else {
        setSelectFinish(false);
        setData({
          edges: [...data.edges],
          nodes: [...data.nodes],
        });
        setFocusNode({
          full_name: nodeData.name,
          name: FUNCTIONS.NODE_NAME(nodeData.name),
          id: nodeData.id,
          type: nodeData.type,
        });
      }
    }
  };

  const showTableName = parents => {
    if (parents !== undefined) {
      if (parents.name.length > 12) {
        return `${parents.name.substring(0, 10)}...`;
      }
      return parents.name;
    }
    return 'No Data';
  };

  return (
    <Style.InsertScroll>
      <Form
        form={form}
        // onFinish={handleSave}
        scrollToFirstError
        initialValues={{
          payload: [{}], // 預設帶一筆
        }}
        onValuesChange={handleValueChange}
      >
        <Form.Item name="joinType" label="Join Type">
          <Select placeholder="Select a Join Type" disabled={!nodeData.edit}>
            <Select.Option value="innerjoin" label="Inner Join">
              <Style.OptionBlock>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="Join">Inner Join</span>
                  <span>
                    <SVGICONS.INNERJOIN_ICON
                      style={{ fontSize: '28px', marginLeft: '5px' }}
                    />
                  </span>
                </div>
                <Tooltip
                  placement="bottomRight"
                  title={NODE_INFO_TEXT.innerJoin}
                >
                  <InfoCircleOutlined />
                </Tooltip>
              </Style.OptionBlock>
            </Select.Option>
            <Select.Option value="rightjoin">
              <Style.OptionBlock>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>Right Join</span>
                  <span>
                    <SVGICONS.RIGHTJOIN_ICON
                      style={{ fontSize: '28px', marginLeft: '5px' }}
                    />
                  </span>
                </div>
                <Tooltip
                  placement="bottomRight"
                  title={NODE_INFO_TEXT.rightJoin}
                >
                  <InfoCircleOutlined />
                </Tooltip>
              </Style.OptionBlock>
            </Select.Option>
            <Select.Option value="leftjoin" label="Left Join">
              <Style.OptionBlock>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>Left Join</span>
                  <span>
                    <SVGICONS.LEFTJOIN_ICON
                      style={{ fontSize: '28px', marginLeft: '5px' }}
                    />
                  </span>
                </div>
                <Tooltip
                  placement="bottomRight"
                  title={NODE_INFO_TEXT.leftJoin}
                >
                  <InfoCircleOutlined />
                </Tooltip>
              </Style.OptionBlock>
            </Select.Option>
          </Select>
        </Form.Item>
        <div style={{ padding: '10px 10px 0 15px' }}>Join Condition</div>
        <div style={{ padding: '10px 10px 0 15px' }}>
          Select a key from each dataset to set the condition of the join
        </div>
        {nodeData.edit && lock ? (
          <div style={{ padding: '10px 10px 0 15px', color: 'tomato' }}>
            Please select 2 node parents !
          </div>
        ) : null}
        {selectJoin ? (
          <div style={{ padding: '10px 10px 0 15px', color: 'tomato' }}>
            Please select Join type !
          </div>
        ) : null}
        <Spin spinning={listLoading}>
          <Form.List name="payload">
            {(fields, { add, remove }) => (
              <>
                <Button
                  style={{ width: 210, margin: '10px 0 15px 24px' }}
                  onClick={() => {
                    add();
                  }}
                  block
                  disabled={!nodeData.edit || lock || selectJoin}
                >
                  Add Condition
                </Button>

                <div
                  style={
                    form.getFieldValue('payload') &&
                    form.getFieldValue('payload').length > 1
                      ? {
                          display: 'flex',
                          justifyContent: 'space-around',
                          margin: '0px 85px 0px 0px',
                        }
                      : {
                          margin: '10px 15px 0',
                          display: 'flex',
                          justifyContent: 'space-around',
                        }
                  }
                >
                  <div
                    style={{ color: '#20a7c9' }}
                    title={nodeParents[0] && nodeParents[0].name}
                  >
                    {`${showTableName(nodeParents[0])} (Left)`}
                  </div>
                  <div
                    style={{ color: '#20a7c9' }}
                    title={nodeParents[1] && nodeParents[1].name}
                  >
                    {`${showTableName(nodeParents[1])} (Right)`}
                  </div>
                </div>
                {fields.map(field => (
                  <Space
                    size={0}
                    key={field.key}
                    className="joinRow"
                    align="center"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      margin: '0px 15px 0px',
                    }}
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, 'column1']}
                      fieldKey={[field.fieldKey, 'column1']}
                      rules={[
                        {
                          required: true,
                          message: 'Required',
                        },
                      ]}
                    >
                      <Select
                        style={{ width: 150 }}
                        placeholder="Select a column"
                        disabled={!nodeData.edit || lock || selectJoin}
                      >
                        {leftList.map(e => (
                          <Select.Option value={e}>{e}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <div> = </div>
                    <Form.Item
                      {...field}
                      name={[field.name, 'column2']}
                      fieldKey={[field.fieldKey, 'column2']}
                      rules={[
                        {
                          required: true,
                          message: 'Required',
                        },
                      ]}
                    >
                      <Select
                        style={{ width: 150 }}
                        placeholder="Select a column"
                        disabled={!nodeData.edit || lock || selectJoin}
                      >
                        {rightList.map(e => (
                          <Select.Option value={e}>{e}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    {form.getFieldValue('payload').length > 1 && (
                      <Form.Item>
                        <MinusCircleOutlined
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      </Form.Item>
                    )}
                  </Space>
                ))}
              </>
            )}
          </Form.List>
        </Spin>
      </Form>
    </Style.InsertScroll>
  );
};

export default Join;
