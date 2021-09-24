/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import { Spin, Result, Form, Radio, Button, Select, Space, Input } from 'antd';
import {
  InfoCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Selection } from 'brace';
import { DataFlowApi } from '~~apis/';
import { useQuery } from '~~hooks/';
import { FUNCTIONS } from '~~constants/index';
import * as Style from './style';

const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};

const AGGREGATE = [
  {
    key: 'sum',
    value: 'Sum',
  },
  {
    key: 'count',
    value: 'Count',
  },
  {
    key: 'max',
    value: 'Max',
  },
  {
    key: 'min',
    value: 'Min',
  },
  {
    key: 'mean',
    value: 'Mean',
  },
  {
    key: 'median',
    value: 'Median',
  },
];

const COMPARISON_OPERATOR_MAP = [
  {
    key: 'GREATER',
    name: '>',
    disabledType: ['string'],
  },
  {
    key: 'LESS_THAN',
    name: '<',
    disabledType: ['string'],
  },
  {
    key: 'GREATER_OR_EQUAL',
    name: '>=',
    disabledType: ['string'],
  },
  {
    key: 'LESS_THAN_OR_EQUAL',
    name: '<=',
    disabledType: ['string'],
  },
  {
    key: 'EQUAL',
    name: '==',
    disabledType: [],
  },
  {
    key: 'NOT_EQUAL',
    name: '!=',
    disabledType: [],
  },
];

