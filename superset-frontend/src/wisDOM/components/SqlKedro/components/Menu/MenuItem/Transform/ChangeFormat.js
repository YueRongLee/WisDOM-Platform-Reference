/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Form, Button, Spin, Select, Space } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import { DATAFLOW_TYPE, FUNCTIONS } from '~~constants/index';
import { TableApi } from '~~apis/';
import * as Style from './style';
import './style.less';

const dataTypeList = [
  {
    key: 'timestamp',
    text: 'Date-time format',
  },
];

const dateType = ['timestamp', 'date'];

const dateList = [
  {
    key: 'yyyy-mm-dd',
    value: 'yyyy-MM-dd',
  },
  {
    key: 'yyyy/mm/dd',
    value: 'yyyy/MM/dd',
  },
  {
    key: 'yyyy-mm-dd HH:mm:ss',
    value: 'yyyy-MM-dd HH:mm:ss',
  },
  {
    key: 'yyyy/mm/dd HH:mm:ss',
    value: 'yyyy/MM/dd HH:mm:ss',
  },
  {
    key: 'yyyy-mm-dd HH:mm',
    value: 'yyyy-MM-dd HH:mm',
  },
  {
    key: 'yyyy/mm/dd HH:mm',
    value: 'yyyy/MM/dd HH:mm',
  },
];

