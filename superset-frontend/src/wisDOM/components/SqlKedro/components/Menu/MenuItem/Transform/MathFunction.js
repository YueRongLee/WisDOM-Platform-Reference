/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
// import moment from 'moment';
import { Form, Select, Input, Spin, Button } from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  CloseOutlined,
  PercentageOutlined,
  SwapOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  DATAFLOW_TYPE,
  NEW_COLUMN_RULES,
  FUNCTIONS,
  //   MATH_RULES,
  INPUT_RULES,
} from '~~constants/index';
import { TableApi } from '~~apis/';
import * as Style from './style';

const VALUE_USE = [
  {
    key: 'colValue',
    value: 'Source Column and Value',
  },
  {
    key: 'col',
    value: 'Source Column',
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
const ERROR_NUM = ['0', '0.', '.0', '-.0', '-0.', '-0', '-0.0', '-'];

const MATH_TYPE = [
  {
    key: 'add',
    value: 'Add',
    icon: <PlusOutlined />,
  },
  {
    key: 'subtract',
    value: 'Subtract',
    icon: <MinusOutlined />,
  },
  {
    key: 'multiply',
    value: 'Multiply',
    icon: <CloseOutlined />,
  },
  {
    key: 'divide',
    value: 'Divide',
    icon: <PercentageOutlined rotate={45} />,
  },
  {
    key: 'round',
    value: 'Round',
    // icon: <EllipsisOutlined />,
  },
];

const MathFunction = ({
  nodeParents,
  nodeData,
  data,
  setData,
  setSelectFinish,
  setFocusNode,
  //   schemaLoading,
  setNodeChange,
  //   setSelectPage,
}) => {
  const [selectColumns, setSelectColumns] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [changePosition, setChangePosition] = useState(false);
  const [disableCol, setDisableCol] = useState(true);
  const [numError, setNumError] = useState(false); // input!==0
  const [errorMsg, setErrorMsg] = useState('Please enter a available number');
  const [type, setType] = useState();
  const [form] = Form.useForm();

  const handleSave = pos => {
    // position切換時還沒存changePosition,所以用帶的
    const mathFilds = form.getFieldValue();
    if (mathFilds && mathFilds.length !== 0) {
      if (nodeData.id !== undefined) {
        // const nodeFilter = data.nodes.filter(e => e.id !== nodeData.id);
        const getArgNode = data.nodes.filter(e => e.id === nodeData.id);
        const setNewArg =
          getArgNode && getArgNode.length > 0 ? getArgNode[0].args : '';
        let type;
        if (mathFilds.mathType) {
          const index = MATH_TYPE.findIndex(
            e => e.value === mathFilds.mathType,
          );
          type = MATH_TYPE[index];
        }

        if (setNewArg.length !== 0) {
          setNewArg.mathOperation = {
            valueUsing: mathFilds.valueUsing,
            type: type && type.key,
            constantLeft: pos !== undefined ? pos : changePosition,
            columnLeft: mathFilds.column1,
            columnRight:
              mathFilds.mathType !== 'Round' ? mathFilds.column2 : undefined,
            percise:
              mathFilds.mathType === 'Round' ? mathFilds.column2 : undefined,
            newColumn: mathFilds.newColumn,
          };
        }

        let checkField = false;
        let checkStatus = false;
        const thisNode = getArgNode[0];
        if (mathFilds && thisNode) {
          if (mathFilds.mathType !== 'Round') {
            if (
              mathFilds.valueUsing &&
              mathFilds.column1 &&
              mathFilds.newColumn &&
              mathFilds.mathType &&
              mathFilds.column2
            ) {
              checkField = true;
            } else {
              checkField = false;
            }
          } else if (
            mathFilds.valueUsing &&
            mathFilds.column1 &&
            mathFilds.newColumn &&
            mathFilds.mathType &&
            mathFilds.column2
          ) {
            checkField = true;
          } else {
            checkField = false;
          }

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
          const newId = nodeData.id;
          const newEdge = data.edges;

          const newData = FUNCTIONS.SET_DATA(
            data,
            nodeData,
            index,
            newId,
            thisNode,
            setNewArg,
            newEdge,
          );

          setData(newData);
          //   setData({
          //     edges: [...data.edges],
          //     nodes: [
          //       ...nodeFilter,
          //       {
          //         full_name: nodeData.name,
          //         name: FUNCTIONS.NODE_NAME(nodeData.name),
          //         id: nodeData.id,
          //         type: nodeData.type,
          //         args: setNewArg,
          //         check: thisNode.check,
          //       },
          //     ],
          //   });
          setFocusNode({
            full_name: nodeData.name,
            name: FUNCTIONS.NODE_NAME(nodeData.name),
            id: nodeData.id,
            type: nodeData.type,
          });
        }
      }
    }
  };

  const onBlurInput = () => {
    handleSave();
  };

  const onBlurCheck = checkNum => {
    // const checkNum = num.target.value;
    const type = form.getFieldValue('mathType');
    let changeMsg = false;
    if (type && checkNum) {
      const minusAry = checkNum.match(/-/g);
      const pointAry = checkNum.match(/[.]/g);
      const reg = /^[0-9.-]*$/i;

      if (!reg.test(checkNum)) {
        setNumError(true);
        setErrorMsg('Accept number(0-9),minus(-) and point(.) only');
      } else if (ERROR_NUM.includes(checkNum)) {
        if (type && type !== 'Divide' && checkNum === '0') {
          setNumError(false);
        } else {
          setNumError(true);
          changeMsg = true;
        }
      } else if (minusAry && minusAry.length > 0) {
        if (minusAry.length === 1 && checkNum.substring(0, 1) !== '-') {
          setNumError(true);
          changeMsg = true;
        } else if (minusAry.length > 1) {
          setNumError(true);
          changeMsg = true;
        } else {
          setNumError(false);
        }
      } else if (pointAry && pointAry.length > 1) {
        setNumError(true);
        changeMsg = true;
      } else {
        setNumError(false);
      }
    }

    if (changeMsg) {
      setErrorMsg('Please enter a available number');
    }
    //  else if (type && checkNum === '') {
    //   setNumError(false);
    // }
  };

  const hangeValueChange = changeValue => {
    if (changeValue) {
      const col = Object.keys(changeValue)[0];
      const value = Object.values(changeValue)[0];
      let index = -1;
      let save = false;
      let newName = null;
      let isInput = false;
      switch (col) {
        case 'mathType':
          index = MATH_TYPE.findIndex(e => e.value === value);
          if (index !== -1) {
            setType(MATH_TYPE[index]);
          }

          if (value === 'Round') {
            form.setFieldsValue({
              valueUsing: VALUE_USE[0].value,
              column2: null,
              column1: null,
              newColumn: null,
            });
            setShowInput(true);
          } else {
            let col1 = null;
            let col2 = null;
            if (changePosition && form.getFieldValue('column2')) {
              newName = `New_${form.getFieldValue('column2')}_${value}`;
              col2 = form.getFieldValue('column2');
            } else if (!changePosition && form.getFieldValue('column1')) {
              newName = `New_${form.getFieldValue('column1')}_${value}`;
              col1 = form.getFieldValue('column1');
            }

            form.setFieldsValue({
              column1: col1,
              column2: col2,
              newColumn: newName,
            });
          }

          save = true;
          break;
        case 'valueUsing':
          if (value === VALUE_USE[0].value) {
            setShowInput(true);
          } else {
            setShowInput(false);
          }
          form.setFieldsValue({
            column2: null,
            column1: null,
            newColumn: null,
          });
          save = true;
          break;
        case 'column1':
          if (changePosition && form.getFieldValue('column2')) {
            newName = `New_${form.getFieldValue(
              'column2',
            )}_${form.getFieldValue('mathType')}`;
          } else if (!changePosition && value) {
            newName = `New_${value}_${form.getFieldValue('mathType')}`;
          }

          form.setFieldsValue({ newColumn: newName });
          save = true;
          if (changePosition && showInput) {
            isInput = true;
          }
          break;
        case 'column2':
          if (changePosition && value) {
            newName = `New_${value}_${form.getFieldValue('mathType')}`;
          } else if (!changePosition && form.getFieldValue('column1')) {
            newName = `New_${form.getFieldValue(
              'column1',
            )}_${form.getFieldValue('mathType')}`;
          }

          form.setFieldsValue({ newColumn: newName });
          save = true;
          if (!changePosition && showInput) {
            isInput = true;
          }
          break;
        default:
          break;
      }

      if (changePosition) {
        onBlurCheck(form.getFieldValue('column1'));
      } else {
        onBlurCheck(form.getFieldValue('column2'));
      }

      if (form.getFieldValue('mathType') && form.getFieldValue('valueUsing')) {
        setDisableCol(false);
      } else {
        setDisableCol(true);
      }

      if (save && !isInput) {
        handleSave();
      }
    }
  };

  const getTableColumns = async () => {
    try {
      setLoading(true);
      if (nodeParents[0].type === DATAFLOW_TYPE.DATASET.value) {
        const result1 = await TableApi.getAllowedTableColumns(
          nodeParents[0].args.table_name,
        );
        setSelectColumns(result1.table.columns);
      } else {
        const index = data.nodes.findIndex(e => e.id === nodeParents[0].key);
        const thisNode = data.nodes[index];
        setSelectColumns(thisNode.schema);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const setFormData = mathData => {
    if (mathData) {
      setChangePosition(mathData.constantLeft);
      let index = -1;
      if (mathData.type) {
        index = MATH_TYPE.findIndex(e => e.key === mathData.type);
        setType(MATH_TYPE[index]);
      }

      if (mathData.valueUsing === VALUE_USE[0].value) {
        setShowInput(true);
      } else {
        setShowInput(false);
      }

      if (mathData.type && mathData.valueUsing) {
        setDisableCol(false);
      } else {
        setDisableCol(true);
      }

      form.setFieldsValue({
        mathType: mathData.type ? MATH_TYPE[index].value : mathData.type,
        valueUsing: mathData.valueUsing,
        column1: mathData.columnLeft,
        column2:
          mathData.type === 'round' ? mathData.percise : mathData.columnRight,
        newColumn: mathData.newColumn,
      });

      if (mathData.constantLeft) {
        onBlurCheck(mathData.columnLeft);
      } else {
        onBlurCheck(mathData.columnRight);
      }
    }
  };

  useEffect(() => {
    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    if (index !== -1) {
      const nodeArg = data.nodes[index].args;
      getTableColumns();
      // check status
      if (nodeArg.mathOperation !== undefined) {
        setFormData(nodeArg.mathOperation);
      }
    }
  }, []);

  const handleChangePosition = () => {
    setChangePosition(!changePosition);
    const col1 = form.getFieldValue('column1');
    const col2 = form.getFieldValue('column2');
    let newCol = null;
    if (changePosition && col2) {
      newCol = `New_${col2}_${form.getFieldValue('mathType')}`;
    } else if (!changePosition && col1) {
      newCol = `New_${col1}_${form.getFieldValue('mathType')}`;
    }

    form.setFieldsValue({ column2: col1, column1: col2, newColumn: newCol });

    handleSave(!changePosition);
  };

  const getColumnsOption = () => {
    if (selectColumns) {
      return selectColumns.map(
        e =>
          MAP_ALLOWTYPE.includes(e.type) && (
            <Select.Option key={e.name}>{e.name}</Select.Option>
          ),
      );

      //   return selectColumns.map(e => (
      //     <Select.Option key={e.name}>{e.name}</Select.Option>
      //   ));
    }
    return null;
  };

  return (
    <Style.InsertScroll>
      <Spin spinning={isLoading}>
        <Form
          data-test="formValueChange"
          form={form}
          className="node-wrapper"
          onValuesChange={hangeValueChange}
        >
          <Style.FormItem
            label="Math Function Type"
            name="mathType"
            rules={[{ required: true, message: 'Please select a Type!' }]}
          >
            <Select
              placeholder="Select a Type"
              showSearch
              disabled={!nodeData.edit}
              style={{ width: '40%' }}
            >
              {MATH_TYPE.map(o => (
                <Select.Option key={o.key} value={o.value}>
                  {o.value}
                </Select.Option>
              ))}
            </Select>
          </Style.FormItem>
          <Style.FormItem
            label="Value Using"
            name="valueUsing"
            rules={[{ required: true, message: 'Please select a Using Type!' }]}
          >
            <Select
              placeholder="Select a Using Type"
              disabled={!nodeData.edit || (type && type.value === 'Round')}
            >
              {VALUE_USE.map(e => (
                <Select.Option key={e.key} value={e.value}>
                  {e.value}
                </Select.Option>
              ))}
            </Select>
          </Style.FormItem>

          {/* 四捨五入 */}
          {type && type.value === 'Round' ? (
            <>
              <Style.FormItem
                label="Source Columns"
                name="column1"
                rules={[{ required: true, message: 'Please select a Column' }]}
              >
                <Select
                  placeholder="Select a Column"
                  disabled={!nodeData.edit || disableCol}
                  style={{ width: '60%' }}
                >
                  {getColumnsOption()}
                </Select>
              </Style.FormItem>
              <Style.FormItem
                label="Decimals Point"
                name="column2"
                rules={[
                  { required: true, message: 'Please Input a value' },
                  {
                    pattern: new RegExp(/^[0-9]*$/i),
                    message: 'Accept number(0-9) only',
                  },
                ]}
              >
                <Input
                  //  onBlur={() => onBlurInput()}
                  onBlur={() => onBlurInput()}
                  placeholder="Input a Value"
                  style={{ width: '50%' }}
                  disabled={!nodeData.edit || disableCol}
                  maxLength={INPUT_RULES.MATH_ROUND_VALUE.value}
                />
              </Style.FormItem>
            </>
          ) : null}

          {/* 加減乘除,可互換 */}
          {type && type.value !== 'Round' ? (
            <Style.FormItem
              label="Source Columns"
              name="sourceCol"
              //   rules={[{ required: true, message: 'Please select a Column' }]}
            >
              <Style.BlockContainer>
                {changePosition ? (
                  <Form.Item
                    name="column1"
                    style={{ display: 'inline-block', width: '50%' }}
                    rules={
                      numError
                        ? null
                        : [
                            {
                              required: true,
                              message: showInput
                                ? 'Please Input a value'
                                : 'Please select a Column',
                            },
                            // {
                            //   pattern: showInput ? MATH_RULES.pattern : null,
                            //   //   message: showInput ? handleMsg() : handleAntdOK(),
                            //   message: showInput
                            //     ? 'Accept number(0-9),minus(-) and point(.) only'
                            //     : null,
                            // },
                          ]
                    }
                    validateStatus={numError && showInput ? 'error' : null}
                    help={
                      numError && showInput
                        ? errorMsg // 'Please enter a available number'
                        : null
                    }
                  >
                    {showInput ? (
                      <Input
                        // onBlur={e => onBlurCheck(e.target.value)}
                        onBlur={() => onBlurInput()}
                        placeholder="Input a Value"
                        disabled={!nodeData.edit || disableCol}
                        maxLength={INPUT_RULES.MATH_VALUE.value}
                      />
                    ) : (
                      <Select
                        placeholder="Select a Column"
                        disabled={!nodeData.edit || disableCol}
                      >
                        {getColumnsOption()}
                      </Select>
                    )}
                  </Form.Item>
                ) : (
                  // Change False
                  <Form.Item
                    name="column1"
                    style={{ display: 'inline-block', width: '50%' }}
                    rules={[
                      { required: true, message: 'Please select a Column' },
                    ]}
                  >
                    <Select
                      placeholder="Select a Column"
                      disabled={!nodeData.edit || disableCol}
                    >
                      {getColumnsOption()}
                    </Select>
                  </Form.Item>
                )}

                {type.icon}

                {changePosition ? (
                  <Form.Item
                    name="column2"
                    style={{ display: 'inline-block', width: '50%' }}
                    rules={[
                      { required: true, message: 'Please select a Column' },
                    ]}
                  >
                    <Select
                      placeholder="Select a Column"
                      disabled={!nodeData.edit || disableCol}
                    >
                      {getColumnsOption()}
                    </Select>
                  </Form.Item>
                ) : (
                  // Change False
                  <Form.Item
                    name="column2"
                    style={{ display: 'inline-block', width: '50%' }}
                    rules={
                      numError
                        ? null
                        : [
                            {
                              required: true,
                              message: showInput
                                ? 'Please Input a value'
                                : 'Please select a Column',
                            },
                            // {
                            //   pattern: showInput ? MATH_RULES.pattern : null,
                            //   message: showInput
                            //     ? 'Accept number(0-9),minus(-) and point(.) only'
                            //     : null,
                            // },
                          ]
                    }
                    validateStatus={numError && showInput ? 'error' : null}
                    help={
                      numError && showInput
                        ? errorMsg // 'Please enter a available number'
                        : null
                    }
                  >
                    {showInput ? (
                      <Input
                        // onBlur={e => onBlurCheck(e.target.value)}
                        onBlur={() => onBlurInput()}
                        placeholder="Input a Value"
                        disabled={!nodeData.edit || disableCol}
                        maxLength={INPUT_RULES.MATH_VALUE.value}
                      />
                    ) : (
                      <Select
                        placeholder="Select a Column"
                        disabled={!nodeData.edit || disableCol}
                      >
                        {getColumnsOption()}
                      </Select>
                    )}
                  </Form.Item>
                )}

                <Button
                  data-test="btnPosition"
                  shape="circle"
                  onClick={() => handleChangePosition()}
                  disabled={!nodeData.edit || disableCol}
                >
                  <SwapOutlined />
                </Button>
              </Style.BlockContainer>
            </Style.FormItem>
          ) : null}
          <Style.FormItem
            label="Destination Column"
            name="newColumn"
            tooltip={{
              title: 'Name of the column created with extracted values',
              icon: <InfoCircleOutlined />,
            }}
            rules={[
              { required: true, message: 'Please Input a value' },
              {
                pattern: NEW_COLUMN_RULES.pattern,
                message: 'Accept letters(A-Za-z) and underline(_) only',
              },
            ]}
          >
            <Input
              data-test="inputValue"
              placeholder="Input a Name"
              style={{ width: '50%' }}
              onBlur={() => onBlurInput()}
              disabled={!nodeData.edit || disableCol}
              maxLength={INPUT_RULES.COLUMN_NAME.value}
            />
          </Style.FormItem>
        </Form>
      </Spin>
    </Style.InsertScroll>
  );
};

export default MathFunction;
