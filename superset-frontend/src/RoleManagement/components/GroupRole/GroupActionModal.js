/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Space, Button, Form } from 'antd';

// const formItemLayout = {
//   labelCol: {
//     xs: { span: 24 },
//     sm: { span: 10 },
//   },
//   wrapperCol: {
//     xs: { span: 24 },
//     sm: { span: 14 },
//   },
// };

const GroupActionModal = ({ modal }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleShowTitle = type => {
    if (type === 'view') return 'View Role';
    return 'Edit Role';
  };

  const handleBeforeLeave = () => {
    modal.closeModal();
    setLoading(false);
  };

  const handleOKClick = () => {
    if (modal.modalData && modal.modalData.type) {
      switch (modal.modalData.type) {
        case 'view':
          // call api
          break;
        case 'edit':
          // call api
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    if (modal.visibel) {
      setLoading(false);
    }
  }, [modal.visible]);

  return (
    <Modal
      title={
        modal.modalData && modal.modalData.type
          ? handleShowTitle(modal.modalData.type)
          : ''
      }
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '75vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的75％就scroll
      onCancel={handleBeforeLeave}
      footer={
        <Space align="end">
          <Button disabled={loading} onClick={handleBeforeLeave}>
            Cancel
          </Button>
          <Button
            loading={loading}
            type="primary"
            onClick={() => handleOKClick()}
          >
            OK
          </Button>
        </Space>
      }
      width={1000}
      destroyOnClose
      closable={!loading}
      maskClosable={!loading}
    >
      <Form form={form}>
        <Form.Item label="Role Name">
          {modal.modalData && modal.modalData.data.name}
        </Form.Item>
        <Form.Item label="Role Description">
          {modal.modalData && modal.modalData.data.description}
        </Form.Item>
        <Form.Item label="Role Permission">checkbox list</Form.Item>
      </Form>
    </Modal>
  );
};

GroupActionModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  onUploadExist: PropTypes.func,
};

GroupActionModal.defaultProps = {
  onUploadExist: () => null,
};

export default GroupActionModal;
