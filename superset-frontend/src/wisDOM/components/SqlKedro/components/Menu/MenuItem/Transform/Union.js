/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Spin, Button, Form, Space, Select, Input, Tooltip } from 'antd';
import moment from 'moment';
import {
  DeleteOutlined,
  MinusCircleOutlined,
  CloseCircleOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { DATAFLOW_TYPE, FUNCTIONS, COLUMN_RULES } from '~~constants/index';
import { TableApi } from '~~apis/';
import '../Menu.less';
import * as Style from './style';

const Union = ({
  nodeParents,
  nodeData,
  data,
  setData,
  setSelectFinish,
  setFocusNode,
  schemaLoading,
  setNodeChange,
}) => {
  const [form] = Form.useForm();
  //   const [payload, setPayload] = useState([{}]);
  const [tablesA, setTablesA] = useState({ tableName: undefined, columns: [] });
  const [tablesB, setTablesB] = useState({ tableName: undefined, columns: [] });
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const getTableColumns = async () => {
    if (nodeParents && nodeParents.length === 2) {
      try {
        setLoading(true);
        // A
        if (nodeParents[0].type === DATAFLOW_TYPE.DATASET.value) {
          const result1 = await TableApi.getAllowedTableColumns(
            nodeParents[0].args.table_name,
          );
          setTablesA({
            tableName: nodeParents[0].args.table_name,
            columns: result1.table.columns,
          });
        } else {
          const index = data.nodes.findIndex(e => e.id === nodeParents[0].key);
          const thisNode = data.nodes[index];
          const leftCol = thisNode.schema;
          setTablesA({ tableName: thisNode.full_name, columns: leftCol });
        }

        // B
        if (nodeParents[1].type === DATAFLOW_TYPE.DATASET.value) {
          const result1 = await TableApi.getAllowedTableColumns(
            nodeParents[1].args.table_name,
          );
          setTablesB({
            tableName: nodeParents[1].args.table_name,
            columns: result1.table.columns,
          });
        } else {
          const index = data.nodes.findIndex(e => e.id === nodeParents[1].key);
          const thisNode = data.nodes[index];
          const leftCol = thisNode.schema;
          setTablesB({
            tableName: thisNode.full_name,
            columns: leftCol,
          });
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const getColumnOrgType = (col, tempTable) => {
    if (tempTable) {
      const type =
        tempTable.filter(e => e.name === col).length > 0 &&
        tempTable.filter(e => e.name === col)[0].type;
      return type;
    }

    return undefined;
  };

  const checkStatus = () => {
    const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

    if (getArgNode[0] && getArgNode[0].args) {
      if (getArgNode[0].args.unionMapping) {
        const mapping = getArgNode[0].args.unionMapping;
        let checkOK = false;
        let totalCheck = true;

        mapping.forEach(e => {
          checkOK =
            e.outputColumn &&
            e.columnA &&
            e.columnB &&
            FUNCTIONS.COLUMN_TYPE_MAPPING(e.columnTypeA) ===
              FUNCTIONS.COLUMN_TYPE_MAPPING(e.columnTypeB);

          if (!checkOK) {
            totalCheck = false;
          }
        });

        let statusChange = false;
        if (totalCheck && getArgNode[0].check !== undefined) {
          getArgNode[0].check = undefined;
          statusChange = true;
        } else if (!totalCheck && getArgNode[0].check === undefined) {
          getArgNode[0].check = 'error';
          statusChange = true;
        }

        if (statusChange === true) {
          setNodeChange(getArgNode[0]);
        } else {
          setSelectFinish(false);
          setData({
            edges: [...data.edges],
            nodes: [...data.nodes],
          });
          setFocusNode({
            full_name: nodeData.name,
            name: FUNCTIONS.NODE_NAME(nodeData.name),
            id: nodeData.id,
            type: nodeData.type,
          });
        }
      }
    }
  };

  const handleValueChange = changeValue => {
    const changeKey = Object.keys(changeValue)[0];
    // const changeValues = Object.values(changeValue)[0];
    const tempPayload = form.getFieldValue('payload');

    const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

    switch (changeKey) {
      case 'payload':
        const argPayload =
          tempPayload &&
          tempPayload.map(e => ({
            outputColumn: e.outputColumn,
            columnA: e.columnA,
            columnTypeA: getColumnOrgType(e.columnA, tablesA.columns),
            columnB: e.columnB,
            columnTypeB: getColumnOrgType(e.columnB, tablesB.columns),
          }));

        form.setFieldsValue({ payload: tempPayload });
        getArgNode[0].args.unionMapping = argPayload;
        checkStatus();
        break;

      default:
        break;
    }
  };

  const removeItem = idx => {
    const temp = form
      .getFieldValue('payload')
      .filter((item, index) => index !== idx);
  };

  useEffect(() => {
    if (nodeParents !== undefined) {
      if (data !== undefined) {
        const temp = data.nodes.filter(node => node.id === nodeData.id);
        if (temp[0] && temp[0].args) {
          const sPayload =
            temp[0].args.unionMapping &&
            temp[0].args.unionMapping.map(e => ({
              outputColumn: e.outputColumn,
              columnA: e.columnA,
              columnB: e.columnB,
            }));

          form.setFieldsValue({
            payload: sPayload || [{}],
          });
        }
        getTableColumns();
      }
    }
  }, []);

  const disabledAdd = () => {
    const temp = form.getFieldValue('payload');
    if (temp[temp.length - 1]) {
      const check =
        temp[temp.length - 1].outputColumn &&
        temp[temp.length - 1].columnA &&
        temp[temp.length - 1].columnB;

      return !check;
    }
    return true;
  };

  return (
    <Style.InsertScroll>
      <Form
        data-test="formValueChange"
        form={form}
        scrollToFirstError
        initialValues={{
          payload: [{}], // 預設帶一筆
        }}
        onValuesChange={handleValueChange}
      >
        <Spin spinning={loading || schemaLoading}>
          <div style={{ fontSize: '16px', padding: '10px' }}>
            Column Mapping
          </div>
          {nodeParents.length !== 2 ? (
            <div style={{ padding: '10px', color: '#e04355' }}>
              Please select 2 nodes for Union
            </div>
          ) : null}

          <Form.List name="payload">
            {(fields, { add, remove }) => (
              <>
                <div
                  style={{
                    margin: '14px 0 16px 0',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    paddingLeft: 10,
                  }}
                >
                  <div style={{ width: '32%', textAlign: 'center' }}>
                    Union Output Column
                  </div>
                  <div style={{ width: '30%', textAlign: 'center' }}>
                    New Node A
                    <Tooltip title={tablesA.tableName}>
                      <TableOutlined
                        style={{ marginLeft: '10px', color: '#00000066' }}
                      />
                    </Tooltip>
                  </div>
                  <div style={{ width: '30%', textAlign: 'center' }}>
                    New Node B
                    <Tooltip title={tablesB.tableName}>
                      <TableOutlined
                        style={{ marginLeft: '10px', color: '#00000066' }}
                      />
                    </Tooltip>
                  </div>
                  <div style={{ width: '8%' }} />
                </div>

                {fields.map((field, fIdx) => (
                  <>
                    <Style.BlockContainer
                      key={field.key}
                      style={{
                        padding: '0 0 0 10px',
                        justifyContent: 'flex-start',
                        margin: '16px 0',
                      }}
                    >
                      <Form.Item
                        {...field}
                        style={{ width: '32%', padding: '0 6px' }}
                        name={[field.name, 'outputColumn']}
                        fieldKey={[field.fieldKey, 'outputColumn']}
                        rules={[
                          {
                            required: true,
                            message: 'Please input a column name',
                          },
                          {
                            pattern: COLUMN_RULES.pattern,
                            message:
                              'Accept letters(a-z) , numbers(0-9) and underline(_) only',
                          },
                        ]}
                      >
                        <Input
                          placeholder="Input a union column name"
                          value={field.newName}
                          disabled={!nodeData.edit || nodeParents.length !== 2}
                        />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        style={{ width: '30%', padding: '0 6px' }}
                        name={[field.name, 'columnA']}
                        fieldKey={[field.fieldKey, 'columnA']}
                        rules={[
                          {
                            required: true,
                            message: 'Please select a column',
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select a column"
                          disabled={!nodeData.edit || nodeParents.length !== 2}
                          showSearch
                        >
                          {tablesA &&
                            tablesA.columns?.map(t => (
                              <Select.Option
                                key={t.name}
                                value={t.name}
                                type={t.type}
                              >
                                {t.name}({t.type})
                              </Select.Option>
                            ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        {...field}
                        style={{ width: '30%', padding: '0 6px' }}
                        name={[field.name, 'columnB']}
                        fieldKey={[field.fieldKey, 'columnB']}
                        rules={[
                          {
                            required: true,
                            message: 'Please select a column',
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select a column"
                          disabled={!nodeData.edit || nodeParents.length !== 2}
                          showSearch
                        >
                          {tablesB &&
                            tablesB.columns?.map(t => (
                              <Select.Option
                                key={t.name}
                                value={t.name}
                                type={t.type}
                              >
                                {t.name}({t.type})
                              </Select.Option>
                            ))}
                        </Select>
                      </Form.Item>

                      {nodeData.edit &&
                        form.getFieldValue('payload').length > 1 && (
                          <Form.Item style={{ width: '8%', padding: '0 6px' }}>
                            <MinusCircleOutlined
                              onClick={() => {
                                removeItem(fIdx);
                                remove(field.name);
                              }}
                            />
                          </Form.Item>
                        )}
                    </Style.BlockContainer>

                    {FUNCTIONS.COLUMN_TYPE_MAPPING(
                      getColumnOrgType(
                        form.getFieldValue(['payload', field.name, 'columnA']),
                        tablesA && tablesA.columns,
                      ),
                    ) !==
                    FUNCTIONS.COLUMN_TYPE_MAPPING(
                      getColumnOrgType(
                        form.getFieldValue(['payload', field.name, 'columnB']),
                        tablesB && tablesB.columns,
                      ),
                    ) ? (
                      <Form.Item
                        style={{ padding: '0px 34px', color: '#e04355' }}
                        name={[field.name, 'typeError']}
                        fieldKey={[field.fieldKey, 'typeError']}
                      >
                        <span>
                          <CloseCircleOutlined
                            style={{ marginRight: '10px' }}
                          />
                          Column type is different
                        </span>
                      </Form.Item>
                    ) : null}
                  </>
                ))}
                <Button
                  style={{ width: '40%', margin: '0 15px' }}
                  onClick={() => {
                    add();
                  }}
                  block
                  disabled={
                    !nodeData.edit || disabledAdd() || nodeParents.length !== 2
                  }
                >
                  Add
                </Button>
              </>
            )}
          </Form.List>
        </Spin>
      </Form>
    </Style.InsertScroll>
  );
};

export default Union;
