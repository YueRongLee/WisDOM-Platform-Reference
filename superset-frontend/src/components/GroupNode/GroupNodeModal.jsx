/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Select, Space, Input } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { INPUT_RULES } from '~~constants/index';
import './GroupNodeStyle.less';

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

const SQL_GROUP_MAP = [
  {
    key: 'max',
    name: 'Max',
    groupType: ['time'],
  },
  {
    key: 'min',
    name: 'Min',
    groupType: ['time'],
  },
  {
    key: 'avg',
    name: 'Average',
    groupType: [],
  },
  {
    key: 'count',
    name: 'Count',
    groupType: ['time'],
  },
  {
    key: 'sum',
    name: 'Sum',
    groupType: [],
  },
];

const GroupNodeModal = ({
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

  const getColumnTypeByGuid = (tableGuid, columnGuid) => {
    const columnType =
      tableGuid && columnGuid
        ? (
            (
              tables.find(t => t.guid === tableGuid) || { columns: [] }
            ).columns.find(c => c.guid === columnGuid) || {}
          ).type
        : undefined;
    return columnType;
  };

  const getColumnTypeByFieldName = field => {
    const row = form.getFieldValue(['payload', field.name]);
    const columnType = row
      ? getColumnTypeByGuid(row.tableGuid, row.columnGuid)
      : undefined;
    return columnType;
  };

  const filterColumnToSelectGroupByType = _field => {
    const columnType = getColumnTypeByFieldName(_field);
    if (columnType === 'string') {
      return SQL_GROUP_MAP.filter(i => i.key === 'count').map(item => (
        <Select.Option key={item.key} value={item.key}>
          {item.name}
        </Select.Option>
      ));
    }
    if (
      columnType === 'date' ||
      columnType === 'timestamp' ||
      columnType === 'datetime'
    ) {
      return SQL_GROUP_MAP.filter(i => i.groupType.includes('time')).map(
        item => (
          <Select.Option key={item.key} value={item.key}>
            {item.name}
          </Select.Option>
        ),
      );
    }
    return SQL_GROUP_MAP.map(item => (
      <Select.Option key={item.key} value={item.key}>
        {item.name}
      </Select.Option>
    ));
  };

  const handleValueChange = (changedValues, allValues) => {
    (changedValues.payload || []).forEach((changedValue, idx) => {
      if (changedValue && Object.keys(changedValue).length === 1) {
        const newPayload = allValues.payload;
        // 改選table清掉該行後面所有值
        if (changedValue.tableGuid) {
          Object.keys(allValues.payload[idx]).forEach(key => {
            if (key !== 'tableGuid') {
              newPayload[idx][key] = undefined;
            }
          });
          // 改選column清掉groupType的值
        } else if (changedValue.columnGuid) {
          newPayload[idx].groupType = undefined;
        }
        form.setFieldsValue({
          payload: newPayload,
        });
      }
    });
  };
  return (
    <Modal
      {...modalProps}
      title="Group"
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
        onValuesChange={handleValueChange}
      >
        <Form.List name="payload">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, fIdx) => (
                <Space
                  size={0}
                  key={field.key}
                  className="groupRow"
                  align="center"
                >
                  <Form.Item
                    {...field}
                    name={[field.name, 'tableGuid']}
                    fieldKey={[field.fieldKey, 'tableGuid']}
                    rules={[
                      {
                        required: true,
                        message: 'This field is required',
                      },
                    ]}
                  >
                    <Select
                      style={{ width: 210 }}
                      disabled={disabled}
                      placeholder="Select a table"
                    >
                      {tables.map(t => (
                        <Select.Option key={t.guid} title={t.name}>
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
                        message: 'This field is required',
                      },
                    ]}
                  >
                    <Select
                      style={{ width: 120 }}
                      disabled={disabled}
                      placeholder="Select a column"
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
                        .map(c => (
                          <Select.Option
                            key={c.guid}
                            value={c.guid}
                            title={c.name}
                          >
                            {c.name}
                          </Select.Option>
                        ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, 'groupType']}
                    fieldKey={[field.fieldKey, 'groupType']}
                    rules={[
                      {
                        required: true,
                        message: 'This field is required',
                      },
                    ]}
                  >
                    <Select
                      style={{ width: 90 }}
                      disabled={disabled}
                      placeholder="Select a action"
                    >
                      {filterColumnToSelectGroupByType(field)}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...field}
                    className={`flex-1 idx-${fIdx}-len-${fields.length}`}
                    name={[field.name, 'nickName']}
                    fieldKey={[field.fieldKey, 'nickName']}
                    rules={[
                      {
                        required: true,
                        message: 'This field is required',
                      },
                    ]}
                  >
                    <Input
                      disabled={disabled}
                      placeholder="nickname"
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

GroupNodeModal.propTypes = {
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

GroupNodeModal.defaultProps = {
  payload: [],
  setPayload: () => null,
  tables: [],
  formRef: () => null,
  disabled: false,
};

export default GroupNodeModal;
