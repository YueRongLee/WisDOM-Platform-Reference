/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Select } from 'antd';
import { INPUT_RULES, FLOW_NAME_RULES } from '~~constants/index';

import * as Style from './style';

const { Option } = Select;

const NewNodeItem = ({ setSelectPage, nodeData, setNodeChange }) => {
  const [form] = Form.useForm();
  const [inputClick, setInputClick] = useState(false);
  const [inputChange, setInputChange] = useState();

  const handleSelectNodeType = value => {
    setSelectPage(value.toLowerCase());
  };

  useEffect(() => {
    if (nodeData.name !== undefined && nodeData.name !== null) {
      handleSelectNodeType(
        nodeData.type === 'Empty' ? 'new_node' : nodeData.type,
      );
      form.setFieldsValue({
        name: nodeData.name,
        nodetype: nodeData.type,
      });
    }
  }, [nodeData]);

  const handleValueChange = changeValue => {
    const changeKey = Object.keys(changeValue)[0];
    const changeValues = Object.values(changeValue)[0];

    if (changeValue !== undefined) {
      const newNode = {
        id: nodeData.id,
        name: changeKey === 'name' ? changeValues : nodeData.name,
        type:
          changeKey === 'nodetype'
            ? changeValues.charAt(0).toUpperCase() + changeValues.slice(1) // 開頭改大寫
            : nodeData.type,
      };
      setInputChange(newNode);
      if (changeKey === 'nodetype') {
        handleSelectNodeType(changeValues);
        setInputChange(undefined); // type可以直接改
        setNodeChange(newNode);
      }
    }
  };

  useEffect(() => {
    if (inputClick === false && inputChange !== undefined) {
      setNodeChange(inputChange);
      setInputChange(undefined); // 判斷完清空
    }
  }, [inputClick]);

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
      <Form
        form={form}
        className="node-wrapper"
        onValuesChange={handleValueChange}
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
            onFocus={() => setInputClick(true)}
            //   onBlur={() => setInputClick(false)}
            disabled={!nodeData.edit}
            maxLength={INPUT_RULES.TABLE_NAME.value}
            onBlur={() => handleValidate()}
          />
        </Style.FormItem>
        <Style.FormItem label="Node Type" name="nodetype">
          <Select
            onChange={value => handleSelectNodeType(value)}
            disabled={!nodeData.edit}
          >
            <Option value="dataset">Dataset</Option>
            <Option value="cleansing">Cleansing</Option>
            <Option value="transform">Transform</Option>
            <Option value="target">Target</Option>
          </Select>
        </Style.FormItem>
      </Form>
    </Style.InsertScroll>
  );
};

NewNodeItem.propType = {
  setSelectPage: PropTypes.func,
  nodeData: PropTypes.object,
  setNodeChange: PropTypes.func,
};

NewNodeItem.defaultProps = {
  nodeData: {},
  setSelectPage: () => null,
  setNodeChange: () => null,
};

export default NewNodeItem;
