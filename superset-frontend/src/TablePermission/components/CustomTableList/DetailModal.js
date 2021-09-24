/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Button,
  Form,
  Space,
  Input,
  Alert,
  Radio,
  message,
  Table,
  Tag,
} from 'antd';
import ReactGA from 'react-ga';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { MetadataApi } from '~~apis/';
import { useQuery } from '~~hooks/';
import { INPUT_RULES, PREVIEW_STATUS } from '~~constants/index';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
  },
  {
    title: 'Type',
    dataIndex: 'dataType',
  },
  {
    title: 'Comment',
    dataIndex: 'comment',
  },
];

const DetailModal = ({ modal, onFinish }) => {
  const [error, setError] = useState(false);
  const [form] = Form.useForm();
  const { trackEvent } = useMatomo();
  const grantUserDefinedPermissionQuery = useQuery(
    MetadataApi.grantUserDefinedPermission,
  );

  const [allowed, setAllowed] = useState(1);

  useEffect(() => {
    if (modal.visible) {
      form.setFieldsValue({ ...modal.modalData, allowed: 1, rejectReason: '' });
    }
  }, [modal.visible]);

  const handleBeforeLeave = () => {
    setError(false);
    form.resetFields();
    modal.closeModal();
  };

  const handleChange = async data => {
    ReactGA.event({
      category: 'Grant',
      action: `Grant user-defined table permission status is ${data.allowed}`,
    });
    trackEvent({
      category: 'Grant',
      action: `Grant user-defined table permission status is ${data.allowed}`,
    });
    try {
      const req = {
        seqId: modal.modalData.seqId,
        ...data,
      };
      await grantUserDefinedPermissionQuery.exec(req);
      message.success(
        `This table has been ${
          data.allowed ? 'approved' : 'rejected'
        } successfully!`,
      );
      handleBeforeLeave();
      onFinish();
    } catch (e) {
      console.log(e);
    }
  };

  const hangeValueChange = changeValue => {
    const changeKey = Object.keys(changeValue)[0];
    const changeValues = Object.values(changeValue)[0];

    if (changeKey === 'allowed') {
      setAllowed(changeValues);
    }
  };

  return (
    <Modal
      id="table-perission-grant-permission-modal"
      title={`Grant Permission(${
        modal.modalData && modal.modalData.tableName
      })`}
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的70％就scroll
      onCancel={handleBeforeLeave}
      width={600}
      footer={
        <Space align="end">
          <Button
            disabled={grantUserDefinedPermissionQuery.isLoading}
            onClick={handleBeforeLeave}
          >
            Cancel
          </Button>
          <Button
            loading={grantUserDefinedPermissionQuery.isLoading}
            type="primary"
            onClick={form.submit}
          >
            Confirm
          </Button>
        </Space>
      }
      destroyOnClose
      closable={!grantUserDefinedPermissionQuery.isLoading}
      maskClosable={!grantUserDefinedPermissionQuery.isLoading}
    >
      {error ? (
        <div style={{ marginBottom: 24 }}>
          <Alert message={error} type="Error" showIcon />
        </div>
      ) : null}
      <Form
        {...formItemLayout}
        form={form}
        name="auth"
        onFinish={handleChange}
        scrollToFirstError
        onValuesChange={hangeValueChange}
      >
        {() => (
          <>
            <Form.Item label="Table Name">
              {modal.modalData.tableName}
            </Form.Item>
            <Form.Item label="Table Comment">
              {modal.modalData.table.comment}
            </Form.Item>
            <Form.Item label="User Name">
              {modal.modalData.userEnName}
            </Form.Item>
            <Form.Item label="User Id">
              {modal.modalData.uploadUserId}
            </Form.Item>
            <Form.Item label="Data Domain">
              {modal.modalData.categories &&
                modal.modalData.categories.map(c => (
                  <Tag className="listTag2">{c}</Tag>
                ))}
            </Form.Item>
            <Form.Item label="Columns">
              <Table
                columns={columns}
                dataSource={modal.modalData.table.columns}
                scroll={{ y: 500 }}
                pagination={false}
                rowKey="name"
              />
            </Form.Item>
            <Form.Item
              label="Status"
              name="allowed"
              rules={[{ required: true }]}
            >
              <Radio.Group
                options={[
                  {
                    label: 'Approve',
                    value: PREVIEW_STATUS.ALLOWED.value,
                  },
                  {
                    label: 'Reject',
                    value: PREVIEW_STATUS.REJECT.value, // 依後端需求調整
                  },
                ]}
              />
            </Form.Item>
            {allowed === PREVIEW_STATUS.REJECT.value ? (
              <Form.Item
                label="Reject Reason"
                name="rejectReason"
                rules={[
                  { required: true, message: 'Please input reject reason!' },
                ]}
                shouldUpdate
              >
                <Input.TextArea rows={4} maxLength={INPUT_RULES.REASON.value} />
              </Form.Item>
            ) : null}
          </>
        )}
      </Form>
    </Modal>
  );
};

DetailModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
};

DetailModal.defaultProps = {};

export default DetailModal;
