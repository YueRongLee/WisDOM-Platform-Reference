/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Modal, Form, Alert, Radio, Input, Space, Button, message } from 'antd';
import {
  DATE_TYPE,
  PREVIEW_STATUS,
  INPUT_RULES,
  ROLEPERMISSION,
} from '~~constants/index';
import { useQuery } from '~~hooks/';
import { UserApi } from '~~apis/';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 10 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));
const DetailModal = ({ modal, onFinish }) => {
  const [error, setError] = useState(false);
  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);
  const setGroupAllowQuery = useQuery(UserApi.setGroupAllow);
  const setGroupRejectQuery = useQuery(UserApi.setGroupReject);

  const handleBeforeLeave = () => {
    setError(false);
    form.resetFields();
    modal.closeModal();
  };

  const handleChange = async data => {
    setLoading(true);
    try {
      if (data.allowed === 1) {
        const req = {
          groupId: modal.modalData.groupId,
          ...data,
        };
        await setGroupAllowQuery.exec(req);
      } else {
        const req = {
          groupId: modal.modalData.groupId,
          rejectReason: data.rejectReason,
        };
        await setGroupRejectQuery.exec(req);
      }
      message.success(
        `This table has been ${
          data.allowed ? 'approved' : 'rejected'
        } successfully!`,
      );
      handleBeforeLeave();
      onFinish();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modal.visible) {
      form.setFieldsValue({ ...modal.modalData, allowed: 1, rejectReason: '' });
    }
  }, [modal.visible]);

  return (
    <Modal
      title={`Grant Permission(${
        modal.modalData && modal.modalData.groupName
      })`}
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的70％就scroll
      onCancel={handleBeforeLeave}
      width={600}
      destroyOnClose
      footer={
        <Space align="end">
          <Button onClick={handleBeforeLeave}>Cancel</Button>
          {modal.modalData &&
          modal.modalData.status === PREVIEW_STATUS.APPLYING.value ? (
            <Button
              type="primary"
              onClick={form.submit}
              loading={isLoading}
              disabled={
                !ROLEPERMISSION.checkPermission(
                  SYSTEMLIST,
                  ROLEPERMISSION.setting.groupPermission.approve.value,
                )
              }
            >
              Confirm
            </Button>
          ) : (
            <Button type="primary" onClick={handleBeforeLeave}>
              Ok
            </Button>
          )}
        </Space>
      }
    >
      {error ? (
        <div style={{ marginBottom: 24 }}>
          <Alert message={error} type="Error" showIcon />
        </div>
      ) : null}
      <Form {...formItemLayout} form={form} onFinish={handleChange}>
        {() => (
          <>
            <Form.Item label="Group Name">
              {modal.modalData.groupName}
            </Form.Item>
            <Form.Item label="User Name">{modal.modalData.owner}</Form.Item>
            <Form.Item label="Reason">{modal.modalData.reason}</Form.Item>
            <Form.Item label="Created Time">
              {moment(modal.modalData.createdAt).format(DATE_TYPE.DATE_TIME)}
            </Form.Item>
            <Form.Item label="Update Time">
              {moment(modal.modalData.updateAt).format(DATE_TYPE.DATE_TIME)}
            </Form.Item>
            {modal.modalData.status === PREVIEW_STATUS.APPLYING.value ? (
              <>
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
                    disabled={
                      !ROLEPERMISSION.checkPermission(
                        SYSTEMLIST,
                        ROLEPERMISSION.setting.groupPermission.approve.value,
                      )
                    }
                  />
                </Form.Item>
                {!form.getFieldValue('allowed') ? (
                  <Form.Item
                    label="Reject Reason"
                    name="rejectReason"
                    rules={[
                      {
                        required: true,
                        message: 'Please input reject reason!',
                      },
                    ]}
                    shouldUpdate
                  >
                    <Input.TextArea
                      rows={4}
                      maxLength={INPUT_RULES.REASON.value}
                    />
                  </Form.Item>
                ) : null}
              </>
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
