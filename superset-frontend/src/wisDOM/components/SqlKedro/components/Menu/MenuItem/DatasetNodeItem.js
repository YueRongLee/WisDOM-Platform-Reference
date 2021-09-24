/* eslint-disable no-restricted-imports */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Spin, Form, Input, Select } from 'antd';
// import { useQuery } from '~~hooks/';
import {
  // UserApi,
  TableApi,
} from '~~apis/';
// import { SYSTEM_TYPE } from '~~constants/index';
import * as Style from './style';
import './Menu.less';

const { Option, OptGroup } = Select;

const DatasetNodeItem = ({
  selectPage,
  setSelectPage,
  nodeData,
  setNodeChange,
  setSchema,
  data,
  dataset,
  setDataSet,
  groupId,
  // setData,
  // setSelectFinish,
  // setShowColumns,
  // setFocusNode,
}) => {
  const [form] = Form.useForm();
  const [inputClick, setInputClick] = useState(false);
  const [inputChange, setInputChange] = useState(undefined);
  const [groupAtlasTable, setGroupAtlasTable] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  // const getEntityListQuery = useQuery(UserApi.getGroupTable);

  const handleSelectNodeType = type => {
    setSelectPage(type.toLowerCase()); // 小寫
  };

  const handleSelectDataSet = async value => {
    setSchema(value);
    setDataSet(value);
  };

  const getGroupPermissionTable = async () => {
    setTableLoading(true);
    try {
      const result = await TableApi.getTableColumns(groupId);
      setGroupAtlasTable(result);
    } catch (e) {
      console.log(e);
    } finally {
      setTableLoading(false);
      form.setFieldsValue({ dataset });
    }
  };

  useEffect(() => {
    if (nodeData.name !== undefined && nodeData.name !== null) {
      form.setFieldsValue({
        name: nodeData.name,
        nodetype: nodeData.type,
        dataset: nodeData.name,
      });
      handleSelectNodeType(
        nodeData.type === 'Empty' ? 'dataset' : nodeData.type,
      );
      handleSelectDataSet(nodeData.name);
    }
  }, [nodeData]);

  useEffect(() => {
    form.setFieldsValue({ dataset });
    getGroupPermissionTable();
  }, [groupId]);

  useEffect(() => {
    if (inputClick === false && inputChange !== undefined) {
      setNodeChange(inputChange);
      setInputChange(undefined); // 判斷完清空
      // form.setFieldsValue({ dataset });
    }
    // form.setFieldsValue({ dataset });
  }, [inputClick]);

  const hangeValueChange = changeValue => {
    if (changeValue !== undefined) {
      const changeColumn = Object.keys(changeValue)[0];
      if (changeColumn === 'nodetype') {
        handleSelectDataSet(Object.values(changeValue)[0]);
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
      setInputChange(newNode);
      if (changeColumn === 'nodetype') {
        setInputChange(undefined); // type可以直接改
        setNodeChange(newNode);
      } else {
        setInputChange(newNode);
      }
    }
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
            dataset: nodeData.name,
          }}
          onValuesChange={hangeValueChange}
        >
          <Form.Item label="Name" name="name" className="node-form-item">
            <Input
              data-test="name"
              onFocus={() => setInputClick(true)}
              onBlur={() => setInputClick(false)}
            />
          </Form.Item>
          <Form.Item
            label="Node Type"
            name="nodetype"
            className="node-form-item"
          >
            <Select showSearch onChange={value => handleSelectNodeType(value)}>
              <Option value="dataset">Dataset</Option>
              <Option value="cleansing">Cleansing</Option>
              <Option value="transform">Transform</Option>
              <Option value="target">Target</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Dataset" name="dataset" className="node-form-item">
            <Select
              showSearch
              onChange={value => handleSelectDataSet(value)}
              filterOption={(input, option) =>
                option.children
                  ? option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  : ''
              }
              disabled={tableLoading}
              defaultValue={dataset}
            >
              <OptGroup label="Selected">
                {data.nodes.map(item => (
                  <Option key={item.id} value={item.full_name}>
                    {item.full_name}
                  </Option>
                ))}
              </OptGroup>
              <OptGroup label="Permission">
                {groupAtlasTable.map(item => (
                  <Option key={item.name} value={item.name}>
                    {item.name}
                  </Option>
                ))}
              </OptGroup>
            </Select>
          </Form.Item>
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
