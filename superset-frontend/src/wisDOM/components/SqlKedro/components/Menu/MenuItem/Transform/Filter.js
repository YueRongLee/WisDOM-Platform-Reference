/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import {
  Radio,
  Form,
  Input,
  Button,
  Spin,
  DatePicker,
  Select,
  Space,
} from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { DATAFLOW_TYPE, FUNCTIONS } from '~~constants/index';
import { TableApi } from '~~apis/';
import * as Style from './style';
import './style.less';

const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};

// const numberType = [
//   'TINYINT',
//   'SMALLINT',
//   'INT',
//   'INTEGER',
//   'BIGINT',
//   'FLOAT',
//   'DOUBLE',
//   'DOUBLE PRECISION ',
//   'DECIMAL',
//   'Introduced',
//   'Hive',
//   'NUMERIC',
// ];

const dataType = ['timestamp', 'date'];

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
    disabledType: ['string', ...dataType],
  },
  {
    key: 'LESS_THAN_OR_EQUAL',
    name: '<=',
    disabledType: ['string', ...dataType],
  },
  {
    key: 'EQUAL',
    name: '==',
    disabledType: [...dataType],
  },
  {
    key: 'NOT_EQUAL',
    name: '!=',
    disabledType: [...dataType],
  },
];

const Filter = ({
  nodeParents,
  setSelectFinish,
  data,
  setData,
  nodeData,
  setFocusNode,
  schemaLoading,
  setNodeChange,
}) => {
  const [form] = Form.useForm();
  const [logicalOperator, setLogicalOperator] = useState('');
  const [tempPayload, setTempPayload] = useState([{}]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  const isDateType = type => ['date', 'timestamp'].includes(type);

  const turnToBackendFormat = payload => {
    const tempFilters = [];

    payload.forEach(item => {
      const obj = {
        columnName: item.columnName,
        operation: item.operation,
        value: item.value,
        columnType: item.columnType,
      };

      tempFilters.push(obj);
    });
    return tempFilters;
  };

  const handleSave = (payload, operator) => {
    if (nodeData.id !== undefined) {
      //   const nodeFilter = data.nodes.filter(e => e.id !== nodeData.id);
      const thisNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id)[0];
      const setNewArg = thisNode !== undefined ? thisNode.args : '';
      let changeCheck = false;
      if (setNewArg.length !== 0) {
        setNewArg.logicalOperator = operator;
        setNewArg.filter = turnToBackendFormat(payload);
        // setNewArg.filters = payload;

        let checkFilter = false;
        setNewArg.filter.forEach(e => {
          if (e && e.columnName && e.columnType && e.operation && e.value) {
            checkFilter = true;
          } else {
            checkFilter = false;
          }
        });

        if (!checkFilter && thisNode.check === undefined) {
          thisNode.check = 'error';
          changeCheck = true;
        } else if (
          checkFilter &&
          thisNode.schema !== null &&
          thisNode.check === 'error'
        ) {
          thisNode.check = undefined;
          changeCheck = true;
        }
      }

      if (changeCheck === true) {
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

  const getTableColumns = async () => {
    try {
      // Left
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
    handleSave(tempPayload, logicalOperator);
  };

  const addDataType = payload => {
    const newPayload = payload.map(item => {
      const findIdx = tables.findIndex(table => table.name === item.columnName);
      if (findIdx > -1) {
        return {
          ...item,
          columnType: tables[findIdx].type,
        };
      }
      return item;
    });
    return newPayload;
  };

  const handleValueChange = (changedValues, allValues) => {
    if (Object.keys(changedValues)[0] === 'logicalOperator') {
      setLogicalOperator(allValues.logicalOperator);
      handleSave(addDataType(allValues.payload), allValues.logicalOperator);
    }
    (changedValues.payload || []).forEach((changedValue, idx) => {
      if (changedValue && Object.keys(changedValue).length === 1) {
        const newPayload = addDataType(allValues.payload);
        if (changedValue.columnName) {
          newPayload[idx].value = undefined;
          newPayload[idx].operation = undefined;
        }
        form.setFieldsValue({
          payload: newPayload,
        });
        setTempPayload(newPayload);
      } else {
        setTempPayload(addDataType(allValues.payload));
      }
    });
  };

  const getColumnTypeByGuid = name => {
    if (tables.length > 0) {
      const columnType = name
        ? tables.find(c => c.name === name).type
        : undefined;
      return columnType;
    }
    return undefined;
  };

  const getColumnTypeByFieldName = name => {
    const row = form.getFieldValue(['payload', name]);
    const columnType = row ? getColumnTypeByGuid(row.columnName) : undefined;
    return columnType;
  };

  const renderComparisonOperator = field => {
    const columnType = getColumnTypeByFieldName(field.name);
    return (
      columnType &&
      COMPARISON_OPERATOR_MAP.filter(
        o => !o.disabledType.includes(columnType),
      ).map(o => (
        <Select.Option key={o.key} value={o.name}>
          {o.name}
        </Select.Option>
      ))
    );
  };

  const removeItem = idx => {
    const temp = form
      .getFieldValue('payload')
      .filter((item, index) => index !== idx);

    handleSave(temp, logicalOperator);
  };

  useEffect(() => {
    if (nodeParents !== undefined) {
      if (data !== undefined) {
        const temp = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
        if (temp[0] && temp[0].args) {
          setLogicalOperator(temp[0].args.logicalOperator || '');

          setTempPayload(temp[0].args.filter || [{}]);

          temp[0].args.filter.forEach(e => {
            if (isDateType(e.columnType)) {
              e.value = moment(e.value || null);
            }
          });

          form.setFieldsValue({
            logicalOperator: temp[0].args.logicalOperator || '',
            dataflowId: temp[0].args.dataflowId || '',
            payload: temp[0].args.filter || [{}],
          });
        }
        getTableColumns();
      }
    }
  }, []);

  const renderComparisonValue = field => {
    // 日期用datepicker其餘type為input
    const columnType = getColumnTypeByFieldName(field.name);
    return columnType && isDateType(columnType) ? (
      <DatePicker
        showTime={{ format: 'HH:mm' }}
        format="YYYY-MM-DD HH:mm"
        style={{ width: 120 }}
        disabled={!nodeData.edit}
        onBlur={changeInput}
      />
    ) : (
      <Input
        placeholder="Input comparison value"
        disabled={!nodeData.edit}
        style={{ width: 120 }}
        onBlur={changeInput}
      /> // 長度不限
    );
  };

  const renderColumn = () =>
    // const temp = form
    //   .getFieldValue('payload')
    //   .map(item => (item ? item.columnName : null));
    tables
      // .filter(f => {
      //   if (temp[0]) {
      //     return !temp.includes(f.name);
      //   }

      //   return f;
      // })
      .map(c => (
        <Select.Option key={c.name} value={c.name} title={c.name}>
          {`${c.name} (${c.type})`}
        </Select.Option>
      ));
  const disabledAdd = () => {
    const temp = form.getFieldValue('payload');
    if (temp[temp.length - 1]) {
      return (
        !(
          temp[temp.length - 1].columnName &&
          temp[temp.length - 1].operation &&
          temp[temp.length - 1].value
        ) || tables.length === temp.length
      );
    }
    return true;
  };

  return (
    <Style.InsertScroll>
      <Form
        form={form}
        className="formListBlock"
        name="wherepayload"
        // onFinish={handleSave}
        scrollToFirstError
        initialValues={{
          payload: [{}], // 預設帶一筆
        }}
        onValuesChange={handleValueChange}
      >
        {/* <div style={{ padding: '10px 10px 0 15px' }}>Filter</div> */}
        <div style={{ color: '#00000099', padding: '10px 10px 0 15px' }}>
          Retain rows by conditions
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
        <Spin spinning={schemaLoading || loading}>
          <Form.List name="payload">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, fIdx) => (
                  <div className="blockDashed">
                    <div className="tableBlock">
                      <Space
                        size={0}
                        key={field.key}
                        className="whereRow"
                        align="center"
                      >
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
                        >
                          <Select
                            style={{ width: 200 }}
                            placeholder="Select a column"
                            disabled={!nodeData.edit}
                            onBlur={changeInput}
                          >
                            {renderColumn()}
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
                            style={{ width: 70 }}
                            placeholder="Select a comparison operator"
                            disabled={!nodeData.edit}
                            onBlur={changeInput}
                          >
                            {renderComparisonOperator(field)}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          {...field}
                          className={`flex-1 idx-${fIdx}-len-${fields.length}`}
                          name={[field.name, 'value']}
                          fieldKey={[field.fieldKey, 'value']}
                          rules={[
                            {
                              required: true,
                              message: 'This field is required',
                            },
                          ]}
                        >
                          {renderComparisonValue(field)}
                        </Form.Item>
                        {nodeData.edit &&
                          form.getFieldValue('payload').length > 1 && (
                            <Form.Item className="delbutton">
                              <MinusCircleOutlined
                                onClick={() => {
                                  removeItem(fIdx);
                                  remove(field.name);
                                }}
                              />
                            </Form.Item>
                          )}
                      </Space>
                    </div>
                  </div>
                ))}
                <Button
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

export default Filter;
