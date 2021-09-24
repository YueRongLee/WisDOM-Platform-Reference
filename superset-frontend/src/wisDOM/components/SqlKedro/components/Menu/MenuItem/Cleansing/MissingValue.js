/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Form, Button, Spin, Select, Input, InputNumber } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
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
    key: 'fillComputedValue',
    value: 'Fill with the Computed value',
  },
  {
    key: 'fillString',
    value: 'Fill with a string',
  },
];

const ACTION_NUM = [
  {
    key: 'deleteRows',
    value: 'Delete rows',
  },
  {
    key: 'fillComputedValue',
    value: 'Fill with the Computed value',
  },
  {
    key: 'fillNumber',
    value: 'Fill with a Number',
  },
];

const ACTION_BOL = [
  {
    key: 'deleteRows',
    value: 'Delete rows',
  },
  {
    key: 'fillComputedValue',
    value: 'Fill with the Computed value',
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

const MissingValue = ({
  nodeParents,
  data,
  schemaLoading,
  nodeData,
  //   setFocusNode,
  //   setData,
  //   setSelectFinish,
  setNodeChange,
}) => {
  const [form] = Form.useForm();
  //   const [tempPayload, setTempPayload] = useState([{}]);
  const [tables, setTables] = useState([]);
  const [hasDateColumn, setHasDateColumn] = useState(false);
  //   const [actionList, setActionList] = useState([]);
  //   const [targetList, setTargetList] = useState([]);
  //   const [showTarget, setShowTarget] = useState(false);
  //   const [showTargetInput, setShowTargetInput] = useState();
  //   const [showTime, setShowTime] = useState();
  //   const [updateForm, setUpdateForm] = useState(false);
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

  const getTableColumns = async () => {
    try {
      setLoading(true);
      if (nodeParents[0].type === DATAFLOW_TYPE.DATASET.value) {
        const result1 = await TableApi.getAllowedTableColumns(
          nodeParents[0].args.table_name,
        );
        setTables(result1.table.columns);

        const dateCol =
          result1.table.columns &&
          result1.table.columns.filter(f => TYPE_MAPPING.date.includes(f.type));

        setHasDateColumn(dateCol && dateCol.length > 0);
      } else {
        const index = data.nodes.findIndex(e => e.id === nodeParents[0].key);
        const thisNode = data.nodes[index];
        const leftCol = thisNode.schema;
        setTables(leftCol);
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

    if (data && data.missingAction) {
      switch (data.missingAction) {
        case 'deleteRows':
          showAry = [];
          break;
        case 'fillComputedValue':
          showAry = ['showTarget'];
          break;
        case 'fillString':
          showAry = ['showTarget', 'showTargetInput'];
          break;
        case 'fillNumber':
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
      if (getArgNode[0].args.missingValue) {
        const tempMissing = getArgNode[0].args.missingValue;
        let checkOK = false;
        let totalCheck = true;

        tempMissing.forEach(e => {
          if (
            showAryCheck(e).includes('showTarget') &&
            showAryCheck(e).includes('showTime')
          ) {
            checkOK =
              e.sourceColumn &&
              e.missingAction &&
              e.targetValue &&
              //   e.groupBy &&
              e.timeline;
          } else if (showAryCheck(e).includes('showTarget')) {
            checkOK = e.sourceColumn && e.missingAction && e.targetValue;
          } else {
            checkOK = e.sourceColumn && e.missingAction;
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

    switch (changeKey) {
      case 'payload':
        if (!isRemove) {
          if (tempKey === 'sourceColumn') {
            if (tempPayload[index] && tempPayload[index].missingAction) {
              tempPayload[index].missingAction = undefined;
            }
          }

          if (tempKey === 'missingAction') {
            if (tempPayload[index] && tempPayload[index].targetValue) {
              tempPayload[index].targetValue = undefined;
            }
          }
        }

        // if (
        //   tempPayload.length > 1 &&
        //   getArgNode[0].args.missingValue &&
        //   tempPayload.length === getArgNode[0].args.missingValue.length
        // ) {
        //   if (tempKey === 'sourceColumn') {
        //     if (tempPayload[index] && tempPayload[index].missingAction) {
        //       tempPayload[index].missingAction = undefined;
        //     }
        //   }

        //   if (tempKey === 'missingAction') {
        //     if (tempPayload[index] && tempPayload[index].targetValue) {
        //       tempPayload[index].targetValue = undefined;
        //     }
        //   }
        // }

        form.setFieldsValue({ payload: tempPayload });
        getArgNode[0].args.missingValue = tempPayload;
        checkStatus();
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (nodeParents !== undefined) {
      if (data !== undefined) {
        const temp = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

        if (temp[0] && temp[0].args) {
          form.setFieldsValue({
            payload: temp[0].args.missingValue || [{}],
          });
        }
        getTableColumns();
      }
    }
  }, []);

  const disabledAdd = () => {
    const temp = form.getFieldValue('payload');
    if (temp[temp.length - 1]) {
      // 欄位中的value都要填
      //   return !(
      //     Object.values(temp[temp.length - 1]).filter(e => !e).length === 0
      //   );

      const basic =
        temp[temp.length - 1].sourceColumn &&
        temp[temp.length - 1].missingAction;
      const targetCheck = temp[temp.length - 1].targetValue;
      const timeCheck = temp[temp.length - 1].timeline;
      // temp[temp.length - 1].groupBy && temp[temp.length - 1].timeline;//groupby 非必選

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

  const getTargetOption = type => {
    setTargetMsg('');
    switch (type) {
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
  //       if (TYPE_MAPPING.string.includes(all.type)) {
  //         setActionList(ACTION_STRING);
  //         setTargetList(getTargetOption('string'));
  //         // setShowTarget(true);
  //       } else if (TYPE_MAPPING.num.includes(all.type)) {
  //         setActionList(ACTION_NUM);
  //         setTargetList(getTargetOption('num'));
  //         // setShowTarget(true);
  //       } else if (TYPE_MAPPING.bol.includes(all.type)) {
  //         setActionList(ACTION_BOL);
  //         setTargetList(getTargetOption('bol'));
  //         // setShowTarget(true);
  //       } else if (TYPE_MAPPING.date.includes(all.type)) {
  //         setActionList(ACTION_DATE);
  //         setTargetList(getTargetOption('date'));
  //         // setShowTarget(false);
  //       }
  //     }
  //   };

  const getTargetList = col => {
    if (col) {
      const type =
        tables.filter(e => e.name === col).length > 0 &&
        tables.filter(e => e.name === col)[0].type;
      const tempType = type && getColType(type);
      return getTargetOption(tempType);
    }
    return [];
  };

  const getActionList = col => {
    if (col) {
      const type =
        tables.filter(e => e.name === col).length > 0 &&
        tables.filter(e => e.name === col)[0].type;
      const tempType = type && getColType(type);

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

  return (
    <Style.InsertScroll>
      <Form
        form={form}
        data-test="missingPayload"
        name="missingPayload"
        scrollToFirstError
        initialValues={{
          payload: [{}], // 預設帶一筆
        }}
        onValuesChange={handleValueChange}
      >
        <div style={{ padding: '10px 30px' }}>
          Perform an action on NULL values of the selected column
        </div>
        <Spin spinning={schemaLoading || loading}>
          <Style.PaddFormItem>
            <Form.List name="payload">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, fIdx) => (
                    <div
                      style={{
                        border: '1px #3333 dashed',
                        margin: '0 0 15px 15px',
                      }}
                    >
                      <Style.OptionBlock key={field.key}>
                        <Form.Item
                          {...field}
                          label="Source Column"
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
                            placeholder="Select a column"
                            disabled={!nodeData.edit}
                            // onChange={handleSourceCol}
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
                      </Style.OptionBlock>

                      <Style.FieldBox>
                        <div>
                          <div style={{ marginLeft: '15px' }}>
                            <Style.StarMark>*</Style.StarMark> Missing Value
                            Action:
                          </div>
                          <Form.Item
                            {...field}
                            name={[field.name, 'missingAction']}
                            fieldKey={[field.fieldKey, 'missingAction']}
                            rules={[
                              {
                                required: true,
                                message: 'Please select a Missing Value Action',
                              },
                            ]}
                          >
                            <Select
                              style={{ width: '30vh' }}
                              placeholder="Select a action"
                              disabled={
                                !nodeData.edit ||
                                !form.getFieldValue([
                                  'payload',
                                  field.name,
                                  'sourceColumn',
                                ])
                              }
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
                                  style={{ width: '30vh' }}
                                  placeholder="Select a column"
                                  disabled={!nodeData.edit}
                                  mode="multiple"
                                  allowClear
                                  showSearch
                                >
                                  {tables &&
                                    tables
                                      .filter(
                                        a =>
                                          a.name !==
                                          form.getFieldValue('payload')[fIdx]
                                            .sourceColumn,
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
                          {[
                            'fillComputedValue',
                            'fillString',
                            'fillNumber',
                          ].includes(
                            form.getFieldValue([
                              'payload',
                              field.name,
                              'missingAction',
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
                                {['fillString', 'fillNumber'].includes(
                                  form.getFieldValue([
                                    'payload',
                                    field.name,
                                    'missingAction',
                                  ]),
                                ) ? (
                                  tables &&
                                  form.getFieldValue([
                                    'payload',
                                    field.name,
                                    'sourceColumn',
                                  ]) &&
                                  TYPE_MAPPING.num.includes(
                                    tables.filter(
                                      e =>
                                        e.name ===
                                        form.getFieldValue([
                                          'payload',
                                          field.name,
                                          'sourceColumn',
                                        ]),
                                    )[0]?.type,
                                  ) ? (
                                    <InputNumber
                                      style={{ width: '30vh' }}
                                      placeholder="Fill with target value"
                                      disabled={!nodeData.edit}
                                    />
                                  ) : (
                                    <Input
                                      style={{ width: '30vh' }}
                                      placeholder="Fill with target value"
                                      disabled={!nodeData.edit}
                                      maxLength={INPUT_RULES.MATH_VALUE.value}
                                    />
                                  )
                                ) : (
                                  <Select
                                    style={{ width: '30vh' }}
                                    placeholder="Select a column"
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
                                  style={{ width: '30vh' }}
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

export default MissingValue;
