/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useEffect } from 'react';
import { Form, Select, Input } from 'antd';
import PropTypes from 'prop-types';
// import { TableApi } from '~~apis/';

import * as Style from './style';

const { Option } = Select;

const ConditionNodeItem = ({ selectPage, nodeData, data }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (nodeData.name !== undefined && nodeData.name !== null) {
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      if (index !== -1) {
        const nodeArg = data.nodes[index].args;
        form.setFieldsValue({
          name: nodeData.name,
          nodetype: nodeData.type,
          classification: nodeArg.classification,
        });
      }
    }
  }, [nodeData]);

  return (
    // <Spin spinning={tableLoading}>
    <Form
      form={form}
      className="node-wrapper"
      initialValues={{
        name: nodeData.name,
        nodetype: selectPage,
        action: nodeData.action,
      }}
    >
      <Style.FormItem label="Name" name="name">
        <Input disabled />
      </Style.FormItem>
      <Style.FormItem label="Node Type" name="nodetype">
        <Select showSearch disabled>
          <Option value="trigger">Trigger</Option>
          <Option value="action">Action</Option>
        </Select>
      </Style.FormItem>
      <Style.FormItem label="Trigger/Action type" name="classification">
        <Select showSearch disabled />
      </Style.FormItem>
    </Form>
    // </Spin>
  );
};

ConditionNodeItem.propTypes = {
  data: PropTypes.object,
};

ConditionNodeItem.defaultProps = {
  data: {},
};

export default ConditionNodeItem;
