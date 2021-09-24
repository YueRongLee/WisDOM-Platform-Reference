/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Space, Input, Select } from 'antd';
import { CategoryApi } from '~~apis/';
import { INPUT_RULES } from '~~constants/index';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 }, // for domain length
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

const CreateModal = ({ modal, memberList, finishApply }) => {
  const [form] = Form.useForm();

  const handleBeforeLeave = () => {
    form.resetFields();
    modal.closeModal();
  };

  const handleApply = async data => {
    try {
      const req = {
        category: data.category,
        userId: data.owner,
      };
      await CategoryApi.addCategory(req);
      handleBeforeLeave();
      finishApply();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Modal
      title="Add Data Domain"
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的70％就scroll
      onCancel={handleBeforeLeave}
      width={600}
      footer={
        <Space align="end">
          <Button onClick={handleBeforeLeave}>Cancel</Button>
          <Button type="primary" onClick={form.submit}>
            Save
          </Button>
        </Space>
      }
    >
      <Form
        {...formItemLayout}
        form={form}
        name="createCategory"
        onFinish={handleApply}
        scrollToFirstError
      >
        <Form.Item
          label="Data Domain Name"
          name="category"
          rules={[
            { required: true, message: 'Please input a data domain name!' },
          ]}
          maxLength={INPUT_RULES.CATEGORY_NAME.value}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Data Domain Owner"
          name="owner"
          rules={[
            { required: true, message: 'Please select a data domain owner!' },
          ]}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {memberList.map(item => (
              <Select.Option value={item.userId}>
                {item.userNameEn}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

CreateModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  selectedGroup: PropTypes.string.isRequired,
  refresh: PropTypes.func,
};

CreateModal.defaultProps = {
  refresh: () => null,
};

export default CreateModal;