const ChangeFormat = ({
  nodeParents,
  setSelectFinish,
  data,
  setData,
  nodeData,
  setFocusNode,
  schemaLoading,
  // setPayload,
  setNodeChange,
}) => {
  const [form] = Form.useForm();
  const [tempPayload, setTempPayload] = useState([{}]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(false);

  const turnToBackendChangeFormat = payload => {
    const tempFilters = [];

    payload.forEach(item => {
      const obj = {
        formatType: item.formatType,
        columnName: item.columnName,
        value: item.value,
        // columnType: item.columnType,
      };

      tempFilters.push(obj);
    });
    return tempFilters;
  };

  const handleSave = payload => {
    // setPayload(payload);
    if (nodeData.id !== undefined) {
      //   const nodeFilter = data.nodes.filter(e => e.id !== nodeData.id);
      const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const setNewArg =
        getArgNode && getArgNode.length > 0 ? getArgNode[0].args : '';
      let checkChangeFormat = false;
      if (setNewArg.length !== 0) {
        setNewArg.changeFormat = turnToBackendChangeFormat(payload);
        setNewArg.changeFormat.forEach(e => {
          if (e && e.formatType && e.columnName && e.value) {
            checkChangeFormat = true;
          } else {
            checkChangeFormat = false;
          }
        });
      }

      let change = false;
      const thisNode = getArgNode[0];
      if (thisNode) {
        if (thisNode && !checkChangeFormat && thisNode.check !== 'error') {
          thisNode.check = 'error';
          //   setNodeChange(thisNode);
          change = true;
        } else if (thisNode && checkChangeFormat) {
          if (thisNode.check !== undefined) {
            thisNode.check = undefined;
            //   setNodeChange(thisNode);
            change = true;
          }
        }
      }

      if (change && thisNode) {
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
        //       check: getArgNode[0] && getArgNode[0].check,
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

    // handleCheckStatus();
  };

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

  const changeInput = () => {
    handleSave(tempPayload);
  };

  const handleValueChange = (changedValues, allValues) => {
    (changedValues.payload || []).forEach((changedValue, idx) => {
      if (changedValue && Object.keys(changedValue).length === 1) {
        // const newPayload = addDataType(allValues.payload);
        const newPayload = allValues.payload;
        // 改選table清掉該行後面所有值
        if (changedValue.formatType) {
          newPayload[idx].columnName = undefined;
          newPayload[idx].value = undefined;
        }
        form.setFieldsValue({
          payload: newPayload,
        });
        setTempPayload(newPayload);
      } else {
        setTempPayload(allValues.payload);
      }
    });
  };

  const renderColumn = idx => {
    const type = form.getFieldValue('payload')[idx];

    if (type && type.formatType) {
      const list = tables.filter(item => {
        if (dateType.includes(item.type)) {
          return item.type === type.formatType || item.type === 'date';
        }
        return item.type === type.formatType;
      });

      const compareList = tempPayload
        .filter(f => {
          if (f) {
            return f.formatType === type.formatType;
          }
          return f;
        })
        .map(item => item.columnName)
        .filter(i => i !== undefined);
      const listFilter = list.filter(item => {
        if (compareList[0] && compareList.length > 0) {
          return !compareList.includes(item.name);
        }
        return item;
      });

      if (listFilter.length > 0) {
        setAlert(false);
        return listFilter.map(field => (
          <Select.Option key={field.name} value={field.name}>
            {field.name}
          </Select.Option>
        ));
      }
      if (form.getFieldValue('payload').length === compareList.length) {
        setAlert(false);
        return null;
      }

      setAlert(true);
      return null;
    }
    setAlert(false);
    return null;
  };

  useEffect(() => {
    if (nodeParents !== undefined) {
      if (data !== undefined) {
        const temp = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
        if (temp[0] && temp[0].args) {
          setTempPayload(temp[0].args.changeFormat || [{}]);
          form.setFieldsValue({
            payload: temp[0].args.changeFormat || [{}],
          });
        }
        getTableColumns();
      }
    }
  }, []);

  const renderComparisonValue = idx => {
    // 日期用datepicker其餘type為input
    const type = form.getFieldValue('payload')[idx];
    if (type) {
      switch (type.formatType) {
        case 'date':
        case 'timestamp':
          return (
            type && (
              <Select
                style={{ width: 150 }}
                placeholder="Select a Format"
                disabled={!nodeData.edit}
                onBlur={changeInput}
              >
                {dateList.map(date => (
                  <Select.Option key={date.key} value={date.value}>
                    {date.value}
                  </Select.Option>
                ))}
              </Select>
            )
          );
        default:
          return (
            <Select
              style={{ width: 150 }}
              placeholder="Select a Format"
              disabled
            />
          );
      }
    }
    return (
      <Select style={{ width: 150 }} placeholder="Select a Format" disabled />
    );
  };

  const removeItem = idx => {
    const temp = form
      .getFieldValue('payload')
      .filter((item, index) => index !== idx);

    handleSave(temp);
  };

  const disabledAdd = () => {
    const temp = form.getFieldValue('payload');
    if (temp[temp.length - 1]) {
      return !(
        temp[temp.length - 1].formatType &&
        temp[temp.length - 1].columnName &&
        temp[temp.length - 1].value
      );
    }
    return true;
  };

  return (
    <Style.InsertScroll>
      <Form
        form={form}
        data-test="wherepayload"
        className="formListBlock"
        name="wherepayload"
        // onFinish={handleSave}
        scrollToFirstError
        initialValues={{
          payload: [{}], // 預設帶一筆
        }}
        onValuesChange={handleValueChange}
      >
        <div style={{ padding: '10px 15px' }}>
          Change the value format in the selected column
        </div>
        <Spin spinning={schemaLoading || loading}>
          <Form.List name="payload">
            {(fields, { add, remove }) => (
              <>
                <Button
                  data-test="add"
                  style={{ width: 210, margin: '0 0 15px 24px' }}
                  onClick={() => {
                    add();
                  }}
                  block
                  disabled={!nodeData.edit || disabledAdd()}
                >
                  Add
                </Button>
                {alert ? (
                  <div style={{ color: 'red', marginLeft: '15px' }}>
                    Columns have no data type, please change another data type
                  </div>
                ) : null}
                <div
                  style={{
                    margin: '10px 10px 10px 15px',
                    display: 'flex',
                  }}
                >
                  <div
                    style={{
                      minWidth: '150px',
                      marginRight: '30px',
                      marginLeft: '10px',
                    }}
                  >
                    Format colum to
                  </div>
                  <div
                    style={{
                      minWidth: '150px',
                      marginRight: '30px',
                      marginLeft: '10px',
                    }}
                  >
                    Source column
                  </div>
                  <div
                    style={{
                      minWidth: '150px',
                      marginRight: '30px',
                      marginLeft: '10px',
                    }}
                  >
                    Date-time format
                  </div>
                  <div style={{ width: '30px' }} />
                </div>
                {fields.map((field, idx) => (
                  <div className="blockDashed">
                    <div className="tableBlock">
                      <Space
                        size="small"
                        key={field.key}
                        className="whereRow"
                        align="center"
                      >
                        <Form.Item
                          {...field}
                          name={[field.name, 'formatType']}
                          fieldKey={[field.fieldKey, 'formatType']}
                          // style={{ width: '30%', padding: 0 }}
                          rules={[
                            {
                              required: true,
                              message: 'Required',
                            },
                          ]}
                        >
                          <Select
                            data-test="formatType"
                            style={{ width: 150 }}
                            placeholder="Select a format"
                            disabled={!nodeData.edit}
                            onBlur={changeInput}
                          >
                            {dataTypeList.map(c => (
                              <Select.Option
                                key={c.key}
                                value={c.key}
                                title={c.key}
                              >
                                {c.text}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'columnName']}
                          fieldKey={[field.fieldKey, 'columnName']}
                          // style={{ width: '30%', padding: 0 }}
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
                            disabled={!nodeData.edit}
                            onBlur={changeInput}
                          >
                            {renderColumn(idx)}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'value']}
                          fieldKey={[field.fieldKey, 'value']}
                          // style={{ width: '30%', padding: 0 }}
                          rules={[
                            {
                              required: true,
                              message: 'This field is required',
                            },
                          ]}
                        >
                          {renderComparisonValue(idx)}
                        </Form.Item>
                        {nodeData.edit &&
                          form.getFieldValue('payload').length > 1 && (
                            <Form.Item className="delbutton">
                              <MinusCircleOutlined
                                date-test="delbutton"
                                onClick={() => {
                                  removeItem(idx);
                                  remove(field.name);
                                }}
                              />
                            </Form.Item>
                          )}
                        {/* </div> */}
                      </Space>
                    </div>
                  </div>
                ))}
              </>
            )}
          </Form.List>
        </Spin>
      </Form>
    </Style.InsertScroll>
  );
};

export default ChangeFormat;
