/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Spin, Button, Form, Space, Select, Input } from 'antd';
import moment from 'moment';
import { DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import {
  DATAFLOW_TYPE,
  checkErrorInput,
  GROUPBY_TYPE,
  FUNCTIONS,
} from '~~constants/index';
import { TableApi } from '~~apis/';
import '../Menu.less';
import * as Style from './style';

const { Option } = Select;

const GroupBy = ({
  nodeParents,
  nodeData,
  data,
  setData,
  setSelectFinish,
  setFocusNode,
  schemaLoading,
  setNodeChange,
}) => {
  const [form] = Form.useForm();
  const [payload, setPayload] = useState([{}]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const getTableColumns = async () => {
    try {
      setLoading(true);
      if (nodeParents[0].type === DATAFLOW_TYPE.DATASET.value) {
        const result1 = await TableApi.getAllowedTableColumns(
          nodeParents[0].args.table_name,
        );
        setTables(result1.table.columns);
      } else {
        const index = data.nodes.findIndex(e => e.id === nodeParents[0].key);
        const thisNode = data.nodes[index];
        const leftCol = thisNode.schema;
        setTables(leftCol);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const changeInput = e => {
    setInputValue(e.target.value);
  };

  const handleSave = payload => {
    if (nodeData.id !== undefined) {
      //   const nodeFilter = data.nodes.filter(e => e.id !== nodeData.id);
      const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const setNewArg =
        getArgNode && getArgNode.length > 0 ? getArgNode[0].args : '';
      if (setNewArg.length !== 0) {
        setNewArg.groupByField = payload;
      }

      let checkField = false;
      let checkStatus = false;
      const thisNode = getArgNode[0];
      if (payload && thisNode) {
        payload.forEach(e => {
          if (e.aggregate && e.column && e.newColumn) {
            checkField = true;
          } else {
            checkField = false;
          }
        });

        if (!checkField && thisNode.check === undefined) {
          thisNode.check = 'error';
          checkStatus = true;
        } else if (checkField && thisNode.check === 'error') {
          thisNode.check = undefined;
          checkStatus = true;
        }
      }

      if (checkStatus) {
        setNodeChange(thisNode);
      } else {
        setSelectFinish(false);
        const index = data.nodes.findIndex(e => e.id === nodeData.id);
        const newData = FUNCTIONS.SET_DATA(
          data,
          nodeData,
          index,
          nodeData.id,
          thisNode,
          setNewArg,
          data.edges,
        );

        setData(newData);
        // setData({
        //   edges: [...data.edges],
        //   nodes: [
        //     ...nodeFilter,
        //     {
        //       full_name: nodeData.name,
        //       name: FUNCTIONS.NODE_NAME(nodeData.name),
        //       id: nodeData.id,
        //       type: nodeData.type,
        //       args: setNewArg,
        //       check: thisNode.check,
        //     },
        //   ],
        // });
        setFocusNode({
          full_name: nodeData.name,
          name: FUNCTIONS.NODE_NAME(nodeData.name),
          id: nodeData.id,
          type: nodeData.type,
        });
      }
    }
  };

  const handleValueChange = (changedValues, allValues) => {
    (changedValues.payload || []).forEach((changedValue, idx) => {
      let tempPayload = allValues.payload;

      if (Object.keys(changedValue).length === 1) {
        // 判斷是否為 add()
        const changedValueKey = Object.keys(changedValue)[0];

        switch (changedValueKey) {
          case 'column':
            // tempPayload[idx].newColumn =
            //   changedValue.column || tempPayload[idx].column;
            tempPayload[idx].newColumn = '';
            tempPayload[idx].aggregate = '';
            setPayload(tempPayload);
            handleSave(tempPayload);
            break;
          case 'aggregate':
            if (changedValue.aggregate !== 'groupby') {
              tempPayload[idx].newColumn = `${tempPayload[idx].column}_${
                changedValue.aggregate || tempPayload[idx].aggregate
              }`;
            } else {
              tempPayload[idx].newColumn = tempPayload[idx].column;
            }
            // sort Aggregate
            const notGroupByRows = tempPayload.filter(
              row => row.aggregate !== 'groupby',
            );
            const groupByRows = tempPayload.filter(
              row => row.aggregate === 'groupby',
            );

            const compare = (a, b) => {
              if (a.aggregate < b.aggregate) {
                return -1;
              }
              if (a.aggregate > b.aggregate) {
                return 1;
              }
              return 0;
            };
            notGroupByRows.sort(compare);

            tempPayload = [...groupByRows, ...notGroupByRows];

            // 動態更新
            form.setFieldsValue({
              payload: tempPayload,
            });
            setPayload(tempPayload);
            handleSave(tempPayload);
            break;
          case 'newColumn':
            tempPayload[idx].newColumn = changedValue.newColumn;
            setPayload(tempPayload);
            handleSave(tempPayload);
            break;
          default:
            setPayload(tempPayload);
            handleSave(tempPayload);
            break;
        }
      }
    });
  };

  const onBlurInput = () => {
    handleSave(payload);
  };

  const filterColumn = fieldName => {
    const usedColumns = form
      .getFieldValue('payload')
      .filter(
        row =>
          row &&
          row.aggregate ===
            form.getFieldValue(['payload', fieldName, 'aggregate']),
      )
      .map(row => row.column);

    const newGroupByType = tables.filter(i => !usedColumns.includes(i.name));

    return newGroupByType.map(e => <Option value={e.name}>{e.name}</Option>);
  };

  const filterAggregate = fieldName => {
    const usedAggregates = form
      .getFieldValue('payload')
      .filter(
        row =>
          row &&
          row.column === form.getFieldValue(['payload', fieldName, 'column']),
      )
      .map(row => row.aggregate);

    const newGroupByType = GROUPBY_TYPE.getList().filter(
      i => !usedAggregates.includes(i.key),
    );

    return newGroupByType.map(e => <Option value={e.key}>{e.value}</Option>);
  };

  const removeItem = idx => {
    const temp = form
      .getFieldValue('payload')
      .filter((item, index) => index !== idx);

    handleSave(temp);
  };

  useEffect(() => {
    if (nodeParents !== undefined) {
      if (data !== undefined) {
        const temp = data.nodes.filter(node => node.id === nodeData.id);
        if (temp[0] && temp[0].args) {
          setPayload(temp[0].args.groupByField || [{}]);
          form.setFieldsValue({
            payload: temp[0].args.groupByField || [{}],
          });
        }
        getTableColumns();
      }
    }
  }, []);

  return (
    <Style.InsertScroll>
      <Form
        data-test="formValueChange"
        form={form}
        // onFinish={handleSave}
        scrollToFirstError
        initialValues={{
          payload: [{}], // 預設帶一筆
        }}
        onValuesChange={handleValueChange}
      >
        <Spin spinning={loading || schemaLoading || tables.length === 0}>
          <div className="GroupBy" style={{ padding: '10px' }}>
            Add column with aggregation for your grouped table
          </div>

          <Form.List name="payload">
            {(fields, { add, remove }) => (
              <>
                <Button
                  style={{ width: 210, margin: '10px 0 15px 24px' }}
                  onClick={() => {
                    add();
                  }}
                  block
                  disabled={!nodeData.edit}
                >
                  Add column
                </Button>

                <div
                  style={{
                    margin: '14px 0 16px 0',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    paddingLeft: 10,
                  }}
                >
                  <div style={{ width: '35%', textAlign: 'center' }}>
                    Column
                  </div>
                  <div style={{ width: '25%', textAlign: 'center' }}>
                    Aggregate
                  </div>
                  <div style={{ width: '32%', textAlign: 'center' }}>
                    New column name
                  </div>
                  <div style={{ width: '8%' }} />
                </div>

                {fields.map((field, fIdx) => (
                  <Style.BlockContainer
                    key={field.key}
                    style={{
                      padding: '0 0 0 10px',
                      justifyContent: 'flex-start',
                      margin: '16px 0',
                    }}
                  >
                    <Form.Item
                      {...field}
                      style={{ width: '35%', padding: '0 6px' }}
                      name={[field.name, 'column']}
                      fieldKey={[field.fieldKey, 'column']}
                      rules={[
                        {
                          required: true,
                          message: 'Required',
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select a column"
                        disabled={!nodeData.edit}
                      >
                        {/* {tables.map(c => (
                          <Select.Option
                            key={c.name}
                            value={c.name}
                            title={c.name}
                          >
                            {`${c.name} (${c.type})`}
                          </Select.Option>
                        ))} */}
                        {filterColumn(field.name)}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...field}
                      style={{ width: '25%', padding: '0 6px' }}
                      name={[field.name, 'aggregate']}
                      fieldKey={[field.fieldKey, 'aggregate']}
                      rules={[
                        {
                          required: true,
                          message: 'Required',
                        },
                      ]}
                    >
                      <Select
                        disabled={
                          !nodeData.edit ||
                          form.getFieldValue([
                            'payload',
                            field.name,
                            'column',
                          ]) === undefined
                        }
                      >
                        {filterAggregate(field.name)}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...field}
                      style={{ width: '32%', padding: '0 6px' }}
                      name={[field.name, 'newColumn']}
                      fieldKey={[field.fieldKey, 'newColumn']}
                      rules={[
                        {
                          required: true,
                          message: 'Required',
                        },
                      ]}
                    >
                      <Input
                        data-test="groupByInput"
                        value={field.newName}
                        onChange={e => changeInput(e)}
                        onBlur={() => onBlurInput()}
                        disabled={
                          !nodeData.edit ||
                          form.getFieldValue([
                            'payload',
                            field.name,
                            'aggregate',
                          ]) === 'groupby' ||
                          !form.getFieldValue([
                            'payload',
                            field.name,
                            'aggregate',
                          ])
                        }
                      />
                    </Form.Item>

                    {nodeData.edit && form.getFieldValue('payload').length > 1 && (
                      <Form.Item style={{ width: '8%', padding: '0 6px' }}>
                        <DeleteOutlined
                          onClick={() => {
                            removeItem(fIdx);
                            remove(field.name);
                          }}
                        />
                      </Form.Item>
                    )}
                  </Style.BlockContainer>
                  // </Space>
                ))}
              </>
            )}
          </Form.List>
        </Spin>
      </Form>
    </Style.InsertScroll>
  );
};

export default GroupBy;
