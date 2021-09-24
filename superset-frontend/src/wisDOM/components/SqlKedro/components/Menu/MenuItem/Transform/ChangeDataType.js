/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Form, Button, Spin, Select, Tooltip, Input } from 'antd';
import { MinusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { DATAFLOW_TYPE, FUNCTIONS, INPUT_RULES } from '~~constants/index';
import { TableApi } from '~~apis/';
import * as Style from './style';
import './style.less';

// const dateType = ['timestamp', 'date'];

const typeList = {
  stringList: [
    {
      key: 'int',
      value: 'int',
    },
    {
      key: 'float',
      value: 'float',
    },
    {
      key: 'double',
      value: 'double',
    },
    {
      key: 'timestamp',
      value: 'timestamp',
    },
    {
      key: 'date',
      value: 'date',
    },
    {
      key: 'boolean',
      value: 'boolean',
    },
  ],
  intList: [
    {
      key: 'string',
      value: 'string',
    },
    {
      key: 'float',
      value: 'float',
    },
    {
      key: 'double',
      value: 'double',
    },
  ],
  floatList: [
    {
      key: 'string',
      value: 'string',
    },
  ],
  doubleList: [
    {
      key: 'string',
      value: 'string',
    },
  ],
  booleanList: [
    {
      key: 'string',
      value: 'string',
    },
  ],
  dateList: [
    {
      key: 'string',
      value: 'string',
    },
    {
      key: 'timestamp',
      value: 'timestamp',
    },
  ],
  timestampList: [
    {
      key: 'string',
      value: 'string',
    },
    {
      key: 'date',
      value: 'date',
    },
  ],
};

const ChangeDataType = ({
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
  // const [alert, setAlert] = useState(false);

  const turnToBackendChangeFormat = payload => {
    const tempFilters = [];

    payload.forEach(item => {
      const obj = {
        formatType: item.formatType,
        columnName: item.columnName,
        value: item.value,
        columnType: item.columnType,
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
      let checkChangeFormat = true;
      if (setNewArg.length !== 0) {
        setNewArg.changeDataType = turnToBackendChangeFormat(payload);
        if (setNewArg.changeDataType && setNewArg.changeDataType.length > 0) {
          setNewArg.changeDataType.forEach(e => {
            if (
              e.formatType === 'timestamp' ||
              e.formatType === 'date' ||
              e.formatType === 'boolean'
            ) {
              if (!(e.formatType && e.columnName && e.value)) {
                checkChangeFormat = false;
              }
            } else if (!(e.formatType && e.columnName)) {
              checkChangeFormat = false;
            }
          });
        } else {
          checkChangeFormat = false;
        }
      } else {
        checkChangeFormat = false;
      }

      let change = false;
      const thisNode = getArgNode[0];

      //   if (thisNode) {
      //     if (thisNode && !checkChangeFormat && thisNode.check !== 'error') {
      //       thisNode.check = 'error';
      //       change = true;
      //     } else if (thisNode && checkChangeFormat ) {
      //       if (thisNode.check !== undefined) {
      //         thisNode.check = undefined;
      //         //   setNodeChange(thisNode);
      //         change = true;
      //       }
      //     }
      //   }

      if (checkChangeFormat && thisNode.check !== undefined) {
        thisNode.check = undefined;
        change = true;
      } else if (!checkChangeFormat && thisNode.check === undefined) {
        thisNode.check = 'error';
        change = true;
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
        if (changedValue.columnName) {
          newPayload[idx].formatType = undefined;
          newPayload[idx].value = undefined;
        }
        const orginColumnType = tables.find(
          item => item.name === changedValue.columnName,
        );
        if (orginColumnType) {
          newPayload[idx].columnType = orginColumnType.type;
        }

        form.setFieldsValue({
          payload: newPayload,
        });
        setTempPayload(newPayload);
        // handleSave(newPayload);
        if (
          Object.keys(changedValue)[0] === 'formatType' ||
          Object.keys(changedValue)[0] === 'columnName'
        ) {
          handleSave(newPayload);
        }
      } else {
        setTempPayload(allValues.payload);
        // handleSave(allValues.payload);
      }
    });
  };

  const renderColumn = () => {
    // const type = form.getFieldValue('payload')[idx];

    const listPayLoad = tempPayload.filter(f => f !== undefined);

    const compareList = listPayLoad

      .map(item => item.columnName)
      .filter(i => i !== undefined);

    let listFilter = [];
    if (compareList.length > 0) {
      tables.forEach(item => {
        if (!compareList.includes(item.name)) {
          listFilter.push(item);
        }
      });
    } else {
      listFilter = tables;
    }

    return listFilter.map(field => (
      <Select.Option key={field.name} value={field.name}>
        {`${field.name}(${field.type})`}
      </Select.Option>
    ));
  };

  useEffect(() => {
    if (nodeParents !== undefined) {
      if (data !== undefined) {
        const temp = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
        if (temp[0] && temp[0].args) {
          setTempPayload(temp[0].args.changeDataType || [{}]);
          form.setFieldsValue({
            payload: temp[0].args.changeDataType || [{}],
          });
        }
        getTableColumns();
      }
    }
  }, []);

  const renderType = idx => {
    const rowData = form.getFieldValue('payload')[idx];

    if (rowData && rowData.columnName) {
      const findData = tables.find(item => item.name === rowData.columnName);

      if (findData && findData.type) {
        switch (findData.type) {
          case 'string':
            return (
              findData.type &&
              typeList.stringList.map(item => (
                <Select.Option key={item.key} value={item.value}>
                  {item.value}
                </Select.Option>
              ))
            );
          case 'int':
            return (
              findData.type &&
              typeList.intList.map(item => (
                <Select.Option key={item.key} value={item.value}>
                  {item.value}
                </Select.Option>
              ))
            );
          case 'float':
            return (
              findData.type &&
              typeList.floatList.map(item => (
                <Select.Option key={item.key} value={item.value}>
                  {item.value}
                </Select.Option>
              ))
            );
          case 'double':
            return (
              findData.type &&
              typeList.doubleList.map(item => (
                <Select.Option key={item.key} value={item.value}>
                  {item.value}
                </Select.Option>
              ))
            );
          case 'boolean':
            return (
              findData.type &&
              typeList.booleanList.map(item => (
                <Select.Option key={item.key} value={item.value}>
                  {item.value}
                </Select.Option>
              ))
            );

          case 'date':
            return (
              findData.type &&
              typeList.dateList.map(item => (
                <Select.Option key={item.key} value={item.value}>
                  {item.value}
                </Select.Option>
              ))
            );
          case 'timestamp':
            return (
              findData.type &&
              typeList.timestampList.map(item => (
                <Select.Option key={item.key} value={item.value}>
                  {item.value}
                </Select.Option>
              ))
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
    }

    return (
      <Select style={{ width: 150 }} placeholder="Select a Format" disabled />
    );
  };

  const renderComparisonValue = idx => {
    const rowData = form.getFieldValue('payload')[idx];

    if (
      rowData?.formatType &&
      (rowData.formatType === 'timestamp' ||
        rowData.formatType === 'date' ||
        rowData.formatType === 'boolean')
    ) {
      return (
        <Input
          style={{ width: '100%' }}
          placeholder="Text the type format"
          disabled={!nodeData.edit}
          maxLength={INPUT_RULES.MATH_VALUE.value}
          onBlur={changeInput}
        />
      );
    }
    return <div style={{ width: 150 }} />;
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
      if (
        temp[temp.length - 1].formatType === 'timestamp' ||
        temp[temp.length - 1].formatType === 'date' ||
        temp[temp.length - 1].formatType === 'boolean'
      ) {
        return !(
          temp[temp.length - 1].formatType &&
          temp[temp.length - 1].columnName &&
          temp[temp.length - 1].value
        );
      }
      return !(
        temp[temp.length - 1].formatType && temp[temp.length - 1].columnName
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
          Change the data type of column
        </div>
        <Spin spinning={schemaLoading || loading}>
          <Form.List name="payload">
            {(fields, { add, remove }) => (
              <>
                {/* {alert ? (
                  <div style={{ color: 'red', marginLeft: '15px' }}>
                    Columns have no data type, please change another data type
                  </div>
                ) : null} */}
                <div
                  style={{
                    margin: '10px 10px 10px 15px',
                    display: 'flex',
                  }}
                >
                  <div
                    style={{
                      width: '35%',
                      marginLeft: '10px',
                    }}
                  >
                    Source column
                  </div>
                  <div
                    style={{
                      width: '30%',
                      marginLeft: '10px',
                    }}
                  >
                    Change type to
                  </div>
                  <div
                    style={{
                      width: '35%',
                      marginLeft: '10px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        marginRight: '10px',
                      }}
                    >
                      Specify source column format
                    </span>
                    <Tooltip
                      placement="bottomRight"
                      title="A string column format can be specified when it is converted to a timestamp, date or booleancolumn. For example, yyyy-MM-ddThh:mm:ss.sssssZ(timestamp) or 1/0 (boolean). The resulting column is in the format yyyy-MM-dd hh:mm:ss(timestamp), yyyy-MM-dd (date), or True/False (boolean)."
                    >
                      <InfoCircleOutlined />
                    </Tooltip>
                  </div>
                </div>
                {fields.map((field, idx) => (
                  <Style.BlockDashed key={field.key}>
                    {/* <div className="tableBlock"> */}
                    {/* <Space
                      size="small"
                      key={field.key}
                      className="whereRow"
                      align="center"
                    > */}
                    <Form.Item
                      {...field}
                      name={[field.name, 'columnName']}
                      fieldKey={[field.fieldKey, 'columnName']}
                      style={{ padding: 10, width: '35%' }}
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
                        // onBlur={changeInput}
                      >
                        {renderColumn(idx)}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'formatType']}
                      fieldKey={[field.fieldKey, 'formatType']}
                      style={{ padding: 10, width: '30%' }}
                      rules={[
                        {
                          required: true,
                          message: 'Required',
                        },
                      ]}
                    >
                      <Select
                        style={{ width: 150 }}
                        placeholder="Select a Type"
                        disabled={!nodeData.edit}
                        // onBlur={changeInput}
                      >
                        {renderType(idx)}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'value']}
                      fieldKey={[field.fieldKey, 'value']}
                      style={{ padding: 10, width: '30%' }}
                      rules={[
                        {
                          required: true,
                          message: 'This field is required',
                        },
                      ]}
                    >
                      {renderComparisonValue(idx)}
                    </Form.Item>
                    {nodeData.edit && form.getFieldValue('payload').length > 1 && (
                      <Form.Item className="delbutton" style={{ padding: 10 }}>
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
                    {/* </Space> */}
                    {/* </div> */}
                  </Style.BlockDashed>
                ))}
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
              </>
            )}
          </Form.List>
        </Spin>
      </Form>
    </Style.InsertScroll>
  );
};

export default ChangeDataType;
