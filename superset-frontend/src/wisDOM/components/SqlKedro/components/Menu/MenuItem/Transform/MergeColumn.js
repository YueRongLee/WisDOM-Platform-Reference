/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Spin, Form, Select, Input } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { TableApi } from '~~apis/';
import { FUNCTIONS, INPUT_RULES, DATAFLOW_TYPE } from '~~constants/index';
import * as Style from './style';

const MergeColumn = ({
  nodeParents,
  nodeData,
  data,
  setData,
  setSelectFinish,
  setFocusNode,
  //   schemaLoading,
  setNodeChange,
}) => {
  const [tableInfo, setTableInfo] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState();
  const [form] = Form.useForm();

  const handleSetDataArg = async setNewArg => {
    if (setNewArg !== undefined) {
      // 輸入異常不存
      const newArg = setNewArg;

      let checkOK = false;
      let checkStatus = false;
      if (newArg.separator && newArg.fields.length >= 2 && newArg.newColumn) {
        checkOK = true;
      }
      //   newArg.check = checkOK ? undefined : 'error';

      const thisNode = data.nodes.filter(e => e.id === nodeData.id);

      if (!checkOK && thisNode[0].check === undefined) {
        thisNode[0].check = 'error';
        checkStatus = true;
      } else if (checkOK && thisNode[0].check === 'error') {
        thisNode[0].check = undefined;
        checkStatus = true;
      }

      if (checkStatus) {
        thisNode[0].args = setNewArg;
        setNodeChange(thisNode[0]);
      } else {
        setSelectFinish(false);
        const index = data.nodes.findIndex(e => e.id === nodeData.id);
        const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
        const newData = FUNCTIONS.SET_DATA(
          data,
          nodeData,
          index,
          nodeData.id,
          getArgNode[0],
          newArg,
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
  };

  const getTableColumns = async tableName => {
    setLoading(true);
    try {
      const result = await TableApi.getAllowedTableColumns(tableName);
      setTableInfo({
        tableName: result && result.table ? result.table.name : '',
        columns: result && result.table ? result.table.columns : [],
        lastUpdateTime: result && result.lastUpdateTime,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getSchema = id => {
    const index = data.nodes.findIndex(e => e.id === id);
    return { columns: data.nodes[index].schema };
  };

  const getMergeNumber = () => {
    const nodes = data.nodes.filter(
      e =>
        e.args &&
        e.args.classification ===
          DATAFLOW_TYPE.TRANSFORM.props.MERGECOLUMN.value,
    );
    if (nodes.length <= 1) {
      return 1;
    }
    return nodes.length;
  };

  const setFormData = () => {
    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    if (index !== -1) {
      const nodeArg = data.nodes[index].args;
      // check status

      if (nodeArg) {
        form.setFieldsValue({
          column: nodeArg.fields,
          separator: nodeArg.separator,
          newColumnName:
            nodeArg.newColumn || `merge_column_${getMergeNumber()}`,
        });
      }

      if (!nodeArg.newColumn) {
        nodeArg.newColumn = `merge_column_${getMergeNumber()}`;
        handleSetDataArg(nodeArg);
      }

      if (!nodeArg.fields || nodeArg.fields.length < 2) {
        setErrorMsg('Please select 2 columns.');
      }
    }
  };

  useEffect(() => {
    if (
      nodeParents.type === undefined ||
      (nodeParents.columns && nodeParents.columns.length !== 0)
    ) {
      getTableColumns(
        nodeParents.full_name === undefined
          ? nodeParents.name
          : nodeParents.args.table_name,
      );
    } else {
      setTableInfo(getSchema(nodeParents.id));
    }
    setFormData();
  }, []);

  const handleOnBlur = (type, value) => {
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter !== undefined) {
      if (nodeFilter[0].args === undefined) {
        nodeFilter[0].args = '';
      }
      const setNewArg = nodeFilter[0].args;
      switch (type) {
        case 'separator':
          setNewArg.separator = value;
          break;
        case 'newColumnName':
          setNewArg.newColumn = value;
          break;
        // case 'column':
        //   setNewArg.fields = form.getFieldValue('column');
        //   break;
        default:
          break;
      }
      handleSetDataArg(setNewArg);
    }
  };

  const handleSelect = value => {
    if (value.length < 2) {
      setErrorMsg('Please select 2 columns.');
    } else {
      setErrorMsg(undefined);
    }
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter !== undefined) {
      if (nodeFilter[0].args === undefined) {
        nodeFilter[0].args = '';
      }
      const setNewArg = nodeFilter[0].args;
      setNewArg.fields = value;
      handleSetDataArg(setNewArg);
    }
  };

  return (
    <Style.InsertScroll>
      <div style={{ color: '#00000099', margin: '20px 0 0 20px' }}>
        Generate a new column by merging two selected columns
      </div>
      {/* schemaLoading */}
      <Spin spinning={isLoading}>
        <Form form={form} scrollToFirstError layout="vertical">
          <Form.Item
            label="Source Columns"
            name="column"
            rules={[{ required: true, message: 'Please select 2 columns.' }]}
            tooltip={{
              title: 'You can sort it by clicking order',
              icon: <InfoCircleOutlined />,
            }}
            validateStatus={errorMsg ? 'error' : 'success'}
            help={errorMsg || null}
            style={{ padding: '15px 24px' }}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Please select 2 Column"
              disabled={!nodeData.edit}
              onChange={handleSelect}
            >
              {tableInfo.columns &&
                tableInfo.columns.map(d => (
                  <Select.Option key={d.name} value={d.name}>
                    {`${d.name}(${d.type})`}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Separator"
            name="separator"
            style={{ padding: '15px 24px' }}
          >
            <Input
              disabled={!nodeData.edit}
              placeholder="Input a Separator"
              maxLength={INPUT_RULES.COLUMN_DESCRIPTION.value}
              onBlur={e => handleOnBlur('separator', e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="New Column name"
            name="newColumnName"
            rules={[
              { required: true, message: 'Please input a new column name.' },
            ]}
            style={{ padding: '15px 24px' }}
          >
            <Input
              disabled={!nodeData.edit}
              style={{ width: '50%' }}
              placeholder="Input a Separator"
              maxLength={INPUT_RULES.COLUMN_NAME.value}
              onBlur={e => handleOnBlur('newColumnName', e.target.value)}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Style.InsertScroll>
  );
};

export default MergeColumn;
