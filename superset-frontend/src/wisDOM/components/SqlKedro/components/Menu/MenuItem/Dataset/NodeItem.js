/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-imports */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Form, Select, Spin, Input, Alert, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import { WarningOutlined } from '@ant-design/icons';
import { TableApi } from '~~apis/';
import {
  DATAFLOW_TYPE,
  INPUT_RULES,
  FLOW_NAME_RULES,
  FUNCTIONS,
} from '~~constants/index';
import * as Style from './style';

const warnIcon = <WarningOutlined />;
const { Option, OptGroup } = Select;

const DATE_UNITS = [
  { label: 'day', value: 'day' },
  { label: 'week', value: 'week' },
  { label: 'month', value: 'month' },
  { label: 'year', value: 'year' },
];
const DATE_VALUE = {
  day: [1, 2, 3, 4, 5, 6, 7],
  week: [1, 2, 3, 4],
  month: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  year: [1, 2, 3],
};

const DatasetNodeItem = ({
  selectPage,
  setSelectPage,
  defaultTable,
  nodeData,
  setNodeChange,
  setSchema,
  data,
  groupId,
  setData,
  setSelectFinish,
  foundWisdomDate,
}) => {
  const [form] = Form.useForm();
  const [tableLoading, setTableLoading] = useState(false);
  const [inputClick, setInputClick] = useState(false);
  const [inputChange, setInputChange] = useState(undefined);
  const [groupAtlasTable, setGroupAtlasTable] = useState([]);
  const [wtdTable, setWTDTable] = useState([]);
  const [updateTime, setUpdateTime] = useState();
  const [showWarning, setShowWarning] = useState(false);
  const [timeSegmentUnit, setTimeSegmentUnit] = useState('');
  const [timeSegmentValue, setTimeSegmentValue] = useState(0);

  const handleSelectNodeType = type => {
    setSelectPage(type.toLowerCase());
  };

  const handleSetUpdateTime = async index => {
    setTableLoading(true);
    try {
      const thisNode = data.nodes[index];

      let check;

      if (nodeData.type.toLowerCase() === DATAFLOW_TYPE.DATASET.key) {
        const result = await TableApi.getAllowedTableColumns(
          thisNode.args.table_name,
        );
        const time = FUNCTIONS.TIMESTAMP_TO_TIME(result.lastUpdateTime);
        const overMonth = FUNCTIONS.CHECK_TIMESTAMP(result.lastUpdateTime);

        if (!overMonth && thisNode.schema && thisNode.schema !== null) {
          check = undefined;
        } else if (overMonth && !thisNode.schema && thisNode.schema === null) {
          check = 'error';
        } else if (overMonth) {
          check = 'warning';
        }

        // 拿到後塞到args.frontend
        if (!thisNode.args.frontend) {
          thisNode.args.frontend = {
            lastUpdateTime: time,
          };
        } else {
          thisNode.args.frontend.lastUpdateTime = time;
        }

        setUpdateTime(time);
      }

      thisNode.check = check;

      form.setFieldsValue({
        name: thisNode.args.name,
        nodetype: nodeData.type,
        datasetOption: thisNode.args.table_name,
      });

      setSchema(thisNode.args.table_name);
      handleSelectNodeType(nodeData.type);
    } catch (e) {
      console.log(e);
      //   return null;
    } finally {
      setTableLoading(false);
    }
  };

  const handleSelectDataSet = async (value, option) => {
    setSchema(value);
    // set table type
    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    if (index !== -1) {
      const thisNode = data.nodes[index];
      thisNode.args.table_type = option.type;
    }
  };

  const getGroupPermissionTable = async () => {
    setTableLoading(true);
    try {
      const result = await TableApi.getAllowedTable(groupId, 'WisDOM');
      setGroupAtlasTable(result);
    } catch (e) {
      console.log(e);
    } finally {
      setTableLoading(false);
    }
  };

  const getWTDTable = async () => {
    // wisdom temp dataset for datarobot
    setTableLoading(true);
    try {
      const result = await TableApi.getAllowedTable(groupId, 'WTD');
      setWTDTable(result);
    } catch (e) {
      console.log(e);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    const index = data.nodes.findIndex(e => e.id === nodeData.id);

    if (index !== -1) {
      const thisNode = data.nodes[index];
      const nodeArg = thisNode.args;

      form.setFieldsValue({
        name: nodeArg.name,
        nodetype: nodeData.type,
        datasetOption: nodeArg.table_name,
        timeSegmentUnit: nodeArg.timeSegmentUnit,
        timeSegmentValue: nodeArg.timeSegmentValue,
      });

      setTimeSegmentUnit(nodeArg.timeSegmentUnit);
      setTimeSegmentValue(nodeArg.timeSegmentValue);
    }
  }, []);

  useEffect(() => {
    if (nodeData.name !== undefined && nodeData.name !== null) {
      const index = data.nodes.findIndex(e => e.id === nodeData.id);

      if (index !== -1) {
        const thisNode = data.nodes[index];
        const nodeArg = thisNode.args;

        setShowWarning(thisNode.check === 'warning');

        if (nodeData.type === 'Empty' || !nodeArg.table_name) {
          form.setFieldsValue({
            name: nodeArg.name,
            nodetype: nodeData.type,
            datasetOption: nodeArg.table_name,
          });

          setSchema(nodeArg.table_name);
          handleSelectNodeType(
            nodeData.type === 'Empty'
              ? DATAFLOW_TYPE.NEWNODE.key
              : nodeData.type,
          );
        } else if (
          thisNode.args.frontend &&
          thisNode.args.frontend.lastUpdateTime
        ) {
          const time = FUNCTIONS.TIMESTAMP_TO_TIME(
            thisNode.args.frontend.lastUpdateTime,
          );
          setUpdateTime(time);

          form.setFieldsValue({
            name: nodeArg.name,
            nodetype: nodeData.type,
            datasetOption: nodeArg.table_name,
          });

          setSchema(nodeArg.table_name);
          handleSelectNodeType(nodeData.type);
        } else {
          handleSetUpdateTime(index);
        }
      }
    }
  }, [nodeData]);

  useEffect(() => {
    getGroupPermissionTable();
    getWTDTable();
  }, [groupId]);

  useEffect(() => {
    if (inputClick === false && inputChange !== undefined) {
      setNodeChange(inputChange);
      setInputChange(undefined); // 判斷完清空
    }
  }, [inputClick]);

  const hangeValueChange = async changeValue => {
    if (changeValue !== undefined) {
      const changeColumn = Object.keys(changeValue)[0];
      if (changeColumn === 'nodetype') {
        handleSelectNodeType(Object.values(changeValue)[0]);
      }

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

      // setInputChange(newNode);
      if (changeColumn === 'nodetype') {
        setInputChange(undefined); // type可以直接改
        setNodeChange(newNode);
      } else {
        setInputChange(newNode);
      }
      // 選擇 dataset 時重畫
      if (changeColumn === 'datasetOption') {
        const index = data.nodes.findIndex(e => e.id === nodeData.id);
        let overMonth = false;
        if (index !== -1) {
          const thisNode = data.nodes[index];
          //   const nodeArg = data.nodes[index].args;
          thisNode.args.table_name = Object.values(changeValue)[0];
          thisNode.args.name = Object.values(changeValue)[0];
          thisNode.args.classification = 'DataSource';
          try {
            const result = await TableApi.getAllowedTableColumns(
              Object.values(changeValue)[0],
            );
            thisNode.schema = result.table.columns.map(e => ({
              name: e.name,
              type: e.type,
              description: e.comment,
            }));
            if (thisNode.args.frontend) {
              thisNode.args.frontend.lastUpdateTime = result.lastUpdateTime;
            } else {
              thisNode.args.frontend = {
                lastUpdateTime: result.lastUpdateTime,
              };
            }

            const strTime = FUNCTIONS.TIMESTAMP_TO_TIME(result.lastUpdateTime);
            overMonth = FUNCTIONS.CHECK_TIMESTAMP(result.lastUpdateTime);
            setUpdateTime(strTime);

            let check;
            if (!overMonth && thisNode.schema && thisNode.schema !== null) {
              check = undefined;
            } else if (
              overMonth &&
              !thisNode.schema &&
              thisNode.schema === null
            ) {
              check = 'error';
            } else if (overMonth) {
              check = 'warning';
            }

            thisNode.check = check;

            setShowWarning(overMonth);
          } catch (e) {
            console.log(e);
          }
          setSelectFinish(false);
          setData({
            edges: [...data.edges],
            nodes: [...data.nodes],
          });

          const node = {
            id: nodeData.id,
            name: Object.values(changeValue)[0],
            type: nodeData.type,
            check: overMonth ? 'warning' : thisNode.check,
          };
          setNodeChange(node);
        }
      }

      if (changeColumn === 'timeSegmentUnit') {
        setTimeSegmentUnit(Object.values(changeValue)[0]);
        setTimeSegmentValue(1);
        form.setFieldsValue({ timeSegmentValue: 1 });

        const node = {
          id: nodeData.id,
          name: nodeData.name,
          type: nodeData.type,
          timeSegmentUnit: Object.values(changeValue)[0],
          timeSegmentValue: 1,
        };
        setNodeChange(node);
      }

      if (changeColumn === 'timeSegmentValue') {
        setTimeSegmentValue(Object.values(changeValue)[0]);

        const node = {
          id: nodeData.id,
          name: nodeData.name,
          type: nodeData.type,
          timeSegmentUnit,
          timeSegmentValue: Object.values(changeValue)[0],
        };
        setNodeChange(node);
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

  return (
    <Style.InsertScroll>
      <Spin spinning={tableLoading}>
        <Form
          form={form}
          className="node-wrapper"
          initialValues={{
            name: nodeData.name,
            nodetype: selectPage,
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
              data-test="name"
              onFocus={() => setInputClick(true)}
              disabled={!nodeData.edit}
              maxLength={INPUT_RULES.TABLE_NAME.value}
              onBlur={() => handleValidate()}
            />
          </Style.FormItem>
          <Style.FormItem label="Node Type" name="nodetype">
            <Select
              data-test="nodetype"
              showSearch
              onChange={value => handleSelectNodeType(value)}
              disabled={!nodeData.edit}
            >
              <Option value="dataset">Dataset</Option>
              <Option value="cleansing">Cleansing</Option>
              <Option value="transform">Transform</Option>
              <Option value="target">Target</Option>
            </Select>
          </Style.FormItem>
          <Style.FormItem label="Dataset" name="datasetOption">
            <Select
              data-test="datasetOption"
              showSearch
              onChange={handleSelectDataSet}
              //   filterOption={(input, option) =>
              //     option.children
              //       ? option.children
              //           .toLowerCase()
              //           .indexOf(input.toLowerCase()) >= 0
              //       : ''
              //   }
              disabled={tableLoading || !nodeData.edit}
            >
              {defaultTable.nodes !== undefined &&
              defaultTable.nodes.length !== 0 ? (
                <OptGroup label="Selected">
                  {defaultTable.nodes
                    .filter(i => i.type === 'Dataset')
                    .map(item => (
                      <Option
                        key={item.id}
                        value={item.full_name}
                        type="WisDOM"
                      >
                        <Tooltip title={item.full_name} placement="bottom">
                          {item.full_name}
                        </Tooltip>
                      </Option>
                    ))}
                </OptGroup>
              ) : null}

              <OptGroup label="Permission">
                {groupAtlasTable.map(item => (
                  <Option key={item.name} value={item.name}>
                    <Tooltip
                      title={
                        item.description === ''
                          ? item.name
                          : item.description.length > 100
                          ? `${item.description.slice(0, 100)}...`
                          : item.description
                      }
                      placement="bottom"
                    >
                      {item.name}
                    </Tooltip>
                  </Option>
                ))}
              </OptGroup>
              {wtdTable.length > 0 && (
                <OptGroup label="WisDOM Temp Dataset">
                  {wtdTable.map(item => (
                    <Option key={item.name} value={item.name} type="WTD">
                      <Tooltip
                        title={
                          item.description === ''
                            ? item.name
                            : item.description.length > 100
                            ? `${item.description.slice(0, 100)}...`
                            : item.description
                        }
                        placement="bottom"
                      >
                        {item.name}
                      </Tooltip>
                    </Option>
                  ))}
                </OptGroup>
              )}
            </Select>
          </Style.FormItem>
          {foundWisdomDate ? (
            <Style.TimeFormItem label="TimeSegment">
              <Form.Item name="timeSegmentUnit">
                <Select
                  className="select-unit"
                  disabled={!nodeData.edit}
                  placeholder="select unit"
                >
                  {DATE_UNITS.map(unit => (
                    <Option value={unit.value}>{unit.label}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="timeSegmentValue">
                <Select
                  className="select-value"
                  disabled={!nodeData.edit || !timeSegmentUnit}
                  placeholder="select value"
                >
                  {timeSegmentUnit ? (
                    DATE_VALUE[timeSegmentUnit].map(dateValue => (
                      <Option value={dateValue}>{dateValue}</Option>
                    ))
                  ) : (
                    <Option />
                  )}
                </Select>
              </Form.Item>
            </Style.TimeFormItem>
          ) : null}
          {showWarning ? (
            <Style.FormItem name="warningMsg" style={{ marginTop: '50px' }}>
              <Alert
                message="Warning"
                icon={warnIcon}
                description={
                  updateTime
                    ? `This is a warning notice about your table not update over a month.  Last update Tiime is : ${updateTime}`
                    : 'This is a warning notice about your table not update over a month.'
                }
                type="warning"
                showIcon
                closable={false}
              />
            </Style.FormItem>
          ) : null}
        </Form>
      </Spin>
    </Style.InsertScroll>
  );
};

DatasetNodeItem.propTypes = {
  data: PropTypes.object,
};

DatasetNodeItem.defaultProps = {
  data: {},
};

export default DatasetNodeItem;
