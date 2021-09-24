/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
import React, { useEffect, useState, useContext } from 'react';
// eslint-disable-next-line no-restricted-imports
import { Select, Form, Input, Button, Checkbox, Spin } from 'antd';
import { ArrowRightOutlined, EyeOutlined } from '@ant-design/icons';
import { AppContext } from 'src/store/appStore';
import PreviewModal from '../../../PreviewModal/PreviewModal';
import { WorkFlowApi, DataFlowApi } from '~~apis/';
import { useQuery, useModal } from '~~hooks/';
import {
  INPUT_RULES,
  TABLE_NAME_RULES,
  ROLE_TYPE,
  FUNCTIONS,
} from '~~constants/index';
import './InsertStyle.less';
import * as Style from './style';

const storageList = [
  {
    key: 'OUTPUTCDM', // CDM
    value: 'Microsoft CDM',
  },
  {
    key: 'OUTPUTWDC', // 預設
    value: 'Database',
  },
  {
    key: 'OUTPUTEXCEL',
    value: 'Excel',
  },
];

const databaseList = [
  {
    key: 'OUTPUTWDC', // 預設cloud
    value: 'Wisdom',
  },
  {
    key: 'OUTPUTCUSTOM',
    value: 'Customize',
  },
];

const locationList = [
  {
    key: 'WisDom Deliver(Cloud)',
    value: 'WisDom Deliver(Cloud)',
  },
  {
    key: 'WisDom Deliver(Local)',
    value: 'WisDom Deliver(Local)',
  },
];

