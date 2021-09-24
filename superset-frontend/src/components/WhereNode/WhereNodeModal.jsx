/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Select, Space, Input, DatePicker } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import './WhereNodeStyle.less';

const COMPARISON_OPERATOR_MAP = [
  {
    key: 'GREATER',
    name: '>',
    disabledType: ['string'],
  },
  {
    key: 'LESS_THAN',
    name: '<',
    disabledType: ['string'],
  },
  {
    key: 'GREATER_OR_EQUAL',
    name: '>=',
    disabledType: ['string'],
  },
  {
    key: 'LESS_THAN_OR_EQUAL',
    name: '<=',
    disabledType: ['string'],
  },
  {
    key: 'EQUAL',
    name: '=',
    disabledType: [],
  },
  {
    key: 'NOT_EQUAL',
    name: '!=',
    disabledType: [],
  },
];

const LOGICAL_OPERATOR_MAP = [
  {
    key: 'AND',
    name: 'AND',
  },
  {
    key: 'OR',
    name: 'OR',
  },
];

const WhereNodeModal = ({
  payload,
  setPayload,
  modalProps,
  tables,
  formRef,
  disabled,
}) => {
  const [form] = Form.useForm();
  formRef(form);

  const isDateType = type => ['date', 'timestamp'].includes(type);

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

  useEffect(() => {
    if (modalProps.visible) {
      let newPayload = payload && payload.length ? payload : [{}]; // 預設帶一筆
      newPayload = newPayload.map(p => ({
        ...p,
        comparisonValue: isDateType(
          getColumnTypeByGuid(p.tableGuid, p.columnGuid),
        )
          ? moment(p.comparisonValue)
          : p.comparisonValue,
      }));
      form.setFieldsValue({ payload: newPayload });
    }
  }, [modalProps.visible]);

  const handleBeforeLeave = () => {
    form.resetFields();
    modalProps.onCancel();
  };

  const handleSave = data => {
    const newData = data.payload.map(d => ({
      ...d,
      comparisonValue: isDateType(
        getColumnTypeByGuid(d.tableGuid, d.columnGuid),
      )
        ? d.comparisonValue.zone('+08:00').valueOf()
        : d.comparisonValue,
    }));
    setPayload(newData);
    modalProps.onOk(newData);
    handleBeforeLeave();
  };

  const getColumnTypeByFieldName = name => {
    const row = form.getFieldValue(['payload', name]);
    const columnType = row
      ? getColumnTypeByGuid(row.tableGuid, row.columnGuid)
      : undefined;
    return columnType;
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
          // 改選column清掉comparisonValue的值和comparisonOperator
        } else if (changedValue.columnGuid) {
          newPayload[idx].comparisonValue = undefined;
          newPayload[idx].comparisonOperator = undefined;
        }
        form.setFieldsValue({
          payload: newPayload,
        });
      }
    });
  };

  const renderComparisonOperator = field => {
    const columnType = getColumnTypeByFieldName(field.name);
    return (
      columnType &&
      COMPARISON_OPERATOR_MAP.filter(
        o => !o.disabledType.includes(columnType),
      ).map(o => (
        <Select.Option key={o.key} value={o.key}>
          {o.name}
        </Select.Option>
      ))
    );
  };

  const renderComparisonValue = field => {
    // 日期用datepicker其餘type為input
    const columnType = getColumnTypeByFieldName(field.name);
    return columnType && isDateType(columnType) ? (
      <DatePicker
        showTime={{ format: 'HH:mm' }}
        format="YYYY-MM-DD HH:mm"
        style={{ width: '100%' }}
        disabled={disabled}
      />
    ) : (
      <Input placeholder="Input comparison value" disabled={disabled} /> // 長度不限
    );
  };

  return (
    <Modal
      {...modalProps}
      title="Where"
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
        name="wherepayload"
        onFinish={handleSave}
        scrollToFirstError
        initialValues={{
          payload: [{}], // 預設帶一筆
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
                  className="whereRow"
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
                        <Select.Option
                          key={t.guid}
                          value={t.guid}
                          title={t.name}
                        >
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
                      placeholder="Select a comparison operator"
                    >
                      {renderComparisonOperator(field)}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...field}
                    className={`flex-1 idx-${fIdx}-len-${fields.length}`}
                    name={[field.name, 'comparisonValue']}
                    fieldKey={[field.fieldKey, 'comparisonValue']}
                    rules={[
                      {
                        required: true,
                        message: 'This field is required',
                      },
                    ]}
                  >
                    {renderComparisonValue(field)}
                  </Form.Item>
                  {/* 最後一列不用邏輯符號 */}
                  <Form.Item
                    {...field}
                    className={fIdx === fields.length - 1 ? 'hidden' : ''}
                    name={[field.name, 'logicalOperator']}
                    fieldKey={[field.fieldKey, 'logicalOperator']}
                    rules={[
                      {
                        required: fIdx !== fields.length - 1,
                        message: 'Required',
                      },
                    ]}
                  >
                    {fIdx !== fields.length - 1 && (
                      <Select
                        style={{ width: 80 }}
                        disabled={disabled}
                        placeholder="Select a logical operator"
                      >
                        {LOGICAL_OPERATOR_MAP.map(o => (
                          <Select.Option key={o.key} value={o.key}>
                            {o.name}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                  {!disabled && form.getFieldValue('payload').length > 1 && (
                    <Form.Item className="delbutton">
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

WhereNodeModal.propTypes = {
  payload: PropTypes.arrayOf(PropTypes.shape({})),
  setPayload: PropTypes.func,
  modalProps: PropTypes.shape({}).isRequired,
  tables: PropTypes.arrayOf(PropTypes.shape({})),
  formRef: PropTypes.func,
  disabled: PropTypes.bool,
};

WhereNodeModal.defaultProps = {
  payload: [],
  setPayload: () => null,
  tables: [],
  formRef: () => null,
  disabled: false,
};

export default WhereNodeModal;
