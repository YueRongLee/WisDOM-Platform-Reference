/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Spin,
  Select,
  Input,
  InputNumber,
  DatePicker,
  Tooltip,
} from 'antd';
import { MinusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { INPUT_RULES, DATAFLOW_TYPE, FUNCTIONS } from '~~constants/index';
import { TableApi } from '~~apis/';
import * as Style from './style';

const TYPE_MAPPING = {
  string: ['string'],
  num: ['int', 'double', 'float'],
  bol: ['boolean'],
  date: ['timestamp', 'date', 'dateTimeOffset', 'dateTime'],
};

const ACTION_STRING = [
  {
    key: 'deleteRows',
    value: 'Delete rows',
  },
  {
    key: 'replaceComputedValue',
    value: 'Replace with the Computed value',
  },
  {
    key: 'replaceString',
    value: 'Replace with a string',
  },
];

const ACTION_NUM = [
  {
    key: 'deleteRows',
    value: 'Delete rows',
  },
  {
    key: 'replaceComputedValue',
    value: 'Replace with the Computed value',
  },
  {
    key: 'replaceNumber',
    value: 'Replace with a Number',
  },
];

const ACTION_BOL = [
  {
    key: 'deleteRows',
    value: 'Delete rows',
  },
  {
    key: 'replaceComputedValue',
    value: 'Replace with the Computed value',
  },
];

const ACTION_DATE = [
  {
    key: 'deleteRows',
    value: 'Delete rows',
  },
];

const TARGET_LIST = {
  STRING: [{ key: 'previousValue', value: 'Previous value' }],
  NUM: [
    { key: 'maximum', value: 'Maximum' },
    { key: 'minimum', value: 'Minimum' },
    { key: 'median', value: 'Median' },
    { key: 'average', value: 'Average' },
    { key: 'mostFrequent', value: 'Most frequent value' },
    { key: 'previousValue', value: 'Previous value' },
  ],
  BOL: [
    { key: true, value: 'True' },
    { key: false, value: 'False' },
    { key: 'mostFrequent', value: 'Most frequent value' },
    { key: 'previousValue', value: 'Previous value' },
  ],
};

// less,lessAndEqual,equal,moreAndEqual,more,notEqual
const CUSTOM_MATH = {
  NUM: [
    { key: 'LESS', value: '<' },
    { key: 'LESSANDEQUAL', value: '<=' },
    { key: 'MORE', value: '>' },
    { key: 'MOREANDEQUAL', value: '>=' },
    { key: 'EQUAL', value: '=' },
    { key: 'NOTEQUAL', value: 'Not Equal' },
  ],
  BOL: [
    { key: true, value: 'True' },
    { key: false, value: 'False' },
  ],
};

const CustomValue = ({
  nodeParents,
  data,
  schemaLoading,
  nodeData,
  setNodeChange,
}) => {
  const [form] = Form.useForm();
  const [tables, setTables] = useState([]);
  const [hasDateColumn, setHasDateColumn] = useState(false);
  //   const [actionList, setActionList] = useState([]);
  //   const [targetList, setTargetList] = useState([]);
  const [targetMsg, setTargetMsg] = useState();
  const [loading, setLoading] = useState(false);

  const getColType = type => {
    if (TYPE_MAPPING.string.includes(type)) {
      return 'string';
    }
    if (TYPE_MAPPING.num.includes(type)) {
      return 'num';
    }
    if (TYPE_MAPPING.bol.includes(type)) {
      return 'bol';
    }
    if (TYPE_MAPPING.date.includes(type)) {
      return 'date';
    }
    return undefined;
  };

  const getSourceColumnOrgType = (col, tempTable) => {
    if (tempTable) {
      const type =
        tempTable.filter(e => e.name === col).length > 0 &&
        tempTable.filter(e => e.name === col)[0].type;
      return type;
    }
    if (col && tables) {
      const type =
        tables.filter(e => e.name === col).length > 0 &&
        tables.filter(e => e.name === col)[0].type;
      return type;
    }
    return undefined;
  };

  const getSourceColumnType = col => {
    if (col && tables) {
      const type =
        tables.filter(e => e.name === col).length > 0 &&
        tables.filter(e => e.name === col)[0].type;
      return type && getColType(type);
    }
    return undefined;
  };

  const setFieldData = tables => {
    const temp = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

    if (temp[0] && temp[0].args && temp[0].args.customValue) {
      const customData = JSON.parse(JSON.stringify(temp[0].args.customValue));

      const tempPayload = temp[0].args.customValue;

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < tempPayload.length; i++) {
        // 加columnType在args
        if (tempPayload[i] && tempPayload[i].sourceColumn) {
          tempPayload[i].sourceColumnType = getSourceColumnOrgType(
            tempPayload[i].sourceColumn,
            tables,
          );
        }
      }

      customData.forEach(e => {
        if (
          e.sourceColumn &&
          tables &&
          e.customValue &&
          getColType(tables.filter(t => t.name === e.sourceColumn)[0].type) ===
            'date'
        ) {
          e.customValue = moment(e.customValue);
        }
      });

      form.setFieldsValue({
        payload: customData || [{}],
      });
    }
  };

  const getTableColumns = async () => {
    try {
      setLoading(true);
      if (nodeParents[0].type === DATAFLOW_TYPE.DATASET.value) {
        const result1 = await TableApi.getAllowedTableColumns(
          nodeParents[0].args.table_name,
        );
        setTables(result1.table.columns);
        setFieldData(result1.table.columns);
        const dateCol =
          result1.table.columns &&
          result1.table.columns.filter(f => TYPE_MAPPING.date.includes(f.type));
        setHasDateColumn(dateCol && dateCol.length > 0);
      } else {
        const index = data.nodes.findIndex(e => e.id === nodeParents[0].key);
        const thisNode = data.nodes[index];
        const leftCol = thisNode.schema;
        setTables(leftCol);
        setFieldData(leftCol);
        const dateCol =
          leftCol && leftCol.filter(f => TYPE_MAPPING.date.includes(f.type));
        setHasDateColumn(dateCol && dateCol.length > 0);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const showAryCheck = data => {
    let showAry = [];

    if (data && data.customAction) {
      switch (data.customAction) {
        case 'deleteRows':
          showAry = [];
          break;
        case 'replaceComputedValue':
          showAry = ['showTarget'];
          break;
        case 'replaceString':
          showAry = ['showTarget', 'showTargetInput'];
          break;
        case 'replaceNumber':
          showAry = ['showTarget', 'showTargetInput'];
          break;
        default:
          break;
      }
    }

    if (data.targetValue) {
      switch (data.targetValue) {
        case 'previousValue':
          showAry.push('showTime');
          break;
        default:
          break;
      }
    }

    return showAry;
  };

  const checkStatus = () => {
    const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

    if (getArgNode[0] && getArgNode[0].args) {
      if (getArgNode[0].args.customValue) {
        const tempCustom = getArgNode[0].args.customValue;
        let checkOK = false;
        let totalCheck = true;

        tempCustom.forEach(e => {
          if (
            showAryCheck(e).includes('showTarget') &&
            showAryCheck(e).includes('showTime')
          ) {
            checkOK =
              e.sourceColumn &&
              e.customValue !== undefined &&
              e.customAction !== undefined &&
              e.targetValue !== undefined &&
              e.timeline;
          } else if (showAryCheck(e).includes('showTarget')) {
            checkOK =
              e.sourceColumn &&
              e.customValue !== undefined &&
              e.customAction !== undefined &&
              e.targetValue !== undefined;
          } else {
            checkOK =
              e.sourceColumn &&
              e.customValue !== undefined &&
              e.customAction !== undefined;
          }

          if (!checkOK) {
            totalCheck = false;
          }
        });

        let statusChange = false;

        if (totalCheck && getArgNode[0].check !== undefined) {
          getArgNode[0].check = undefined;
          statusChange = true;
        } else if (!totalCheck && getArgNode[0].check === undefined) {
          getArgNode[0].check = 'error';
          statusChange = true;
        }

        if (statusChange === true) {
          setNodeChange(getArgNode[0]);
        }
      }
    }
  };

  const handleValueChange = changeValue => {
    const changeKey = Object.keys(changeValue)[0];
    const changeValues = Object.values(changeValue)[0];

    const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    const tempPayload = form.getFieldValue('payload');
    const datePayolad = JSON.parse(JSON.stringify(tempPayload));

    let tempKey;
    // let tempValue;
    let index;
    let isRemove = false;
    if (changeKey === 'payload') {
      index = changeValues.length - 1;
      if (changeValues[index] && Object.keys(changeValues[index]).length > 1) {
        isRemove = true;
      }
      tempKey = changeValues[index] && Object.keys(changeValues[index])[0];
      //   tempValue = changeValues[index] && Object.values(changeValues[index])[0];
    }

    // const isDate = false;
    switch (changeKey) {
      case 'payload':
        if (!isRemove) {
          if (tempKey === 'sourceColumn') {
            if (
              tempPayload[index] &&
              (tempPayload[index].customAction !== undefined ||
                tempPayload[index].customValue !== undefined ||
                tempPayload[index].numberType !== undefined ||
                tempPayload[index].targetValue !== undefined)
            ) {
              tempPayload[index].customAction = undefined;
              tempPayload[index].customValue = undefined;
              tempPayload[index].targetValue = undefined;
              tempPayload[index].numberType = undefined;
            }
          }

          if (tempKey === 'customAction') {
            if (tempPayload[index] && tempPayload[index].targetValue) {
              tempPayload[index].targetValue = undefined;
            }
          }
        }

        form.setFieldsValue({ payload: tempPayload });

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < tempPayload.length; i++) {
          //   // 時間欄位 moment轉timestamp
          if (
            tempPayload[i] &&
            tempPayload[i].sourceColumn &&
            tempPayload[i].customValue &&
            tables
          ) {
            if (
              getColType(
                tables.filter(e => e.name === tempPayload[i].sourceColumn)[0]
                  .type,
              ) === 'date'
            ) {
              datePayolad[i].customValue = moment(
                datePayolad[i].customValue,
              ).valueOf();
            }
          }

          // 加columnType在args
          if (tempPayload[i] && tempPayload[i].sourceColumn) {
            datePayolad[i].sourceColumnType = getSourceColumnOrgType(
              tempPayload[i].sourceColumn,
            );
          }
        }

        getArgNode[0].args.customValue = datePayolad;

        checkStatus();
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (nodeParents !== undefined) {
      if (data !== undefined) {
        getTableColumns();
      }
    }
  }, []);

  const disabledAdd = () => {
    const temp = form.getFieldValue('payload');
    if (temp[temp.length - 1]) {
      const basic =
        temp[temp.length - 1].sourceColumn &&
        temp[temp.length - 1].customValue !== undefined &&
        temp[temp.length - 1].customAction !== undefined;
      const targetCheck = temp[temp.length - 1].targetValue !== undefined;
      const timeCheck = temp[temp.length - 1].timeline;

      if (
        showAryCheck(temp[temp.length - 1]).includes('showTarget') &&
        showAryCheck(temp[temp.length - 1]).includes('showTime')
      ) {
        return !(basic && targetCheck && timeCheck);
      }
      if (showAryCheck(temp[temp.length - 1]).includes('showTarget')) {
        return !(basic && targetCheck);
      }
      return !basic;
    }
    return true;
  };

  const getActionList = col => {
    if (col) {
      //   const type =
      //     tables.filter(e => e.name === col).length > 0 &&
      //     tables.filter(e => e.name === col)[0].type;
      //   const tempType = type && getColType(type);
      const tempType = getSourceColumnType(col);

      switch (tempType) {
        case 'string':
          return ACTION_STRING;
        case 'num':
          return ACTION_NUM;
        case 'bol':
          return ACTION_BOL;
        case 'date':
          return ACTION_DATE;
        default:
          return [];
      }
    } else return [];
  };

  const getTargetList = col => {
    setTargetMsg('');
    // const type =
    //   tables.filter(e => e.name === col).length > 0 &&
    //   tables.filter(e => e.name === col)[0].type;
    // const tempType = type && getColType(type);
    const tempType = getSourceColumnType(col);

    switch (tempType) {
      case 'string':
        if (hasDateColumn) {
          return TARGET_LIST.STRING;
        }
        setTargetMsg('There is no column with date type.');
        return [];

      case 'num':
        if (hasDateColumn) {
          return TARGET_LIST.NUM;
        }
        return TARGET_LIST.NUM.filter(e => e.key !== 'previousValue');

      case 'bol':
        if (hasDateColumn) {
          return TARGET_LIST.BOL;
        }
        return TARGET_LIST.BOL.filter(e => e.key !== 'previousValue');

      default:
        return [];
    }
  };

  //   const handleSourceCol = (value, all) => {
  //     if (value) {
  //       const tempType = getColType(all.type);
  //       let check = false;
  //       switch (tempType) {
  //         case 'string':
  //           setActionList(ACTION_STRING);
  //           check = true;
  //           break;
  //         case 'num':
  //           setActionList(ACTION_NUM);
  //           check = true;
  //           break;
  //         case 'bol':
  //           setActionList(ACTION_BOL);
  //           check = true;
  //           break;
  //         case 'date':
  //           setActionList(ACTION_DATE);
  //           check = true;
  //           break;
  //         default:
  //           break;
  //       }

  //       if (check) {
  //         setTargetList(getTargetOption(tempType));
  //       }
  //     }
  //   };

  const range = (start, end) => {
    const result = [];
    // eslint-disable-next-line no-plusplus
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  const disabledDateTime = () => ({
    disabledHours: () => range(0, 24),
    disabledMinutes: () => range(0, 60),
    disabledSeconds: () => range(0, 60),
  });

  const showCustomValue = (sourceCol, field) => {
    if (sourceCol && tables.length > 0) {
      //   const type = getColType(
      //     tables.filter(f => f.name === sourceCol).length > 0 &&
      //       tables.filter(f => f.name === sourceCol)[0].type,
      //   );

      const type = getSourceColumnType(sourceCol);

      switch (type) {
        case 'string':
          return (
            <>
              <div style={{ marginLeft: '15px' }}>
                <Style.StarMark>*</Style.StarMark>Custom Value:
              </div>
              <Form.Item
                {...field}
                name={[field.name, 'customValue']}
                fieldKey={[field.fieldKey, 'customValue']}
                rules={[
                  {
                    required: true,
                    message: 'Please select a Custom Value',
                  },
                ]}
              >
                <Input
                  style={{ width: '26vh' }}
                  placeholder="Replace with target value"
                  disabled={!nodeData.edit}
                  maxLength={INPUT_RULES.MATH_VALUE.value}
                />
              </Form.Item>
            </>
          );
        case 'bol':
          return (
            <>
              <div style={{ marginLeft: '15px' }}>
                <Style.StarMark>*</Style.StarMark>Custom Value:
              </div>
              <Form.Item
                {...field}
                name={[field.name, 'customValue']}
                fieldKey={[field.fieldKey, 'customValue']}
                rules={[
                  {
                    required: true,
                    message: 'Please select a Custom Value',
                  },
                ]}
              >
                <Select
                  style={{ width: '26vh' }}
                  placeholder="Filter with custom value"
                  disabled={!nodeData.edit}
                  showSearch
                >
                  {CUSTOM_MATH.BOL.map(e => (
                    <Select.Option key={e.key} value={e.key}>
                      {e.value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          );
        case 'num':
          return (
            <>
              <div style={{ marginLeft: '15px' }}>
                <Style.StarMark>*</Style.StarMark>Custom Value
                <Tooltip title='NULL values will not be modified by all filters instead of "Not Equal."'>
                  <InfoCircleOutlined
                    style={{ margin: '0 5px', color: '#00000073' }}
                  />
                </Tooltip>
                :
              </div>
              <span style={{ display: 'flex' }}>
                <Form.Item
                  noStyle
                  {...field}
                  name={[field.name, 'customNum']}
                  fieldKey={[field.fieldKey, 'customNum']}
                  rules={[
                    {
                      required: true,
                      message: 'Please select a Custom Value',
                    },
                  ]}
                >
                  <Form.Item
                    {...field}
                    name={[field.name, 'numberType']}
                    fieldKey={[field.fieldKey, 'numberType']}
                    rules={[
                      {
                        required: true,
                        message: 'Please select a Custom Value',
                      },
                    ]}
                  >
                    <Select
                      style={{ width: '15vh' }}
                      placeholder="select a type"
                      disabled={!nodeData.edit}
                      showSearch
                    >
                      {CUSTOM_MATH.NUM.map(e => (
                        <Select.Option key={e.key} value={e.key}>
                          {e.value}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...field}
                    name={[field.name, 'customValue']}
                    fieldKey={[field.fieldKey, 'customValue']}
                    rules={[
                      {
                        required: true,
                        message: 'Please input a Custom Value',
                      },
                    ]}
                    style={{ paddingRight: '0px !important' }}
                  >
                    <InputNumber
                      style={{ width: '10vh' }}
                      placeholder="custom value"
                      disabled={
                        !nodeData.edit ||
                        !form.getFieldValue([
                          'payload',
                          field.name,
                          'numberType',
                        ])
                      }
                    />
                  </Form.Item>
                </Form.Item>
              </span>
            </>
          );
        case 'date':
          return (
            <>
              <div style={{ marginLeft: '15px' }}>
                <Style.StarMark>*</Style.StarMark>Custom Value:
              </div>
              <Form.Item
                {...field}
                name={[field.name, 'customValue']}
                fieldKey={[field.fieldKey, 'customValue']}
                rules={[
                  {
                    required: true,
                    message: 'Please select a Custom Value',
                  },
                ]}
              >
                {tables &&
                getSourceColumnOrgType(
                  form.getFieldValue(['payload', field.name, 'sourceColumn']),
                ) === 'date' ? (
                  <DatePicker
                    format="YYYY-MM-DD HH:mm:ss"
                    disabledTime={disabledDateTime}
                    showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                    disabled={!nodeData.edit}
                  />
                ) : (
                  <DatePicker
                    format="YYYY-MM-DD HH:mm:ss"
                    showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                    disabled={!nodeData.edit}
                  />
                )}
              </Form.Item>
            </>
          );
        default:
          return null;
      }
    } else return null;
  };

  const showInput = sourceCol => {
    if (sourceCol && tables.length > 0) {
      if (
        TYPE_MAPPING.num.includes(
          tables.filter(e => e.name === sourceCol)[0].type,
        )
      ) {
        return (
          <InputNumber
            style={{ width: '26vh' }}
            placeholder="Replace with target value"
            disabled={!nodeData.edit}
          />
        );
      }
      return (
        <Input
          style={{ width: '26vh' }}
          placeholder="Replace with target value"
          disabled={!nodeData.edit}
          maxLength={INPUT_RULES.MATH_VALUE.value}
        />
      );
    }
    return null;
  };

  return (
    <Style.InsertScroll>
      <Form
        form={form}
        data-test="customPayload"
        name="customPayload"
        scrollToFirstError
        initialValues={{
          payload: [{}], // 預設帶一筆
        }}
        onValuesChange={handleValueChange}
      >
        <div style={{ padding: '10px 30px' }}>
          Perform an action on a custom value of the selected column
        </div>
        <Spin spinning={schemaLoading || loading}>
          <Style.PaddFormItem>
            <Form.List name="payload">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(field => (
                    <div
                      style={{
                        border: '1px #3333 dashed',
                        margin: '0 0 15px 15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                      key={field.key}
                    >
                      <Style.FieldBox>
                        <div>
                          <div style={{ marginLeft: '15px' }}>
                            <Style.StarMark>*</Style.StarMark>Source Column:
                          </div>
                          <Form.Item
                            {...field}
                            //   label="Source Column"
                            name={[field.name, 'sourceColumn']}
                            fieldKey={[field.fieldKey, 'sourceColumn']}
                            rules={[
                              {
                                required: true,
                                message: 'Please select a Source Column',
                              },
                            ]}
                          >
                            <Select
                              style={{ width: '26vh' }}
                              placeholder="Select a column"
                              disabled={!nodeData.edit}
                              //   onChange={handleSourceCol}
                              showSearch
                            >
                              {tables &&
                                tables.map(t => (
                                  <Select.Option
                                    key={t.name}
                                    value={t.name}
                                    type={t.type}
                                  >
                                    {t.name}({t.type})
                                  </Select.Option>
                                ))}
                            </Select>
                          </Form.Item>

                          <div style={{ marginLeft: '15px' }}>
                            <Style.StarMark>*</Style.StarMark>Custom Value
                            Action:
                          </div>
                          <Form.Item
                            {...field}
                            name={[field.name, 'customAction']}
                            fieldKey={[field.fieldKey, 'customAction']}
                            rules={[
                              {
                                required: true,
                                message: 'Please select a Custom Value Action',
                              },
                            ]}
                          >
                            <Select
                              style={{ width: '26vh' }}
                              placeholder="Select a action"
                              disabled={
                                !nodeData.edit ||
                                !form.getFieldValue([
                                  'payload',
                                  field.name,
                                  'sourceColumn',
                                ])
                              }
                              allowClear
                              showSearch
                            >
                              {tables &&
                                getActionList(
                                  form.getFieldValue([
                                    'payload',
                                    field.name,
                                    'sourceColumn',
                                  ]),
                                ).map(a => (
                                  <Select.Option key={a.key} value={a.key}>
                                    {a.value}
                                  </Select.Option>
                                ))}
                            </Select>
                          </Form.Item>

                          {['previousValue'].includes(
                            form.getFieldValue([
                              'payload',
                              field.name,
                              'targetValue',
                            ]),
                          ) ? (
                            <>
                              <div style={{ marginLeft: '15px' }}>
                                Group By:
                              </div>
                              <Form.Item
                                {...field}
                                name={[field.name, 'groupBy']}
                                fieldKey={[field.fieldKey, 'groupBy']}
                              >
                                <Select
                                  style={{ width: '26vh' }}
                                  placeholder="Select a column"
                                  disabled={!nodeData.edit}
                                  mode="multiple"
                                  allowClear
                                  showSearch
                                >
                                  {tables &&
                                    form.getFieldValue([
                                      'payload',
                                      field.name,
                                      'sourceColumn',
                                    ]) &&
                                    tables
                                      .filter(
                                        a =>
                                          a.name !==
                                          form.getFieldValue([
                                            'payload',
                                            field.name,
                                            'sourceColumn',
                                          ]),
                                      )
                                      .map(a => (
                                        <Select.Option
                                          key={a.name}
                                          value={a.name}
                                        >
                                          {a.name}({a.type})
                                        </Select.Option>
                                      ))}
                                </Select>
                              </Form.Item>
                            </>
                          ) : null}
                        </div>

                        <div>
                          {showCustomValue(
                            form.getFieldValue([
                              'payload',
                              field.name,
                              'sourceColumn',
                            ]),
                            field,
                          )}

                          {[
                            'replaceComputedValue',
                            'replaceString',
                            'replaceNumber',
                          ].includes(
                            form.getFieldValue([
                              'payload',
                              field.name,
                              'customAction',
                            ]),
                          ) ? (
                            <>
                              <div style={{ marginLeft: '15px' }}>
                                <Style.StarMark>*</Style.StarMark>Target Value:
                              </div>
                              <Form.Item
                                {...field}
                                name={[field.name, 'targetValue']}
                                fieldKey={[field.fieldKey, 'targetValue']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please input a Target Value`,
                                  },
                                ]}
                                help={targetMsg || null}
                              >
                                {['replaceString', 'replaceNumber'].includes(
                                  form.getFieldValue([
                                    'payload',
                                    field.name,
                                    'customAction',
                                  ]),
                                ) ? (
                                  showInput(
                                    form.getFieldValue([
                                      'payload',
                                      field.name,
                                      'sourceColumn',
                                    ]),
                                  )
                                ) : (
                                  <Select
                                    style={{ width: '26vh' }}
                                    placeholder="Replace with target value"
                                    disabled={!nodeData.edit}
                                    allowClear
                                    showSearch
                                  >
                                    {tables &&
                                      getTargetList(
                                        form.getFieldValue([
                                          'payload',
                                          field.name,
                                          'sourceColumn',
                                        ]),
                                      ).map(s => (
                                        <Select.Option
                                          key={s.key}
                                          value={s.key}
                                        >
                                          {s.value}
                                        </Select.Option>
                                      ))}
                                  </Select>
                                )}
                              </Form.Item>
                            </>
                          ) : null}

                          {['previousValue'].includes(
                            form.getFieldValue([
                              'payload',
                              field.name,
                              'targetValue',
                            ]),
                          ) ? (
                            <>
                              <div style={{ marginLeft: '15px' }}>
                                <Style.StarMark>*</Style.StarMark> Timeline:
                              </div>
                              <Form.Item
                                {...field}
                                name={[field.name, 'timeline']}
                                fieldKey={[field.fieldKey, 'timeline']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please select a Timeline',
                                  },
                                ]}
                              >
                                <Select
                                  style={{ width: '26vh' }}
                                  placeholder="Select a column"
                                  disabled={!nodeData.edit}
                                  showSearch
                                >
                                  {tables &&
                                    form.getFieldValue([
                                      'payload',
                                      field.name,
                                      'sourceColumn',
                                    ]) &&
                                    tables
                                      .filter(
                                        a =>
                                          a.name !==
                                            form.getFieldValue([
                                              'payload',
                                              field.name,
                                              'sourceColumn',
                                            ]) &&
                                          TYPE_MAPPING.date.includes(a.type),
                                      )
                                      .map(a => (
                                        <Select.Option
                                          key={a.name}
                                          value={a.name}
                                        >
                                          {a.name}({a.type})
                                        </Select.Option>
                                      ))}
                                </Select>
                              </Form.Item>
                            </>
                          ) : null}
                        </div>
                      </Style.FieldBox>

                      {nodeData.edit &&
                        form.getFieldValue('payload') &&
                        form.getFieldValue('payload').length > 1 && (
                          <Form.Item style={{ width: '10%' }} {...field}>
                            <MinusCircleOutlined
                              data-test="delbutton"
                              onClick={() => {
                                remove(field.name);
                              }}
                              disabled={!nodeData.edit}
                            />
                          </Form.Item>
                        )}
                    </div>
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
          </Style.PaddFormItem>
        </Spin>
      </Form>
    </Style.InsertScroll>
  );
};

export default CustomValue;