const MAP_ALLOWTYPE = [
  'int',
  'long',
  'float',
  'double',
  'bigint',
  'smallint',
  'tinyint',
];
// condition
const Sub2PowerBiPoperties = ({
  nodeData,
  data,
  setSelectFinish,
  setData,
  setFocusNode,
  setNodeChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [targetList, setTargetList] = useState([]);
  const [dataflowId, setDataflowId] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [tempPayload, setTempPayload] = useState([{}]);

  const [form] = Form.useForm();

  const getTargetList = async flowId => {
    try {
      setLoading(true);
      const result = await DataFlowApi.getTargetNode(flowId);
      const cols = result.map(e => ({
        id: e.id,
        name: e.full_name,
        columns: e.schema,
      }));

      setTargetList(cols);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDataArg = setNewArg => {
    const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

    let statusChange = false;
    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    if (
      getArgNode[0].args.powerBiCondition &&
      getArgNode[0].args.powerBiCondition.length > 0
    ) {
      const condList = getArgNode[0].args.powerBiCondition;
      let check = false;
      if (condList && getArgNode[0].args.logicalOperator) {
        // logicalOperator沒選直接false
        condList.forEach(e => {
          if (
            e.target &&
            e.aggregate &&
            e.operation &&
            e.columnName &&
            e.value
          ) {
            check = true;
          } else {
            check = false;
          }
        });
      }

      if (check && getArgNode[0].check !== undefined) {
        getArgNode[0].check = undefined;
        statusChange = true;
      } else if (!check && getArgNode[0].check === undefined) {
        getArgNode[0].check = 'error';
        statusChange = true;
      }
    }
    // 有先選欄位才判斷是不是全都有選
    else if (getArgNode[0].check === 'error') {
      getArgNode[0].check = undefined;
      statusChange = true;
    }

    if (statusChange) {
      setNodeChange(getArgNode[0]);
    } else {
      setSelectFinish(false);

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

  const initSet = () => {
    if (nodeData && data) {
      const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const setNewArg = nodeFilter[0] && nodeFilter[0].args;

      setDataflowId(setNewArg && setNewArg.dataflowId);

      if (setNewArg && setNewArg.dataflowId) {
        getTargetList(setNewArg.dataflowId);
        form.setFieldsValue({ logicalOperator: setNewArg.logicalOperator });

        if (setNewArg.powerBiCondition) {
          form.setFieldsValue({
            payload: setNewArg.powerBiCondition.map(e => ({
              target: e.target,
              aggregate: e.aggregate,
              operation: e.operation,
              columnName: e.columnName,
              value: e.value,
            })),
          });
        } else {
          form.setFieldsValue({ payload: [] });
        }
      } else {
        form.setFieldsValue({
          logicalOperator: null,
          payload: [],
        });
      }
    }
  };

  useEffect(() => {
    initSet();
  }, []);

  useEffect(() => {
    if (nodeData.id !== undefined && nodeData.id !== null) {
      initSet();
    }
  }, [nodeData]);

  const getColumnType = (targetId, colName) => {
    if (targetId && colName) {
      const getCols = targetList.filter(e => e.id === targetId)[0].columns;
      return getCols.filter(c => c.name === colName)[0].type;
    }
    return undefined;
  };
  const handleValueChange = (changedValues, allValues) => {
    const thisNode = data.nodes.filter(e => e.id === nodeData.id)[0];
    if (thisNode) {
      switch (Object.keys(changedValues)[0]) {
        case 'logicalOperator':
          thisNode.args.logicalOperator = allValues.logicalOperator;
          handleSetDataArg(thisNode.args);
          break;
        case 'payload':
          const index = changedValues.payload.length - 1;
          const changeKey =
            changedValues.payload[index] &&
            Object.keys(changedValues.payload[index])[0];
          const newCondition = allValues.payload;
          if (
            changeKey === 'target' &&
            Object.keys(changedValues.payload[index]).length === 1
          ) {
            newCondition[index].aggregate = undefined;
            newCondition[index].columnName = undefined;
            newCondition[index].operation = undefined;
            newCondition[index].value = undefined;
            form.setFieldsValue({ payload: newCondition });
          } else if (changeKey === 'columnName') {
            if (newCondition[index].operation || newCondition[index].value) {
              newCondition[index].operation = undefined;
              newCondition[index].value = undefined;
              form.setFieldsValue({ payload: newCondition });
            }
          }

          thisNode.args.powerBiCondition = newCondition.map(e => ({
            target: e.target,
            aggregate: e.aggregate,
            operation: e.operation,
            columnType: getColumnType(e.target, e.columnName),
            columnName: e.columnName,
            value: e.value,
          }));
          thisNode.args.powerBiCondition = newCondition;
          handleSetDataArg(thisNode.args);
          break;
        default:
          break;
      }
    }
  };

  return (
    <Style.PowerBiScroll className="node-wrapper">
      <Spin spinning={loading}>
        {data && targetList && targetList.length > 0 ? (
          <Form
            data-test="formValueChange"
            form={form}
            className="formListBlock"
            name="wherepayload"
            scrollToFirstError
            initialValues={{
              payload: [{}], // 預設帶一筆
            }}
            onValuesChange={handleValueChange}
          >
            <div style={{ padding: '10px 10px 0 15px' }}>
              Poser Bi Condition
            </div>
            <div style={{ padding: '10px 10px 0 15px' }}>
              Identifies which block of actions to execute bassed on the
              evaluation of condition input
            </div>
            <Form.Item name="logicalOperator">
              <Radio.Group disabled={!nodeData.edit}>
                <Radio value="and" style={radioStyle}>
                  AND
                </Radio>
                <Radio value="or" style={radioStyle}>
                  OR
                </Radio>
              </Radio.Group>
            </Form.Item>
            <Form.List name="payload">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, fIdx) => (
                    <div className="blockDashed">
                      <Space
                        size={0}
                        key={field.key}
                        align="center"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'revert',
                          width: '70vh',
                        }}
                      >
                        <Style.Sub2TableBlock>
                          <Form.Item
                            {...field}
                            name={[field.name, 'target']}
                            fieldKey={[field.fieldKey, 'target']}
                            rules={[
                              {
                                required: true,
                                message: 'Select a Target',
                              },
                            ]}
                            style={{
                              display: 'inline-block',
                              width: 'calc(50% - 8px)',
                            }}
                          >
                            <Select
                              placeholder="Select a Target"
                              data-test="selectTarget"
                              disabled={!nodeData.edit}
                            >
                              {targetList.map(t => (
                                <Select.Option
                                  key={t.id}
                                  value={t.id}
                                  title={t.name}
                                >
                                  {t.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                          <Form.Item
                            {...field}
                            name={[field.name, 'aggregate']}
                            fieldKey={[field.fieldKey, 'aggregate']}
                            rules={[
                              {
                                required: true,
                                message: 'Select a Aggregate',
                              },
                            ]}
                            style={{
                              display: 'inline-block',
                              width: 'calc(50% - 8px)',
                              margin: '0 8px',
                            }}
                          >
                            <Select
                              placeholder="Select a Aggregate"
                              disabled={!nodeData.edit}
                            >
                              {AGGREGATE.map(a => (
                                <Select.Option
                                  key={a.key}
                                  value={a.value}
                                  title={a.value}
                                >
                                  {a.value}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                          {nodeData.edit && (
                            // form.getFieldValue('payload').length > 1 && (
                            <Form.Item className="delbutton">
                              <MinusCircleOutlined
                                data-test="delbutton"
                                onClick={() => {
                                  remove(field.name);
                                }}
                              />
                            </Form.Item>
                          )}
                        </Style.Sub2TableBlock>

                        <Style.Sub2TableBlock>
                          <Form.Item
                            {...field}
                            name={[field.name, 'columnName']}
                            fieldKey={[field.fieldKey, 'columnName']}
                            rules={[
                              {
                                required: true,
                                message: 'Required',
                              },
                            ]}
                            style={{
                              display: 'inline-block',
                              width: 'calc(50% - 8px)',
                              margin: '0 8px',
                            }}
                          >
                            <Select
                              placeholder="Select a column"
                              disabled={!nodeData.edit}
                              data-test="selectColumn"
                            >
                              {(
                                targetList.find(
                                  t =>
                                    t.id ===
                                    form.getFieldValue([
                                      'payload',
                                      field.name,
                                      'target',
                                    ]),
                                ) || { columns: [] }
                              ).columns.map(
                                c =>
                                  MAP_ALLOWTYPE.includes(c.type) && (
                                    <Select.Option
                                      key={c.name}
                                      value={c.name}
                                      title={c.name}
                                      type={c.type}
                                    >
                                      {c.name}
                                    </Select.Option>
                                  ),
                              )}
                            </Select>
                          </Form.Item>
                          <Form.Item
                            {...field}
                            name={[field.name, 'operation']}
                            fieldKey={[field.fieldKey, 'operation']}
                            rules={[
                              {
                                required: true,
                                message: 'Required',
                              },
                            ]}
                          >
                            <Select
                              placeholder="Select a comparison operator"
                              disabled={!nodeData.edit}
                              data-test="selectOperator"
                            >
                              {COMPARISON_OPERATOR_MAP.map(e => (
                                <Select.Option key={e.key} value={e.name}>
                                  {e.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                          <Form.Item
                            {...field}
                            // className={`flex-1 idx-${fIdx}-len-${fields.length}`}
                            name={[field.name, 'value']}
                            fieldKey={[field.fieldKey, 'value']}
                            rules={[
                              {
                                required: true,
                                message: 'This field is required',
                              },
                            ]}
                          >
                            <Input
                              placeholder="Input comparison value"
                              disabled={!nodeData.edit || loading}
                            />
                          </Form.Item>
                        </Style.Sub2TableBlock>
                      </Space>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    data-test="addBtn"
                    style={{ width: '70.5vh', margin: '0 0 0 15px' }}
                    onClick={() => {
                      add();
                    }}
                    block
                    icon={<PlusOutlined />}
                    disabled={!nodeData.edit || targetList.length === 0}
                  >
                    Add Condition
                  </Button>
                </>
              )}
            </Form.List>
          </Form>
        ) : (
          <Result
            style={{ flex: 1, paddingTop: 80 }}
            icon={<InfoCircleOutlined />}
            title="No Data"
            subTitle={!dataflowId ? 'Please select a data flow' : errorMsg}
          />
        )}
      </Spin>
    </Style.PowerBiScroll>
  );
};

export default Sub2PowerBiPoperties;
