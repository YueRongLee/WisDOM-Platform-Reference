/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-use-before-define */
/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import {
  Button,
  Form,
  Select,
  Space,
  Input,
  DatePicker,
  Radio,
  Spin,
} from 'antd';
import { MinusCircleOutlined, EyeOutlined } from '@ant-design/icons';
import PreviewModal from '../../../PreviewModal/PreviewModal';
import { DataFlowApi } from '~~apis/';
import { useModal } from '~~hooks/';
import { FUNCTIONS } from '~~constants/index';
import './Poperties.less';
import * as Style from './style';

const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};

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
    name: '==',
    disabledType: [],
  },
  {
    key: 'NOT_EQUAL',
    name: '!=',
    disabledType: [],
  },
];

const ConditionPoperties = ({
  nodeData,
  data,
  disabled,
  tables,
  setTables,
  setPayload,
  dataflowList,
  dataflowLoading,
  closeModal,
  openModal,
}) => {
  const [form] = Form.useForm();

  const [dataFlow, setDataFlow] = useState('');
  const [loading, setLoading] = useState(false);
  const [logicalOperator, setLogicalOperator] = useState('');
  const [dataflowId, setDataflowId] = useState('');
  const [tempPayload, setTempPayload] = useState([{}]);
  const [errorMsg, setErrorMsg] = useState('');

  const previewModal = useModal();

  const isDateType = type => ['date', 'timestamp'].includes(type);

  const getTargetSchema = async (seqId, name) => {
    setLoading(true);
    setDataflowId(seqId);
    try {
      const result = await DataFlowApi.getTargetSchema(seqId); // check editing
      setTables(result);
      if (result.length > 0) {
        setTables(result);
      } else {
        setTables(result);
        setErrorMsg(' No target for select');
      }
    } catch (e) {
      setTables([]);
      setErrorMsg(`Please execute run for this ${name} data flow`);
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getChangeTargetSchema = async (seqId, allValues, name) => {
    setLoading(true);
    setDataflowId(seqId);
    try {
      const result = await DataFlowApi.getTargetSchema(seqId); // check editing
      if (result.length > 0) {
        setTables(result);
      } else {
        setTables(result);
        setErrorMsg(' No target for select');
      }
      setTempPayload([{}]);
      form.setFieldsValue({
        payload: [{}],
      });
      handleSave([{}], allValues.logicalOperator, allValues.dataflowId);
    } catch (e) {
      setTables([]);
      setTempPayload([{}]);
      setErrorMsg(`Please execute run for this ${name} data flow`);
      form.setFieldsValue({
        payload: [{}],
      });
      handleSave([{}], allValues.logicalOperator, allValues.dataflowId);
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getColumnTypeByGuid = (target, name) => {
    const columnType =
      target && name
        ? (
            (
              tables.find(t => t.targetName === target) || { columns: [] }
            ).columns.find(c => c.name === name) || {}
          ).dataType
        : undefined;
    return columnType;
  };

  const getColumnTypeByFieldName = name => {
    const row = form.getFieldValue(['payload', name]);
    const columnType = row
      ? getColumnTypeByGuid(row.target, row.columnName)
      : undefined;
    return columnType;
  };

  const renderComparisonOperator = field => {
    const columnType = getColumnTypeByFieldName(field.name);
    return (
      columnType &&
      COMPARISON_OPERATOR_MAP.filter(
        o => !o.disabledType.includes(columnType),
      ).map(o => (
        <Select.Option key={o.key} value={o.name}>
          {o.name}
        </Select.Option>
      ))
    );
  };

  useEffect(() => {
    const temp = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (temp[0].args) {
      if (temp[0].args.dataflowId) {
        const fliterName = dataflowList.filter(
          item => item.key === temp[0].args.dataflowId,
        );
        getTargetSchema(temp[0].args.dataflowId, fliterName[0].value);
      }
      setLogicalOperator(temp[0].args.logicalOperator || '');
      setDataflowId(temp[0].args.dataflowId || '');
      setTempPayload(temp[0].args.filters || [{}]);
      form.setFieldsValue({
        logicalOperator: temp[0].args.logicalOperator || '',
        dataflowId: temp[0].args.dataflowId || '',
        payload: temp[0].args.filters || [{}],
      });
    }
  }, []);

  const handleSave = (payload, logicalOperator, dataflowId) => {
    setPayload(payload, logicalOperator, dataflowId);
  };

  const addDataType = payload => {
    if (payload) {
      const newPayload = payload.map(item => {
        const findIdx = tables.findIndex(
          table => table.targetName === item?.target,
        );
        if (findIdx > -1) {
          const findTypeIdx = tables[findIdx].columns.findIndex(
            cloumn => cloumn.name === item.columnName,
          );
          if (findTypeIdx > -1) {
            return {
              ...item,
              columnType: tables[findIdx].columns[findTypeIdx].dataType,
            };
          }
        }
        return item;
      });
      return newPayload;
    }
    return payload;
  };

  const handleValueChange = (changedValues, allValues) => {
    if (Object.keys(changedValues)[0] === 'logicalOperator') {
      setLogicalOperator(allValues.logicalOperator);
      handleSave(
        addDataType(allValues.payload),
        allValues.logicalOperator,
        allValues.dataflowId,
      );
    }

    if (Object.keys(changedValues)[0] === 'dataflowId') {
      const fliterName = dataflowList.filter(
        item => item.key === allValues.dataflowId,
      );
      setDataFlow(fliterName[0].value);
      setDataflowId(allValues.dataflowId);
      getChangeTargetSchema(
        allValues.dataflowId,
        allValues,
        fliterName[0].value,
      );
    }

    (changedValues.payload || []).forEach((changedValue, idx) => {
      if (changedValue && Object.keys(changedValue).length === 1) {
        const newPayload = addDataType(allValues.payload);
        // 改選table清掉該行後面所有值
        if (changedValue.target) {
          Object.keys(allValues.payload[idx]).forEach(key => {
            if (key !== 'target') {
              newPayload[idx][key] = undefined;
            }
          });
          // 改選column清掉comparisonValue的值和comparisonOperator
        } else if (changedValue.columnName) {
          newPayload[idx].value = undefined;
          newPayload[idx].operation = undefined;
        }
        form.setFieldsValue({
          payload: newPayload,
        });
        setTempPayload(newPayload);
        // handleSave(newPayload, allValues.logicalOperator, allValues.dataflowId);
      } else {
        setTempPayload(addDataType(allValues.payload));
      }
    });
  };

  const changeInput = () => {
    handleSave(tempPayload, logicalOperator, dataflowId);
  };

  const renderComparisonValue = field => {
    // 日期用datepicker其餘type為input
    const columnType = getColumnTypeByFieldName(field.name);
    return columnType && isDateType(columnType) ? (
      <DatePicker
        showTime={{ format: 'HH:mm' }}
        format="YYYY-MM-DD HH:mm"
        style={{ width: '100%' }}
        disabled={disabled || !nodeData.edit}
        onBlur={changeInput}
      />
    ) : (
      <Input
        placeholder="Input comparison value"
        disabled={disabled || !nodeData.edit}
        onBlur={changeInput}
      /> // 長度不限
    );
  };

  const handlePreview = async seqId => {
    try {
      if (seqId !== '') {
        const result = await DataFlowApi.getDataFlowDetail(seqId);
        openModal();
        previewModal.openModal({
          diagram: JSON.parse(result.diagram),
          seqId,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Style.InsertScroll>
      <Form
        form={form}
        className="formListBlock"
        name="wherepayload"
        onFinish={handleSave}
        scrollToFirstError
        initialValues={{
          payload: [{}], // 預設帶一筆
        }}
        onValuesChange={handleValueChange}
      >
        <div style={{ padding: '10px 10px 0 15px' }}>Condition</div>
        <div style={{ padding: '10px 10px 0 15px' }}>
          Identifies which block of actions to execute bassed on th evaluation
          of condition input
        </div>
        <Form.Item name="logicalOperator">
          <Radio.Group disabled={!nodeData.edit}>
            <Radio value="and" style={radioStyle}>
              AND
            </Radio>
            <Radio value="or" style={radioStyle}>
              OR
            </Radio>
          </Radio.Group>
        </Form.Item>

        <div style={{ padding: '10px 10px 0 15px' }}>Dataflow</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Form.Item name="dataflowId">
            <Select
              data-test="dataflowId"
              placeholder="Select a Dataflow"
              disabled={dataflowLoading || !nodeData.edit}
              style={{ width: 210 }}
              showSearch
              onChange={value => setDataflowId(value)}
              filterOption={(input, option) =>
                option.children
                  ? option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  : ''
              }
            >
              {dataflowList.map(t => (
                <Select.Option key={t.key} value={t.key} title={t.value}>
                  {t.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Button
            style={{ width: 100 }}
            data-test="handlePreview"
            onClick={() => handlePreview(dataflowId)}
            disabled={
              dataflowLoading ||
              !nodeData.edit ||
              form.getFieldValue('dataflowId') === undefined ||
              form.getFieldValue('dataflowId') === ''
            }
          >
            <EyeOutlined />
            Preview
          </Button>
          <PreviewModal modal={previewModal} close={closeModal} />
        </div>

        <Spin spinning={loading}>
          {tables.length === 0 ? (
            dataFlow ? (
              <Spin spinning={loading}>
                <div style={{ color: 'red', paddingLeft: '15px' }}>
                  {errorMsg}
                </div>
              </Spin>
            ) : null
          ) : (
            <Form.List name="payload">
              {(fields, { add, remove }) => (
                <Style.PaddFormItem>
                  {!disabled && (
                    <Button
                      data-test="add"
                      style={{ width: 210, margin: '0 0 15px 24px' }}
                      onClick={() => {
                        add();
                      }}
                      block
                      disabled={!nodeData.edit || tables.length === 0}
                    >
                      Add Condition
                    </Button>
                  )}
                  {fields.map((field, fIdx) => (
                    <div className="blockDashed">
                      <div className="tableBlock">
                        <Form.Item
                          {...field}
                          name={[field.name, 'target']}
                          fieldKey={[field.fieldKey, 'target']}
                          rules={[
                            {
                              required: true,
                              message: 'This field is required',
                            },
                          ]}
                        >
                          <Select
                            style={{ width: '22vh' }}
                            placeholder="Select a table"
                            data-test="selectTable"
                            onBlur={changeInput}
                            disabled={!nodeData.edit}
                          >
                            {tables.map(t => (
                              <Select.Option
                                // key={t.targetId}
                                // value={t.targetId}
                                key={t.targetName}
                                value={t.targetName}
                                title={t.targetName}
                              >
                                {t.targetName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        {!disabled &&
                          nodeData.edit &&
                          form.getFieldValue('payload').length > 1 && (
                            <Form.Item className="delbutton">
                              <MinusCircleOutlined
                                data-test="delbutton"
                                onClick={() => {
                                  remove(field.name);
                                }}
                              />
                            </Form.Item>
                          )}
                      </div>
                      <Space
                        size={0}
                        key={field.key}
                        className="whereRow"
                        align="center"
                      >
                        <Form.Item
                          {...field}
                          name={[field.name, 'columnName']}
                          fieldKey={[field.fieldKey, 'columnName']}
                          rules={[
                            {
                              required: true,
                              message: 'Required',
                            },
                          ]}
                        >
                          <Select
                            style={{ width: '22vh' }}
                            placeholder="Select a column"
                            disabled={!nodeData.edit}
                            data-test="selectColumn"
                            onBlur={changeInput}
                          >
                            {/* {test(form, tables, field)} */}
                            {(
                              tables.find(
                                table =>
                                  table.targetName ===
                                  form.getFieldValue([
                                    'payload',
                                    field.name,
                                    'target',
                                  ]),
                              ) || { columns: [] }
                            ).columns
                              // .filter(col => col.selected)
                              .map(c => (
                                <Select.Option
                                  key={c.name}
                                  value={c.name}
                                  title={c.name}
                                >
                                  {c.name}({c.dataType})
                                </Select.Option>
                              ))}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'operation']}
                          fieldKey={[field.fieldKey, 'operation']}
                          rules={[
                            {
                              required: true,
                              message: 'Required',
                            },
                          ]}
                        >
                          <Select
                            style={{ width: 70 }}
                            placeholder="Select a comparison operator"
                            disabled={!nodeData.edit}
                            data-test="selectOperator"
                            onBlur={changeInput}
                          >
                            {renderComparisonOperator(field)}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          {...field}
                          className={`flex-1 idx-${fIdx}-len-${fields.length}`}
                          name={[field.name, 'value']}
                          fieldKey={[field.fieldKey, 'value']}
                          rules={[
                            {
                              required: true,
                              message: 'This field is required',
                            },
                          ]}
                        >
                          {renderComparisonValue(field)}
                        </Form.Item>
                      </Space>
                    </div>
                  ))}
                </Style.PaddFormItem>
              )}
            </Form.List>
          )}
        </Spin>
      </Form>
    </Style.InsertScroll>
  );
};

export default ConditionPoperties;