const Poperties = ({
  setOutputType,
  data,
  nodeData,
  setSelectFinish,
  setData,
  setFocusNode,
  dataflowList,
  dataflowLoading,
  seqId, // workflow
  menuLoading,
  //   history,
  setMenuLoading,
  closeModal,
  openModal,
}) => {
  const appStore = useContext(AppContext);
  const [form] = Form.useForm();
  const [selectStorage, setSelectStorage] = useState('');
  const [selectDB, setSelectDB] = useState('');
  const [targets, setTargets] = useState();
  //   const [targetsLoading, setTargetsLoading] = useState(false);//改用menuLoading
  const [onBlurData, setOnBlurData] = useState();
  const [onBlurIndex, setOnBlurIndex] = useState();
  //   const [duplicateLoading, setDuplicateLoading] = useState(false); //改用menuLoading
  const [sameCheckMsg, setSameCheckMsg] = useState();
  const [dataflowCheck, setDataflowCheck] = useState(); // error ,success
  //   const [dataflowId, setDataflowId] = useState('');
  const getDuplicate = useQuery(WorkFlowApi.tableNameDuplicated);

  const previewModal = useModal();

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

  // 分為直接存 或 onBlur存
  const handleSetDataArg = async (setNewArg, inputRule, nowIndex) => {
    // const checkIndex = onBlurIndex !== nowIndex ? undefined : onBlurIndex;
    let checkIndex;
    if (nowIndex && onBlurIndex !== nowIndex) {
      checkIndex = nowIndex;
    } else {
      checkIndex = onBlurIndex;
    }

    // 輸入異常不存
    if (setNewArg !== undefined && inputRule !== 'ruleError') {
      const newArg = setNewArg;

      if (selectStorage && selectStorage !== '' && checkIndex !== undefined) {
        setMenuLoading(true);
        try {
          const send = {
            systemType: selectStorage,
            tableName: newArg.targetMapping[checkIndex].tableName,
            seqId,
          };
          const result = await getDuplicate.exec(send);
          newArg.targetMapping[checkIndex].duplicateStatus =
            result === true ? 'success' : 'error';

          const selectedStorageType = form.getFieldValue('storageType');

          if (selectedStorageType === 'Microsoft CDM') {
            newArg.targetMapping[checkIndex].duplicateStatus = 'success';
          }
        } catch (e) {
          console.log(e);
        } finally {
          setMenuLoading(false);
        }
      }

      if (inputRule !== 'onBlurOK') {
        // api判斷完,前端在判斷是否重複寫
        if (newArg.targetMapping !== undefined && newArg.targetMapping !== '') {
          const nameList = newArg.targetMapping.map(e => e.tableName);
          const repeatAry = nameList.filter((e, i, a) => a.indexOf(e) !== i);
          if (repeatAry.length !== 0) {
            setSameCheckMsg('Some Table Name are duplicate!');
            newArg.targetMapping.forEach(e => {
              if (repeatAry.includes(e.tableName)) {
                e.duplicateStatus = 'sameError';
              }
            });
            // setOnBlurIndex(undefined); // set後清空
          } else {
            newArg.targetMapping.forEach(e => {
              if (e.duplicateStatus === 'sameError') {
                e.duplicateStatus = '';
              }
            });
            setSameCheckMsg(undefined);
          }
        }

        setSelectFinish(false);
        const index = data.nodes.findIndex(e => e.id === nodeData.id);
        const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
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
    }
  };

  const checkAntdValidate = () => {
    const nowCol = form.getFieldValue('columns');
    nowCol.forEach(e => {
      e.duplicateStatus = e.duplicateStatus === null;
    });
    form.setFieldsValue({
      columns: nowCol,
    });

    // form
    //   .validateFields()
    //   .then(() => {
    //     nowCol.forEach(e => {
    //       e.duplicateStatus =
    //         e.duplicateStatus === 'success' ? 'success' : null;
    //     });
    //     nowCol[index].duplicateStatus = null; // 更改的那個狀態要清除
    //   })
    //   .catch(info => {
    //     // 先全部duplicateStatus調整成null,再把有問題的標成ruleError
    //     nowCol.forEach(e => {
    //       e.duplicateStatus =
    //         e.duplicateStatus === 'success' ? 'success' : null;
    //     });

    //     const errorNum = info && info.errorFields.length;
    //     if (errorNum) {
    //       info.errorFields.forEach(e => {
    //         if (e.name[0] === 'columns') {
    //           const index = e.name[1];
    //           nowCol[index].duplicateStatus = 'ruleError';
    //         }
    //       });
    //     }
    //   });
    // form.setFieldsValue({
    //   columns: nowCol,
    // });
  };

  // 只處理onBlur那筆
  const onBlurTableName = Idx => {
    setOnBlurIndex(Idx);

    setSameCheckMsg(undefined);
    form
      .validateFields()
      .then(() => {
        handleSetDataArg(onBlurData, undefined, Idx); // OK
      })
      .catch(info => {
        // validate error是否為onblur的項目
        if (
          Idx !== undefined &&
          info &&
          info.errorFields[Idx] &&
          info.errorFields[Idx].name[0] === 'columns'
        ) {
          const nowCol = form.getFieldValue('columns');
          const nowTableName = nowCol[Idx].columnComment;

          nowCol[Idx].duplicateStatus = 'ruleError';

          // 如果空白就改跟target name一樣
          nowCol[Idx].columnComment =
            nowTableName === '' || nowTableName === undefined
              ? nowCol[Idx].columnName
              : nowTableName;
          form.setFieldsValue({
            columns: nowCol,
          });

          // setOnBlurIndex(undefined);

          // setData
          const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
          if (nodeFilter !== undefined) {
            if (nodeFilter[0] && nodeFilter[0].args === undefined) {
              nodeFilter[0].args = '';
            }
            const setNewArg = nodeFilter[0].args;
            const newMapping = nowCol.map(e => ({
              nodeId: e.columnId,
              nodeName: e.columnName,
              tableName: e.columnComment,
              duplicateStatus: e.duplicateStatus,
              checkbox: e.checkbox,
            }));
            setNewArg.targetMapping = newMapping;
            setOnBlurData(setNewArg);
            handleSetDataArg(setNewArg, 'ruleError', Idx);
          }
        } else {
          handleSetDataArg(onBlurData, 'onBlurOK', Idx); // onBlur那個OK 但其他有錯
        }
      });
  };

  const saveTargetInArg = cols => {
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter !== undefined) {
      if (nodeFilter[0].args === undefined) {
        nodeFilter[0].args = '';
      }
      const setNewArg = nodeFilter[0].args;
      const mapping = cols.map(e => ({
        nodeId: e.id,
        nodeName: e.target,
        tableName: e.tableName,
        duplicateStatus: e.duplicateStatus,
        checkbox: e.checkbox,
      }));
      setNewArg.targetMapping = mapping;
      handleSetDataArg(setNewArg);
    }
  };

  const handleNoMapping = async seqId => {
    try {
      const result = await DataFlowApi.getTargetNode(seqId);

      const cols = result.map(e => ({
        id: e.id,
        target: e.full_name,
        tableName: e.full_name, // 起始資料跟target相同
        duplicateStatus: '', // 起始清空狀態
        checkbox: false, // 預設全不選
      }));

      setTargets(cols);
      saveTargetInArg(cols); // 沒有填也要存空值
      const status =
        result !== undefined && result.length !== 0 ? 'success' : 'error';
      setDataflowCheck(status);

      form.setFieldsValue({
        columns: cols.map(field => ({
          columnId: field.id,
          columnName: field.target,
          columnComment: field.tableName,
          duplicateStatus: field.duplicateStatus,
          checkbox: field.checkbox,
        })),
      });
    } catch (e) {
      console.log(e);
      setTargets();
      setDataflowCheck();
    } finally {
      setMenuLoading(false);
    }
  };

  const getTargetMapping = async dataflowId => {
    setMenuLoading(true);
    try {
      handleNoMapping(dataflowId);
    } catch (e) {
      console.log(e);
      setTargets();
      setDataflowCheck();
    } finally {
      setMenuLoading(false);
    }
  };

  const checkTargetMapping = async () => {
    setMenuLoading(true);
    try {
      const findNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const result = await DataFlowApi.getTargetNode(
        findNode[0].args.dataflowId,
      );
      //   const oldTargeMap = findNode[0].args.targetMapping.map(e => e.nodeName);
      //   const apiTargeMap = result.map(e => e.full_name);
      const { targetMapping } = findNode[0].args;
      const oldTargeMap = targetMapping.map(e => ({
        id: e.nodeId,
        name: e.tableName,
      }));
      const apiTargeMap = result.map(e => ({
        id: e.id,
        name: e.full_name,
      }));

      const newId = apiTargeMap.sort().map(e => e.id);

      let someIdTheSame = false; // id 是否有重複的
      let cover = false; // 是否要覆蓋全部
      const sameIdList = [];
      oldTargeMap.forEach(e => {
        if (newId.includes(e.id)) {
          someIdTheSame = true;
          sameIdList.push(e.id);
        }
      });

      if (someIdTheSame) {
        if (
          JSON.stringify(oldTargeMap.sort()) ===
          JSON.stringify(apiTargeMap.sort())
        ) {
          // check context
          cover = false;
        } else {
          // 有些不一樣
          result.forEach(e => {
            if (sameIdList.includes(e.id)) {
              const oldData = targetMapping.filter(a => a.nodeId === e.id)[0];
              e.id = oldData.nodeId;
              e.full_name = oldData.tableName;
              e.duplicateStatus = oldData.duplicateStatus;
              e.checkbox = oldData.checkbox;
            }
          });
          cover = true;
        }
      } else {
        cover = true;
      }

      //   if (JSON.stringify(oldTargeMap) !== JSON.stringify(apiTargeMap)) {
      if (cover) {
        // 比對不相同,用api的覆蓋
        const cols = result.map(e => ({
          id: e.id,
          target: e.full_name,
          tableName: e.full_name, // 先與targetName相同
          duplicateStatus: e.duplicateStatus,
          checkbox: e.checkbox,
        }));
        setTargets(cols);
        saveTargetInArg(cols); // 未填完的存原本的
        const status =
          result !== undefined && result.length !== 0 ? 'success' : 'error';
        setDataflowCheck(status);
        form.setFieldsValue({
          columns: cols.map(field => ({
            columnId: field.id,
            columnName: field.target,
            columnComment: field.tableName,
            duplicateStatus: field.duplicateStatus,
            checkbox: field.checkbox,
          })),
        });
        // const setNewArg = findNode[0].args;
        // setNewArg.targetMapping = '';
        // setOnBlurIndex(undefined); // 清空狀態
        // handleSetDataArg(setNewArg);
      }
    } catch (e) {
      console.log(e);
      setTargets();
      setDataflowCheck();
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    const findNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (
      findNode[0] &&
      findNode[0].args &&
      findNode[0].args.dataflowId &&
      nodeData.edit
    ) {
      if (findNode[0].args.targetMapping.length !== 0) {
        checkTargetMapping();
      }
    }
  }, []);

  useEffect(() => {
    const findNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (
      findNode[0] &&
      findNode[0].args &&
      findNode[0].args.dataflowId &&
      nodeData.edit
    ) {
      if (findNode[0].args.targetMapping.length !== 0) {
        checkTargetMapping();
      }
    }
  }, [nodeData.edit]);

  useEffect(() => {
    if (nodeData.id !== undefined && nodeData.id !== null) {
      const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      if (
        nodeFilter.length > 0 &&
        nodeFilter[0].args &&
        nodeFilter[0].args !== undefined
      ) {
        if (nodeFilter[0].args.dataflowId !== undefined) {
          const flowId = nodeFilter[0].args.dataflowId;
          form.setFieldsValue({
            dataflow: getValuebyKey(dataflowList, flowId),
          });
        }

        if (nodeFilter[0].args.targetMapping !== undefined) {
          const targets = nodeFilter[0].args.targetMapping;
          setTargets(targets);
          form.setFieldsValue({
            columns:
              targets &&
              targets.map(field => ({
                columnId: field.nodeId,
                columnName: field.nodeName,
                columnComment: field.tableName,
                duplicateStatus: field.duplicateStatus,
                checkbox: field.checkbox,
              })),
          });
        }

        switch (nodeFilter[0].args.output) {
          case 'OUTPUTCDM':
            setSelectStorage('OUTPUTCDM');
            form.setFieldsValue({
              storageType: getValuebyKey(storageList, 'OUTPUTCDM'),
            });
            break;
          case 'OUTPUTWDC':
            setSelectStorage('OUTPUTWDC'); // Database
            setSelectDB('OUTPUTWDC'); // wisdom
            form.setFieldsValue({
              storageType: getValuebyKey(storageList, 'OUTPUTWDC'),
              database: getValuebyKey(databaseList, 'OUTPUTWDC'),
              location: 'WisDom Deliver(Cloud)',
            });
            break;
          case 'OUTPUTWDL':
            setSelectStorage('OUTPUTWDC'); // Database
            setSelectDB('OUTPUTWDC'); // wisdom
            form.setFieldsValue({
              storageType: getValuebyKey(storageList, 'OUTPUTWDC'),
              database: getValuebyKey(databaseList, 'OUTPUTWDC'),
              location: 'WisDom Deliver(Local)',
            });
            break;
          case 'OUTPUTCUSTOM':
            setSelectStorage('OUTPUTWDC'); // Database
            setSelectDB('OUTPUTCUSTOM');
            form.setFieldsValue({
              storageType: getValuebyKey(storageList, 'OUTPUTWDC'),
              database: getValuebyKey(databaseList, 'OUTPUTCUSTOM'),
            });
            break;
          case 'OUTPUTEXCEL':
            setSelectStorage('OUTPUTEXCEL');
            form.setFieldsValue({
              storageType: getValuebyKey(storageList, 'OUTPUTEXCEL'),
            });
            break;
          default:
            break;
        }
      }
    }
  }, [nodeData]);

  const hangeValueChange = changeValue => {
    const changeKey = Object.keys(changeValue)[0];
    const changeValues = Object.values(changeValue)[0];
    let DBkey = '';
    let tempLocation = '';
    let storageKey = '';
    let setChange = false;
    let mapping = '';
    let flowId = '';
    let thisIdx = -1;
    // const otherNode = data.nodes.filter(e => e.id !== nodeData.id);
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter !== undefined) {
      if (nodeFilter[0].args === undefined) {
        nodeFilter[0].args = '';
      }
      const setNewArg = nodeFilter[0].args;
      if (setNewArg.length !== 0) {
        switch (changeKey) {
          case 'database':
            DBkey = databaseList.find(e => e.value === changeValues).key; // get select key
            setNewArg.output = DBkey;
            setOutputType(DBkey);
            setSelectDB(databaseList[DBkey]);
            setChange = true;
            break;
          case 'location':
            tempLocation =
              changeValues === 'WisDom Deliver(Local)'
                ? 'OUTPUTWDL'
                : 'OUTPUTWDC';
            setNewArg.output = tempLocation;
            setOutputType(tempLocation);
            setSelectDB(tempLocation);
            setChange = true;
            break;
          case 'storageType':
            storageKey = storageList.find(e => e.value === changeValues).key; // get select key
            setNewArg.output = storageKey;
            setOutputType(storageKey);
            // setSelectStorage(storageList[storageKey]);
            setSelectStorage(storageKey);
            setChange = true;
            break;
          case 'dataflow':
            flowId = dataflowList.find(e => e.value === changeValues).key;
            setNewArg.dataflowId = flowId;
            getTargetMapping(flowId);
            setNewArg.targetMapping = '';
            // setOnBlurIndex(undefined); // 清空狀態
            setChange = true;
            break;
          case 'columns':
            mapping = form.getFieldValue('columns').map(e => ({
              nodeId: e.columnId,
              nodeName: e.columnName,
              tableName: e.columnComment,
              duplicateStatus: e.duplicateStatus,
              checkbox: e.checkbox,
            }));
            thisIdx = changeValues.length - 1;
            mapping[thisIdx].duplicateStatus = null; // 輸入的那個清空狀態
            setNewArg.targetMapping = mapping;

            checkAntdValidate();
            setOnBlurData(setNewArg);
            // 有勾才去onBlur檢查
            if (
              thisIdx !== -1 &&
              changeValues[thisIdx] &&
              Object.keys(changeValues[thisIdx])[0] === 'checkbox' &&
              changeValues[thisIdx].checkbox === true
            ) {
              setOnBlurIndex(thisIdx);
              onBlurTableName(thisIdx);
            }
            break;
          default:
            break;
        }

        if (setChange === true) {
          handleSetDataArg(setNewArg);
          setChange = false;
        }
      }
    }
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

  const handleValidateStatus = columns => {
    if (columns) {
      if (
        columns.duplicateStatus === 'ruleError' ||
        columns.duplicateStatus === 'sameError'
      ) {
        return 'error';
      }
      return columns.duplicateStatus;
    }
    return null;
  };

  const handleHelp = columns => {
    if (columns) {
      if (
        columns.duplicateStatus === 'error' ||
        columns.duplicateStatus === 'sameError'
      ) {
        return 'This Table Name is duplicated!';
      }
      return null;
    }
    return null;
  };

  return (
    <Style.InsertScroll>
      <Spin spinning={menuLoading}>
        <Form
          data-test="formValueChange"
          form={form}
          onValuesChange={hangeValueChange}
          className="node-wrapper"
          // style={{ overflow: 'auto' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Style.FormItem
              label="Dataflow"
              name="dataflow"
              style={{ marginBottom: '6px' }}
              validateStatus={
                dataflowCheck === undefined || !nodeData.edit
                  ? null
                  : dataflowCheck
              }
              help={
                targets === undefined || targets.length !== 0 || !nodeData.edit
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
              data-test="previewBtn"
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

          <Style.FormItem label="Storage Type" name="storageType">
            <Select
              placeholder="Please select a Type"
              disabled={!nodeData.edit}
            >
              {storageList.map(d => (
                <Select.Option key={d.key} value={d.value}>
                  {d.value}
                </Select.Option>
              ))}
            </Select>
          </Style.FormItem>
          {selectStorage === 'OUTPUTWDC' &&
          appStore.userInfo.roles.includes(ROLE_TYPE.DATA_MASTER) ? (
            <Style.FormItem label="Destination Database" name="database">
              <Select
                placeholder="Please select a Database"
                disabled={!nodeData.edit}
              >
                {databaseList.map(d => (
                  <Select.Option key={d.key} value={d.value}>
                    {d.value}
                  </Select.Option>
                ))}
              </Select>
            </Style.FormItem>
          ) : null}
          {selectDB === 'OUTPUTWDC' && selectStorage === 'OUTPUTWDC' ? (
            <Style.FormItem label="Location" name="location">
              <Select
                placeholder="Please select a location"
                disabled={!nodeData.edit}
              >
                {locationList.map(d => (
                  <Select.Option key={d.key} value={d.value}>
                    {d.value}
                  </Select.Option>
                ))}
              </Select>
            </Style.FormItem>
          ) : null}
          {targets && targets.length !== 0 ? (
            <>
              {sameCheckMsg !== undefined ? (
                <div
                  style={{
                    padding: '10px 10px 0 15px',
                    marginTop: '15px',
                    color: 'tomato',
                  }}
                >
                  {sameCheckMsg}
                </div>
              ) : (
                <div style={{ padding: '10px 10px 0 15px', marginTop: '15px' }}>
                  Input the destination table name
                </div>
              )}
              <div
                style={{
                  margin: '10px 20px 0',
                  display: 'flex',
                  textAlign: 'center',
                  alignItems: 'center',
                  // justifyContent: 'space-around',
                }}
              >
                <div style={{ width: '10%' }}>Output Select</div>
                <div style={{ width: '45%' }}>Target Node Name</div>
                <div style={{ width: '45%' }}>Table Name</div>
              </div>
              <Form.Item style={{ padding: '0 15px' }}>
                <Form.List name="columns" className="field-box-list-container">
                  {fields => (
                    <>
                      {fields.map((field, fIdx) => (
                        // {fields.map(field => (
                        <div className="field-box">
                          <Form.Item
                            name={[field.name, 'checkbox']}
                            fieldKey={[field.fieldKey, 'checkbox']}
                            valuePropName="checked"
                          >
                            <Checkbox
                              disabled={!nodeData.edit || selectStorage === ''}
                            />
                          </Form.Item>
                          <Form.Item
                            name={[field.name, 'columnName']}
                            fieldKey={[field.fieldKey, 'columnName']}
                          >
                            <Input
                              placeholder="Node Name"
                              disabled
                              defaultValue={field.columnName}
                            />
                          </Form.Item>
                          <ArrowRightOutlined />
                          <Form.Item
                            {...field}
                            name={[field.name, 'columnComment']}
                            fieldKey={[field.fieldKey, 'columnComment']}
                            rules={[
                              {
                                required: true,
                                message: 'Please input a Table Name!',
                              },
                              {
                                pattern: TABLE_NAME_RULES.pattern,
                                message:
                                  'Start with alphabet and accept only letters(A-Za-z), numbers(0-9) and underline(_)',
                              },
                            ]}
                            hasFeedback
                            validateStatus={handleValidateStatus(
                              form.getFieldValue().columns[field.fieldKey],
                            )}
                            help={handleHelp(
                              form.getFieldValue().columns[field.fieldKey],
                            )}
                          >
                            <Input
                              data-test="tableNameInputValue"
                              placeholder="Table Name"
                              style={{ minWidth: 100, maxWidth: 500 }}
                              defaultValue={field.columnComment}
                              //   disabled={editDescriptQuery.isLoading}
                              maxLength={INPUT_RULES.TABLE_NAME.value}
                              disabled={!nodeData.edit || selectStorage === ''}
                              onBlur={() => onBlurTableName(fIdx)}
                            />
                          </Form.Item>
                        </div>
                      ))}
                    </>
                  )}
                </Form.List>
              </Form.Item>
            </>
          ) : null}
        </Form>
      </Spin>
    </Style.InsertScroll>
  );
};

export default Poperties;
