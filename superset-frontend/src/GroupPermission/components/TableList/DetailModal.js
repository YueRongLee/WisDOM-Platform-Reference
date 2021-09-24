/* eslint-disable no-restricted-imports */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Modal, Form, Alert, Input, Radio } from 'antd';
import { DATE_TYPE, PREVIEW_STATUS, INPUT_RULES } from '~~constants/index';

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

const DetailModal = ({ modal }) => {
  const [error, setError] = useState(false);
  const [form] = Form.useForm();

  const handleBeforeLeave = () => {
    setError(false);
    form.resetFields();
    modal.closeModal();
  };

  useEffect(() => {
    if (modal.visibel) {
      form.setFieldsValue({});
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
    >
      {error ? (
        <div style={{ marginBottom: 24 }}>
          <Alert message={error} type="Error" showIcon />
        </div>
      ) : null}
      <Form {...formItemLayout} form={form}>
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

export default DetailModal;
