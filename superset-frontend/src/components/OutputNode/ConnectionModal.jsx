/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Space, Input, Alert, Select, Row } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { DB_TYPE, INPUT_RULES, NUMBER_RULES } from '~~constants/index';

const dbOptions = DB_TYPE.getOptionList().map(type => ({
  value: type.value,
}));

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};

const ConnectionModal = ({ visible, onOk, onCancel, oData, editMode }) => {
  const [error, setError] = useState();
  const [editable, setEditable] = useState(!editMode || !oData.dbInfo.host); // sqlDiagram圖表編輯模式(且有連線資訊)時，連線資訊預設是不可編輯
  const [form] = Form.useForm();

  useEffect(() => {
    setEditable(!editMode || !oData.dbInfo.host);
  }, [editMode, oData.dbInfo.host]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        ...oData.dbInfo,
        dbType: oData.dbInfo.dbType || DB_TYPE.props.postgres.value,
        password: oData.dbInfo.password
          ? atob(oData.dbInfo.password)
          : undefined,
      });
    }
  }, [visible, oData.dbInfo]);

  const handleBeforeLeave = () => {
    setError();
    setEditable(!editMode || !oData.dbInfo.host);
    form.resetFields();
  };

  const handleCancel = () => {
    handleBeforeLeave();
    onCancel();
  };

  const handleFinish = data => {
    handleBeforeLeave();
    if (editable) {
      onOk(data);
    } else {
      handleCancel();
    }
  };

  return (
    <Modal
      title="Connection Information"
      visible={visible}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的70％就scroll
      onCancel={handleCancel}
      footer={
        <Space align="end">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" onClick={form.submit}>
            Ok
          </Button>
        </Space>
      }
      destroyOnClose
      width={600}
    >
      {error ? (
        <div style={{ marginBottom: 24 }}>
          <Alert message={error} type="error" showIcon />
        </div>
      ) : null}
      {!editable && (
        <Row justify="end">
          <Button
            type="text"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => setEditable(true)}
          />
        </Row>
      )}
      <Form
        {...formItemLayout}
        form={form}
        name="consume"
        onFinish={handleFinish}
        scrollToFirstError
      >
        <Form.Item
          label="Host"
          name="host"
          rules={[{ required: true, message: 'Please input a IP!' }]}
        >
          <Input
            disabled={!editable}
            placeholder="10.10.1.5"
            maxLength={INPUT_RULES.HOST.value}
          />
        </Form.Item>

        <Form.Item
          label="Port"
          name="port"
          rules={[
            { required: true, message: 'Please Input a number' },
            {
              pattern: NUMBER_RULES.pattern,
              message: 'Accept number(0-9) only',
            },
          ]}
        >
          <Input
            disabled={!editable}
            placeholder="Input a number"
            maxLength={INPUT_RULES.PORT.value}
          />
        </Form.Item>

        <Form.Item
          label="Database"
          name="database"
          rules={[{ required: true, message: 'Please input a Database Name!' }]}
        >
          <Input
            disabled={!editable}
            placeholder="Database Name"
            maxLength={INPUT_RULES.DB_NAME.value}
          />
        </Form.Item>

        <Form.Item
          name="dbType"
          label="DB Type"
          rules={[{ required: true, message: 'Please Select a type' }]}
        >
          <Select disabled placeholder="Select a type" options={dbOptions} />
        </Form.Item>

        {editable ? (
          <>
            <Form.Item
              label="Username"
              name="userName"
              rules={[
                { required: true, message: 'Please input your username!' },
              ]}
            >
              <Input
                placeholder="User Name"
                maxLength={INPUT_RULES.USER_NAME.value}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
              ]}
            >
              <Input.Password
                placeholder="Password"
                maxLength={INPUT_RULES.USER_PW.value}
              />
            </Form.Item>
          </>
        ) : null}
      </Form>
    </Modal>
  );
};

ConnectionModal.propTypes = {
  visible: PropTypes.bool,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  oData: PropTypes.shape({
    key: PropTypes.string,
    value: PropTypes.string,
    selected: PropTypes.bool,
    showName: PropTypes.string,
    dbInfo: PropTypes.shape({
      host: PropTypes.string,
      port: PropTypes.string,
      database: PropTypes.string,
      dbType: PropTypes.string,
      userName: PropTypes.string,
      password: PropTypes.string,
    }),
  }),
  editMode: PropTypes.bool,
};

ConnectionModal.defaultProps = {
  visible: false,
  onOk: () => null,
  onCancel: () => null,
  oData: {
    key: undefined,
    value: undefined,
    selected: undefined,
    showName: undefined,
    dbInfo: {
      host: undefined,
      port: undefined,
      database: undefined,
      dbType: undefined,
      userName: undefined,
      passwoard: undefined,
    },
  },
  editMode: false,
};

export default ConnectionModal;
