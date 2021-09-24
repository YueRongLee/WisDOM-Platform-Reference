/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Select, Space, Input } from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  MinusOutlined,
  CloseOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { INPUT_RULES } from '~~constants/index';
import './CalculateNodeStyle.less';

const MAP_ALLOWTYPE = [
  'int',
  'long',
  'float',
  'double',
  'bigint',
  'smallint',
  'tinyint',
];

const COMPARISON_OPERATOR_MAP = [
  {
    key: 'ADD',
    name: <PlusOutlined />,
    allowType: MAP_ALLOWTYPE,
  },
  {
    key: 'SUBTRACT',
    name: <MinusOutlined />,
    allowType: MAP_ALLOWTYPE,
  },
  {
    key: 'MULTIPLY',
    name: <CloseOutlined />,
    allowType: MAP_ALLOWTYPE,
  },
  {
    key: 'DIVIDE',
    name: <PercentageOutlined rotate={45} />,
    allowType: MAP_ALLOWTYPE,
  },
];

const CalculateNodeModal = ({
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

  const handleValueChange = (changedValues, allValues) => {
    (changedValues.payload || []).forEach((changedValue, idx) => {
      // 改選table清掉其欄位
      if (
        changedValue &&
        changedValue.tableGuid &&
        Object.keys(changedValue).length === 1
      ) {
        const newPayload = allValues.payload;
        newPayload[idx].columnGuid = undefined;
        form.setFieldsValue({
          payload: newPayload,
        });
      } else if (
        changedValue &&
        changedValue.tableGuid2 &&
        Object.keys(changedValue).length === 1
      ) {
        const newPayload = allValues.payload;
        newPayload[idx].columnGuid2 = undefined;
        form.setFieldsValue({
          payload: newPayload,
        });
      }
    });
  };

  //   const getColumnTypeByFieldName = name => {
  //     const row = form.getFieldValue(['payload', name]);
  //     const columnType = row
  //       ? (
  //           (
  //             tables.find(t => t.guid === row.tableGuid) || { columns: [] }
  //           ).columns.find(c => c.guid === row.columnGuid) || {}
  //         ).type
  //       : undefined;
  //     return columnType;
  //   };

  //   const renderComparisonOperator = field => {
  //     const columnType = getColumnTypeByFieldName(field.name);
  //     return (
  //       columnType &&
  //       COMPARISON_OPERATOR_MAP.filter(o => o.allowType.includes(columnType)).map(
  //         o => (
  //           <Select.Option key={o.key} value={o.key}>
  //             {o.name}
  //           </Select.Option>
  //         ),
  //       )
  //     );
  // };

  return (
    <Modal
      {...modalProps}
      title="Calculate"
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
        form={form}
        name="calculatepayload"
        onFinish={handleSave}
        scrollToFirstError
        initialValues={{
          payload: payload && payload.length ? payload : [{}], // 預設帶一筆
        }}
        onValuesChange={handleValueChange}
      >
        <Form.List name="payload">
          {(fields, { add, remove }) => (
            <>
              {fields.map(field => (
                <Space
                  size={0}
                  key={field.key}
                  className="Calculate-Row"
                  align="center"
                >
                  <Form.Item
                    {...field}
                    name={[field.name, 'tableGuid']}
                    fieldKey={[field.fieldKey, 'tableGuid']}
                    rules={[
                      {
                        required: true,
                        message: 'Required',
                      },
                    ]}
                  >
                    <Select
                      style={{ width: 170 }}
                      disabled={disabled}
                      placeholder="Select a table"
                    >
                      {tables.map(t => (
                        <Select.Option key={t.guid} value={t.guid}>
                          {t.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, 'columnGuid']}
                    fieldKey={[field.fieldKey, 'columnGuid']}
                    rules={[
                      {
                        required: true,
                        message: 'Required',
                      },
                    ]}
                  >
                    <Select
                      style={{ width: 100 }}
                      disabled={disabled}
                      placeholder="column"
                    >
                      {(
                        tables.find(
                          table =>
                            table.guid ===
                            form.getFieldValue([
                              'payload',
                              field.name,
                              'tableGuid',
                            ]),
                        ) || { columns: [] }
                      ).columns
                        .filter(col => col.selected)
                        .map(
                          c =>
                            MAP_ALLOWTYPE.includes(c.type) && (
                              <Select.Option key={c.guid} value={c.guid}>
                                {c.name}
                              </Select.Option>
                            ),
                        )}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, 'comparisonOperator']}
                    fieldKey={[field.fieldKey, 'comparisonOperator']}
                    rules={[
                      {
                        required: true,
                        message: 'Required',
                      },
                    ]}
                  >
                    <Select
                      style={{ width: 70 }}
                      disabled={disabled}
                      placeholder="operator"
                    >
                      {/* {renderComparisonOperator(field)} */}
                      {COMPARISON_OPERATOR_MAP.map(o => (
                        <Select.Option key={o.key} value={o.key}>
                          {o.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, 'tableGuid2']}
                    fieldKey={[field.fieldKey, 'tableGuid2']}
                    rules={[
                      {
                        required: true,
                        message: 'Required',
                      },
                    ]}
                  >
                    <Select
                      style={{ width: 170 }}
                      disabled={disabled}
                      placeholder="Select a table"
                    >
                      {tables.map(t => (
                        <Select.Option key={t.guid} value={t.guid}>
                          {t.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, 'columnGuid2']}
                    fieldKey={[field.fieldKey, 'columnGuid2']}
                    rules={[
                      {
                        required: true,
                        message: 'Required',
                      },
                    ]}
                  >
                    <Select
                      style={{ width: 100 }}
                      disabled={disabled}
                      placeholder="column"
                    >
                      {(
                        tables.find(
                          table =>
                            table.guid ===
                            form.getFieldValue([
                              'payload',
                              field.name,
                              'tableGuid2',
                            ]),
                        ) || { columns: [] }
                      ).columns
                        .filter(col => col.selected)
                        .map(
                          c =>
                            MAP_ALLOWTYPE.includes(c.type) && (
                              <Select.Option key={c.guid} value={c.guid}>
                                {c.name}
                              </Select.Option>
                            ),
                        )}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...field}
                    className="flex-1"
                    name={[field.name, 'nickName']}
                    fieldKey={[field.fieldKey, 'nickName']}
                    rules={[
                      {
                        required: true,
                        message: 'Required',
                      },
                    ]}
                  >
                    <Input
                      style={{ width: fields.length > 1 ? 70 : 102 }}
                      placeholder="nickName"
                      disabled={disabled}
                      maxLength={INPUT_RULES.NICKNAME.value}
                    />
                  </Form.Item>
                  {!disabled && form.getFieldValue('payload').length > 1 && (
                    <Form.Item className="delbutton" {...field}>
                      <MinusCircleOutlined
                        onClick={() => {
                          remove(field.name);
                        }}
                      />
                    </Form.Item>
                  )}
                </Space>
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
      </Form>
    </Modal>
  );
};

CalculateNodeModal.propTypes = {
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

CalculateNodeModal.defaultProps = {
  payload: [],
  setPayload: () => null,
  tables: [],
  formRef: () => null,
  disabled: false,
};

export default CalculateNodeModal;
