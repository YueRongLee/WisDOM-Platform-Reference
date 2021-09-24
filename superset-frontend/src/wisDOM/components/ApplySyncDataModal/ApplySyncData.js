/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Input, Select, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { DB_TYPE, INPUT_RULES, NUMBER_RULES } from '~~constants/index';
import { SyncDataApi } from '~~apis/';

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

const ApplySyncData = ({ modal }) => {
  const [form] = Form.useForm();
  const [categoryList, setCategoryList] = useState([]);
  const dbOptions = DB_TYPE.getOptionList().map(type => ({
    value: type.value,
  }));

  const getCategoryList = async () => {
    try {
      const result = await SyncDataApi.getCategoryList();
      const categories = result.categories.map(value => ({
        value,
      }));
      setCategoryList(categories);
    } catch (e) {
      console.log(e);
    }
  };

  const applySyncData = async data => {
    try {
      await SyncDataApi.applySyncData(data);
      modal.closeModal();
    } catch (e) {
      console.log(e);
    }
  };

  const handleBeforeLeave = () => {
    // setDataList([]);
    form.resetFields();
    modal.closeModal();
  };

  const handleFinish = async data => {
    applySyncData(data);
  };

  useEffect(() => {
    getCategoryList();
  }, []);

  return (
    <Modal
      className="ApplySyncDataModal"
      title="Sync Data request"
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的70％就scroll
      onCancel={handleBeforeLeave}
      footer={
        <Space align="end">
          <Button onClick={handleBeforeLeave}>Cancel</Button>
          <Button type="primary" onClick={form.submit}>
            Ok
          </Button>
        </Space>
      }
      width={900}
      destroyOnClose
    >
      <Form
        {...formItemLayout}
        form={form}
        name="import"
        onFinish={handleFinish}
        scrollToFirstError
      >
        {() => (
          <>
            <Form.Item
              name="host"
              label="Host"
              rules={[{ required: true, message: 'Please input a IP' }]}
            >
              <Input
                placeholder="10.10.1.5"
                style={{ width: '55%' }}
                maxLength={INPUT_RULES.HOST.value}
              />
            </Form.Item>
            <Form.Item
              name="port"
              label="Port"
              rules={[
                { required: true, message: 'Please Input a number' },
                {
                  pattern: NUMBER_RULES.pattern,
                  message: 'Accept number(0-9) only',
                },
              ]}
            >
              <Input
                placeholder="Input a number"
                style={{ width: '55%' }}
                maxLength={INPUT_RULES.PORT.value}
              />
            </Form.Item>
            <Form.Item
              name="type"
              label="DB Type"
              rules={[{ required: true, message: 'Please Select a type' }]}
            >
              <Select
                placeholder="Select a type"
                style={{ width: '55%' }}
                options={dbOptions}
              />
            </Form.Item>
            <Form.Item
              name="database"
              label="DB Source"
              rules={[{ required: true, message: 'Please Enter a Source' }]}
            >
              <Select
                mode="tags"
                tokenSeparators={[',']}
                placeholder="Select a Source"
                style={{ width: '55%' }}
              />
            </Form.Item>
            <Form.Item
              name="name"
              label="User Name"
              rules={[
                { required: true, message: 'Please input your username!' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ float: 'right' }} />}
                placeholder="Username"
                maxLength={INPUT_RULES.USER_NAME.value}
                style={{ width: '55%' }}
              />
            </Form.Item>
            <Form.Item label="Password">
              <Space align="center">
                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: 'Please input a password',
                    },
                  ]}
                >
                  <Input.Password
                    placeholder="Input a password"
                    prefix={<LockOutlined style={{ float: 'right' }} />}
                    maxLength={INPUT_RULES.USER_PW.value}
                  />
                </Form.Item>
              </Space>
            </Form.Item>
            <Form.Item
              name="category"
              label="Data Domain"
              rules={[
                { required: true, message: 'Please Select a data domain' },
              ]}
            >
              <Select
                placeholder="Select a data domain"
                style={{ width: '55%' }}
                options={categoryList}
              />
            </Form.Item>
            <Form.Item name="remark" label="Remark">
              <Input.TextArea
                placeholder="Input a Description"
                style={{ width: '80%' }}
                maxLength={INPUT_RULES.TABLE_DESCRIPTION.value}
                autoSize={{ minRows: 4, maxRows: 4 }}
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

ApplySyncData.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
};

ApplySyncData.defaultProps = {};

export default ApplySyncData;
