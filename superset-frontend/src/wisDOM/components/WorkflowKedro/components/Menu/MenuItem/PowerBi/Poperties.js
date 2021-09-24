/* eslint-disable no-console */
/* eslint-disable radix */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Select, Form, Button, Spin, Input } from 'antd';
import {
  EyeOutlined,
  ArrowRightOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import PreviewModal from '../../../PreviewModal/PreviewModal';
import { DataFlowApi, WorkFlowApi } from '~~apis/';
import { useModal, useQuery } from '~~hooks/';
import { FUNCTIONS } from '~~constants/index';
import * as Style from './style';

const PowerBiPoperties = ({
  data,
  setData,
  setFocusNode,
  setSelectFinish,
  nodeData,
  dataflowList,
  dataflowLoading,
  //   seqId, // workflow
  closeModal,
  openModal,
  setNodeChange,
}) => {
  const [targetList, setTargetList] = useState();
  const [templateList, setTemplateList] = useState([]);
  const [preNodeId, setPreNodeId] = useState();
  const [loading, setLoading] = useState(false);
  const [temploading, setTempLoading] = useState(false);
  const [targetLoading, setTargetLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const [dataflowStatus, setDataflowStatus] = useState(); // error ,success
  const previewModal = useModal();
  const [form] = Form.useForm();
  const queryTemplate = useQuery(WorkFlowApi.getPowerBiTemplate);

  const getValuebyKey = (list, key) => {
    if (key !== undefined || key !== '') {
      const ary = list.find(d => d.key === key);
      if (ary !== undefined) {
        return list.find(d => d.key === key).value;
      }
      return '';
    }
    return '';
  };

  const getColumnType = (columnName, targetName) => {
    if (columnName && targetName) {
      const filterTaget = targetList.filter(e => e.targetName === targetName);
      const filterColumn = filterTaget[0].targetColumn.filter(
        e => e.key === columnName,
      );
      return filterColumn && filterColumn[0] ? filterColumn[0].type : '';
    }
    return '';
  };

  const handleSetDataArg = async setNewArg => {
    if (setNewArg !== undefined) {
      setMenuLoading(true);
      // 輸入異常不存
      const newArg = setNewArg;
      newArg.output = 'OUTPUTCDM'; // 後端要求固定填入OUTPUTCDM
      if (targetList) {
        newArg.targetMapping = targetList.map(e => ({
          nodeId: e.id,
          nodeName: e.targetName,
          tableName: e.targetName,
          checkbox: true,
        }));
      }
      let statusChange = false;
      let checkError = false;
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

      if (newArg.templateId) {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < newArg.templateMapping.length; i++) {
          if (
            newArg.templateMapping[i].fromTarget &&
            newArg.templateMapping[i].fromColumn
          ) {
            const error =
              FUNCTIONS.COLUMN_TYPE_MAPPING(
                getColumnType(
                  form.getFieldValue(['columns', i, 'columnComment1']),
                  form.getFieldValue(['columns', i, 'columnTable1']),
                ),
              ) !==
              FUNCTIONS.COLUMN_TYPE_MAPPING(
                form.getFieldValue(['columns', i, 'columnType2']),
              );

            if (error === true) {
              checkError = true;
            }
          } else {
            checkError = true;
          }
        }
      }

      if (checkError === true && getArgNode[0].check === undefined) {
        getArgNode[0].check = 'error';
        statusChange = true;
      } else if (checkError === false && getArgNode[0].check === 'error') {
        getArgNode[0].check = undefined;
        statusChange = true;
      }

      if (statusChange) {
        setNodeChange(getArgNode[0]);
      } else {
        setSelectFinish(false);

        const newData = FUNCTIONS.SET_DATA(
          data,
          nodeData,
          index,
          nodeData.id,
          getArgNode[0],
          newArg,
          data.edges,
        );

        setData(newData);

        setFocusNode({
          full_name: nodeData.name,
          name: FUNCTIONS.NODE_NAME(nodeData.name),
          id: nodeData.id,
          type: nodeData.type,
        });
      }

      setMenuLoading(false);
    }
  };

  const getTableList = async id => {
    try {
      const result = await WorkFlowApi.getPowerBiTableList(id);

      form.setFieldsValue({
        columns: result.map(r => ({
          columnTable1: '',
          columnComment1: '',
          columnTable2: r.dataset,
          columnComment2: `${r.column}(${r.type})`,
          columnDescription: r.description,
          columnType1: '',
          columnType2: r.type,
        })),
      });

      const mapping = result.map(r => ({
        columnTable1: '',
        columnComment1: '',
        columnTable2: r.dataset,
        columnComment2: r.column,
        columnDescription: r.description,
        columnType1: '',
        columnType2: r.type,
      }));

      const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      if (nodeFilter !== undefined) {
        if (nodeFilter[0].args === undefined) {
          nodeFilter[0].args = '';
        }
        const setNewArg = nodeFilter[0].args;
        setNewArg.templateId = parseInt(id);
        setNewArg.templateMapping = mapping.map(e => ({
          fromTarget: e.columnTable1,
          fromColumn: e.columnComment1,
          fromType: e.columnType1,
          toTable: e.columnTable2,
          toColumn: e.columnComment2,
          toType: e.columnType2,
          description: e.columnDescription,
        }));
        handleSetDataArg(setNewArg);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const templateChange = (key, value) => {
    if (value.key) {
      setLoading(true);
      getTableList(value.key);
    }
  };

  const getTargetList = async (seqId, nodeArg, tempList) => {
    try {
      setTargetLoading(true);
      const result = await DataFlowApi.getTargetNode(seqId);
      const cols = result.map(e => ({
        id: e.id,
        targetName: e.full_name,
        targetColumn: e.schema.map(e => ({
          key: e.name,
          name: `${e.name}(${e.type})`,
          type: e.type,
        })),
      }));

      const status =
        result !== undefined && result.length !== 0 ? 'success' : 'error';
      setDataflowStatus(status);

      setTargetList(cols);
      const nameList = cols.map(e => e.targetName);

      const tempId = nodeArg && nodeArg.templateId;
      const mapping = nodeArg && nodeArg.templateMapping;

      // 未編輯前直接show之前的
      if (!nodeData.edit) {
        form.setFieldsValue({
          dataflow: seqId ? getValuebyKey(dataflowList, seqId) : [],
          template: tempId && tempList ? getValuebyKey(tempList, tempId) : [],
          columns: mapping
            ? mapping.map(t => ({
                columnTable1: t.fromTarget,
                columnComment1: t.fromColumn,
                columnTable2: t.toTable,
                columnComment2: t.toColumn,
                columnDescription: t.description ? t.description : '',
                columnType1: t.fromType,
                columnType2: t.toType,
              }))
            : null,
        });
      } else {
        const tableList =
          tempId && (await WorkFlowApi.getPowerBiTableList(tempId));

        form.setFieldsValue({
          dataflow: seqId ? getValuebyKey(dataflowList, seqId) : [],
          template: tempId && tempList ? getValuebyKey(tempList, tempId) : [],
          columns: mapping
            ? mapping.map(t => ({
                columnTable1:
                  nameList && nameList.includes(t.fromTarget)
                    ? t.fromTarget
                    : '',
                columnComment1:
                  nameList && nameList.includes(t.fromTarget)
                    ? t.fromColumn
                    : '',
                columnTable2: t.toTable,
                columnComment2: `${t.toColumn}(${
                  tableList &&
                  tableList.filter(
                    e => e.dataset === t.toTable && e.column === t.toColumn,
                  )[0].type
                })`,
                columnDescription: t.description ? t.description : '',
                columnType1: t.fromType,
                columnType2:
                  tableList &&
                  tableList.filter(
                    e => e.dataset === t.toTable && e.column === t.toColumn,
                  )[0].type,
              }))
            : null,
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setTargetLoading(false);
    }
  };

  const initCheck = async () => {
    let tempList;
    try {
      setTempLoading(true);
      const result = await queryTemplate.exec();
      setTemplateList(result);
      tempList = result.map(e => ({
        key: e.templateId,
        value: e.templateName,
      }));
    } catch (e) {
      console.log(e);
    } finally {
      setTempLoading(false);
    }

    const findNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

    if (findNode[0] && findNode[0].args) {
      const flowId = findNode[0].args.dataflowId;
      //   const tempId = findNode[0].args.templateId;
      //   const mapping = findNode[0].args.templateMapping;

      if (flowId) {
        getTargetList(flowId, findNode[0].args, tempList);
      } else {
        const tempId = findNode[0].args && findNode[0].args.templateId;
        form.setFieldsValue({
          dataflow: [],
          template: tempId && tempList ? getValuebyKey(tempList, tempId) : [],
          columns: [],
        });
      }
    }
  };

  useEffect(() => {
    initCheck();
  }, []);

  useEffect(() => {
    if (
      nodeData.id !== undefined &&
      nodeData.id !== null &&
      preNodeId !== nodeData.id
    ) {
      setPreNodeId(nodeData.id);
      initCheck();
    }
  }, [nodeData]);

  const handleValueChange = changeValue => {
    const changeKey = Object.keys(changeValue)[0];
    const changeValues = Object.values(changeValue)[0];
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter !== undefined) {
      if (nodeFilter[0].args === undefined) {
        nodeFilter[0].args = '';
      }
      let flowId;
      let fields;
      const setNewArg = nodeFilter[0].args;
      switch (changeKey) {
        case 'dataflow':
          flowId = dataflowList.find(e => e.value === changeValues).key;
          setNewArg.dataflowId = flowId;
          getTargetList(flowId);
          setNewArg.templateId = '';
          setNewArg.templateMapping = '';
          setNewArg.powerBiCondition = undefined;
          handleSetDataArg(setNewArg);
          fields = form.getFieldValue('columns');
          form.setFieldsValue({
            columns:
              fields &&
              fields.map(f => ({
                columnTable1: '',
                columnComment1: '',
                columnTable2: f.columnTable2,
                columnComment2: f.columnComment2,
                columnDescription: f.columnDescription,
                columnType1: '',
                columnType2: f.columnType2,
              })),
          });

          break;
        case 'columns':
          fields = form.getFieldValue('columns');
          setNewArg.templateMapping =
            fields &&
            fields.map(e => ({
              fromTarget: e.columnTable1,
              fromColumn: e.columnComment1,
              toTable: e.columnTable2,
              // toColumn: e.columnComment2,
              toColumn: e.columnComment2.split('(')[0],
              description: e.columnDescription,
              fromType: getColumnType(e.columnComment1, e.columnTable1),
              toType: e.columnType2,
            }));
          handleSetDataArg(setNewArg);

          break;
        default:
          break;
      }
    }
  };

  const getTargetColumnList = targetName => {
    if (targetName) {
      const filter = targetList.filter(e => e.targetName === targetName);
      if (
        filter.length > 0 &&
        filter[0].targetColumn &&
        filter[0].targetColumn.length > 0
      ) {
        return filter[0].targetColumn.map(e => (
          <Select.Option key={e.key} value={e.key} type={e.type}>
            {e.name}
          </Select.Option>
        ));
      }
      return null; // 更換過target
    }
    return null;
  };

  const handlePreview = async () => {
    try {
      const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      if (nodeFilter && nodeFilter[0] && nodeFilter[0].args) {
        const seqId = nodeFilter[0].args.dataflowId;
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
    <Style.PowerBiScroll>
      <Spin spinning={loading || temploading || menuLoading || targetLoading}>
        <Form form={form} onValuesChange={handleValueChange}>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Style.FormItem
              label="Dataflow"
              name="dataflow"
              style={{ marginBottom: '6px' }}
              validateStatus={
                dataflowStatus === undefined || !nodeData.edit
                  ? null
                  : dataflowStatus
              }
              help={
                targetList === undefined ||
                targetList.length !== 0 ||
                !nodeData.edit
                  ? null
                  : 'There is no Target in this Dataflow'
              }
            >
              <Select
                placeholder="Please select a Dataflow"
                disabled={dataflowLoading || !nodeData.edit}
                style={{ width: 210 }}
                showSearch
              >
                {dataflowList &&
                  dataflowList.map(d => (
                    <Select.Option key={d.key} value={d.value}>
                      {d.value}
                    </Select.Option>
                  ))}
              </Select>
            </Style.FormItem>
            <Button
              style={{ width: 100 }}
              onClick={() => handlePreview()}
              disabled={
                dataflowLoading ||
                !nodeData.edit ||
                form.getFieldValue('dataflow') === undefined
              }
            >
              <EyeOutlined />
              Preview
            </Button>
            <PreviewModal modal={previewModal} close={closeModal} />
          </div>

          <Style.FormItem label="Template" name="template">
            <Select
              placeholder="Please select a Template"
              disabled={!nodeData.edit}
              onChange={templateChange}
              style={{ width: 383 }}
            >
              {templateList &&
                templateList.map(d => (
                  <Select.Option key={d.templateId} value={d.templateId}>
                    {d.templateName}
                  </Select.Option>
                ))}
            </Select>
          </Style.FormItem>

          <div style={{ padding: '10px 10px 0 15px', marginTop: '15px' }}>
            Map columns between target nodes and Power Bi tables
          </div>

          <div
            style={{
              margin: '10px 20px 0',
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              // justifyContent: 'space-around',
            }}
          >
            <div style={{ width: '46%' }}>Target Node & Target Cloumn</div>
            {/* <div style={{ width: '23%' }}>Target Cloumn</div> */}
            <div style={{ width: '7%' }}>{` `}</div>
            <div style={{ width: '46%' }}>Table Name & Table Cloumn</div>
            {/* <div style={{ width: '23%' }}>Table Cloumn</div> */}
          </div>

          {targetList ? (
            <Form.Item style={{ padding: '0 15px' }}>
              <Form.List name="columns">
                {fields => (
                  <>
                    {fields.map(field => (
                      <div
                        style={{
                          border: '1px #3333 dashed',
                          margin: '0 0 15px 15px',
                        }}
                      >
                        <Style.FieldBox>
                          <div>
                            <Form.Item
                              style={{ padding: '8px' }}
                              name={[field.name, 'columnTable1']}
                              fieldKey={[field.fieldKey, 'columnTable1']}
                            >
                              <Select
                                placeholder="Please select a Target"
                                disabled={targetLoading || !nodeData.edit}
                                style={{ width: 250 }}
                                showSearch
                              >
                                {targetList.map(e => (
                                  <Select.Option
                                    key={e.id}
                                    value={e.targetName}
                                  >
                                    {e.targetName}
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>

                            <Form.Item
                              style={{ padding: '8px' }}
                              name={[field.name, 'columnComment1']}
                              fieldKey={[field.fieldKey, 'columnComment1']}
                            >
                              <Select
                                placeholder="Please select a Column"
                                style={{ width: 250 }}
                                disabled={
                                  menuLoading ||
                                  targetLoading ||
                                  !nodeData.edit ||
                                  !form.getFieldValue([
                                    'columns',
                                    field.name,
                                    'columnTable1',
                                  ])
                                }
                                showSearch
                              >
                                {getTargetColumnList(
                                  form.getFieldValue([
                                    'columns',
                                    field.name,
                                    'columnTable1',
                                  ]),
                                )}
                              </Select>
                            </Form.Item>
                          </div>
                          <ArrowRightOutlined />

                          <div>
                            <Form.Item
                              style={{ padding: '8px', width: 250 }}
                              name={[field.name, 'columnTable2']}
                              fieldKey={[field.fieldKey, 'columnTable2']}
                            >
                              <Input
                                title={form.getFieldValue([
                                  'columns',
                                  field.name,
                                  'columnTable2',
                                ])}
                                style={{
                                  // width: 100,
                                  color: nodeData.edit ? '#000000bf' : null,
                                  background: nodeData.edit ? 'white' : null,
                                }}
                                placeholder="Node Name"
                                disabled
                              />
                            </Form.Item>

                            <Form.Item
                              style={{ padding: '8px', width: 250 }}
                              {...field}
                              name={[field.name, 'columnComment2']}
                              fieldKey={[field.fieldKey, 'columnComment2']}
                            >
                              <Input
                                title={form.getFieldValue([
                                  'columns',
                                  field.name,
                                  'columnComment2',
                                ])}
                                style={{
                                  // width: 100,
                                  color: nodeData.edit ? '#000000bf' : null,
                                  background: nodeData.edit ? 'white' : null,
                                }}
                                placeholder="Table Name"
                                disabled
                              />
                            </Form.Item>
                          </div>
                        </Style.FieldBox>

                        {form
                          .getFieldValue([
                            'columns',
                            field.name,
                            'columnComment2',
                          ])
                          .split('(')[1] &&
                        FUNCTIONS.COLUMN_TYPE_MAPPING(
                          getColumnType(
                            form.getFieldValue([
                              'columns',
                              field.name,
                              'columnComment1',
                            ]),
                            form.getFieldValue([
                              'columns',
                              field.name,
                              'columnTable1',
                            ]),
                          ),
                        ) !==
                          FUNCTIONS.COLUMN_TYPE_MAPPING(
                            form.getFieldValue([
                              'columns',
                              field.name,
                              'columnType2',
                            ]),
                          ) ? (
                          <>
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
                          </>
                        ) : null}

                        <Form.Item
                          style={{ padding: '0px 12px' }}
                          name={[field.name, 'columnDescription']}
                          fieldKey={[field.fieldKey, 'columnDescription']}
                        >
                          <Input
                            title={form.getFieldValue([
                              'columns',
                              field.name,
                              'columnDescription',
                            ])}
                            style={{
                              cursor: 'default',
                              width: '70vh',
                              padding: '0px 24px',
                              color: '#00000096',
                            }}
                            bordered={false}
                            disabled
                            // prefix={<InfoCircleOutlined />}
                          />
                        </Form.Item>
                      </div>
                    ))}
                  </>
                )}
              </Form.List>
            </Form.Item>
          ) : null}
        </Form>
      </Spin>
    </Style.PowerBiScroll>
  );
};

export default PowerBiPoperties;
