/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Select, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import './JoinNodeStyle.less';

const formItemLayout = {
  labelCol: {
    xs: { span: 0 },
    sm: { span: 0 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
};

const JoinNodeModal = ({
  payload,
  setPayload,
  modalProps,
  tables,
  formRef,
  disabled,
}) => {
  const [form] = Form.useForm();
  formRef(form);

  useEffect(() => {
    if (modalProps.visible) {
      const newPayload = payload && payload.length ? payload : [{}]; // 預設帶一筆
      form.setFieldsValue({ payload: newPayload });
    }
  }, [modalProps.visible]);

  const handleBeforeLeave = () => {
    form.resetFields();
    modalProps.onCancel();
  };

  const handleSave = data => {
    setPayload(data);
    modalProps.onOk(data);
    handleBeforeLeave();
  };

  return (
    <Modal
      {...modalProps}
      title="Join"
      onCancel={handleBeforeLeave}
      footer={
        <Space align="end">
          <Button onClick={handleBeforeLeave}>Cancel</Button>
          <Button type="primary" onClick={form.submit}>
            Ok
          </Button>
        </Space>
      }
      width={800}
      destroyOnClose
    >
      <Form
        {...formItemLayout}
        form={form}
        name="joinpayload"
        onFinish={handleSave}
        scrollToFirstError
        initialValues={{
          payload: payload && payload.length ? payload : [{}], // 預設帶一筆
        }}
      >
        {() => (
          <Form.List name="payload">
            {(fields, { add, remove }) => (
              <>
                <div className="joinRow header" align="center">
                  {tables.map((table, idx) => (
                    <>
                      {idx !== 0 && (
                        <Form.Item className="equalIcon hidden">=</Form.Item>
                      )}
                      <Form.Item>{table.name}</Form.Item>
                      {!disabled && form.getFieldValue('payload').length > 1 && (
                        <Form.Item className="delbutton hidden">
                          <MinusCircleOutlined />
                        </Form.Item>
                      )}
                    </>
                  ))}
                </div>
                {fields.map(field => (
                  <div key={field.key} className="joinRow" align="center">
                    {tables.map((table, idx) => (
                      <>
                        {idx !== 0 && (
                          <Form.Item className="equalIcon">=</Form.Item>
                        )}
                        <Form.Item
                          {...field}
                          name={[field.name, table.name]}
                          fieldKey={[field.fieldKey, table.guid]}
                          rules={[
                            () => ({
                              // 驗證至少選擇兩個欄位JOIN
                              validator() {
                                const thisRowVal = form.getFieldValue([
                                  'payload',
                                  field.name,
                                ]);
                                if (
                                  thisRowVal &&
                                  Object.values(thisRowVal).filter(
                                    v => v !== undefined,
                                  ).length > 1
                                ) {
                                  return Promise.resolve();
                                }
                                // eslint-disable-next-line prefer-promise-reject-errors
                                return Promise.reject(
                                  'Choose at lease two columns to join',
                                );
                              },
                              validateTrigger: ['onSubmit', 'onClick'],
                            }),
                          ]}
                        >
                          <Select
                            disabled={disabled}
                            placeholder="Select a column"
                          >
                            {table.columns
                              .filter(col => col.selected)
                              .map(c => (
                                <Select.Option key={c.guid} value={c.guid}>
                                  {c.name}
                                </Select.Option>
                              ))}
                          </Select>
                        </Form.Item>
                      </>
                    ))}
                    {!disabled && form.getFieldValue('payload').length > 1 && (
                      <Form.Item className="delbutton" {...field}>
                        <MinusCircleOutlined
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      </Form.Item>
                    )}
                  </div>
                ))}
                {!disabled && (
                  <Button
                    type="dashed"
                    onClick={() => {
                      add();
                    }}
                    block
                  >
                    <PlusOutlined />
                  </Button>
                )}
              </>
            )}
          </Form.List>
        )}
      </Form>
    </Modal>
  );
};

JoinNodeModal.propTypes = {
  payload: PropTypes.arrayOf(PropTypes.shape({})),
  setPayload: PropTypes.func,
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  tables: PropTypes.arrayOf(PropTypes.shape({})),
  formRef: PropTypes.func,
  disabled: PropTypes.bool,
};

JoinNodeModal.defaultProps = {
  payload: [],
  setPayload: () => null,
  tables: [],
  formRef: () => null,
  disabled: false,
};

export default JoinNodeModal;
