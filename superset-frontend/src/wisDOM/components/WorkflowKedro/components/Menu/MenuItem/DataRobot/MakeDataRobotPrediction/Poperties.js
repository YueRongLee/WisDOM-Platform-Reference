/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
import React, { useEffect, useState, useContext } from 'react';
// eslint-disable-next-line no-restricted-imports
import { Select, Form, Input, Button, Checkbox, Spin } from 'antd';
import { ArrowRightOutlined, EyeOutlined } from '@ant-design/icons';
import { AppContext } from 'src/store/appStore';
import PreviewModal from '../../../../PreviewModal/PreviewModal';
import { WorkFlowApi, DataFlowApi, DataRobotApi } from '~~apis/';
import { useQuery, useModal } from '~~hooks/';
import {
  INPUT_RULES,
  TABLE_NAME_RULES,
  ROLE_TYPE,
  FUNCTIONS,
} from '~~constants/index';
import * as Style from '../style';

const { TextArea } = Input;

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
  {
    key: 'OUTPUTWTD',
    value: 'WisDOM Temp Dataset',
  },
];

const databaseList = [
  {
    key: 'OUTPUTWDC', // 預設cloud
    value: 'Wisdom',
  },
  // dataRobot不提供Customize
  // {
  //   key: 'OUTPUTCUSTOM',
  //   value: 'Customize',
  // },
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
  const [dataflowCheck, setDataflowCheck] = useState();
  const [dataRobotIdValidate, setDataRobotIdValidate] = useState(); // error msg
  const [listLoading, setListLoading] = useState(false); // datarobot
  const [dataRobot, setDataRobot] = useState(); // datarobot Data
  const [oldProjectId, setOldProjectId] = useState(); // for compare
  const [validateList, setValidateList] = useState(); // for show all targetStatus
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

  const clearDataRobot = () => {
    form.setFieldsValue({ projectID: '', modelName: [] });
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

    if (nodeFilter.length > 0 && nodeFilter[0].args) {
      nodeFilter[0].args.projectId = undefined;
      nodeFilter[0].args.modelId = undefined;
      nodeFilter[0].args.modelType = undefined;
      nodeFilter[0].args.modelNumber = undefined;
    }

    setDataRobot();
  };

  // 分為直接存 或 onBlur存
  const handleSetDataArg = async (setNewArg, inputRule, nowIndex) => {
    let checkIndex;
    if (nowIndex !== undefined && onBlurIndex !== nowIndex) {
      checkIndex = nowIndex;
    } else {
      checkIndex = onBlurIndex;
    }

    // inputRule:'ruleError','onBlurOK',undefined// ruleError:輸入字串異常不存
    if (setNewArg !== undefined && inputRule !== 'ruleError') {
      const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

      if (
        nodeFilter.length > 0 &&
        nodeFilter[0].args &&
        nodeFilter[0].args !== setNewArg
      ) {
        nodeFilter[0].args = setNewArg;
      }
      const newArg = setNewArg;

      if (selectStorage && selectStorage !== '' && checkIndex !== undefined) {
        setMenuLoading(true);
        try {
          const selectedStorageType = form.getFieldValue('storageType');
          if (selectedStorageType === 'Microsoft CDM') {
            newArg.targetMapping[checkIndex].duplicateStatus = 'success'; // CDM不用判斷,可不顯示狀態
            const cdmValidateList = newArg.targetMapping.map(
              e => e.duplicateStatus,
            );
            setValidateList(cdmValidateList);
          } else {
            const send = {
              systemType: selectStorage,
              tableName: newArg.targetMapping[checkIndex].tableName,
              seqId,
            };
            const result = await getDuplicate.exec(send);
            newArg.targetMapping[checkIndex].duplicateStatus =
              result === true ? 'success' : 'error';

            const newValidateList = newArg.targetMapping.map(
              e => e.duplicateStatus,
            );
            setValidateList(newValidateList); // 顯示用
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
          const newValidateList = newArg.targetMapping.map(
            e => e.duplicateStatus,
          );

          if (repeatAry.length !== 0) {
            setSameCheckMsg('Some Table Name are duplicate!');

            newArg.targetMapping.forEach((e, index) => {
              if (repeatAry.includes(e.tableName)) {
                e.duplicateStatus = 'sameError';
                newValidateList[index] = 'sameError';
              }
            });
          } else {
            newArg.targetMapping.forEach((e, index) => {
              if (e.duplicateStatus === 'sameError') {
                e.duplicateStatus = 'success';
                newValidateList[index] = 'success';
              }
            });
            setSameCheckMsg(undefined);
          }
          setValidateList(newValidateList);
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

  const getModelList = async id => {
    setListLoading(true);
    try {
      const payload = {
        projectId: id,
      };
      const result = await DataRobotApi.getModelList(payload);
      if (result.models.length > 0) {
        setDataRobot(result.models);
        setDataRobotIdValidate();
        const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
        if (nodeFilter !== undefined) {
          if (nodeFilter[0].args === undefined) {
            nodeFilter[0].args = '';
          }
          const setNewArg = nodeFilter[0].args;
          setNewArg.projectId = id;
        }
      } else {
        clearDataRobot();
        setDataRobotIdValidate('project id not found');
      }
    } catch (e) {
      console.log(e);
    } finally {
      setListLoading(false);
    }
  };

  //   const checkAntdValidate = () => {
  //     const nowCol = form.getFieldValue('columns');
  //     nowCol.forEach(e => {
  //       e.duplicateStatus = e.duplicateStatus || null;
  //     });
  //     form.setFieldsValue({
  //       columns: nowCol,
  //     });

  //     const nowValidateList = nowCol.map(e => e.duplicateStatus);
  //     setValidateList(nowValidateList);
  //   };

  // 只處理onBlur那筆
  const onBlurTableName = (Idx, type) => {
    setOnBlurIndex(Idx);

    setSameCheckMsg(undefined);
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

    form
      .validateFields()
      .then(() => {
        if (type === 'check') {
          if (nodeFilter && nodeFilter[0]) {
            handleSetDataArg(nodeFilter[0].args, undefined, Idx);
          }
        } else {
          handleSetDataArg(onBlurData, undefined, Idx); // for OnBlur event
        }
      })
      .catch(info => {
        // validate error是否為onblur的項目
        if (
          Idx !== undefined &&
          info &&
          info.errorFields &&
          info.errorFields.map(e => e.name).filter(e => e[0] === 'columns')
            .length > 0 &&
          info.errorFields
            .map(e => e.name)
            .filter(e => e[0] === 'columns')
            .filter(f => f[1] === Idx).length > 0
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

          if (nodeFilter !== undefined) {
            if (nodeFilter[0] && nodeFilter[0].args === undefined) {
              nodeFilter[0].args = '';
            }
            const setNewArg = nodeFilter[0].args;
            const newMapping = nowCol.map(e => ({
              nodeId: e.columnId,
              nodeName: e.columnName,
              tableName: e.columnComment,
              tableDescription: e.tableDescription,
              duplicateStatus: e.duplicateStatus,
              checkbox: e.checkbox,
            }));
            setNewArg.targetMapping = newMapping;

            const newValidateList = newMapping.map(e => e.duplicateStatus);
            setValidateList(newValidateList); // 顯示用

            // setOnBlurData(setNewArg);
            handleSetDataArg(setNewArg, 'ruleError', Idx);
          }
        } else {
          handleSetDataArg(onBlurData, 'onBlurOK', Idx); // 不是column有錯
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
        tableDescription: e.tableDescription,
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
        tableDescription: undefined,
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
          tableDescription: field.tableDescription,
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

  const getmodelName = arg => {
    if (arg.projectId && !dataRobot && listLoading === false) {
      getModelList(arg.projectId);
    }

    if (arg.projectId && arg.modelNumber && arg.modelType) {
      return `(${arg.modelNumber})${arg.modelType}`;
    }
    return null;
  };

  const handleSetField = () => {
    if (nodeData.id !== undefined && nodeData.id !== null) {
      const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      if (
        nodeFilter !== undefined &&
        nodeFilter[0] &&
        nodeFilter[0].args !== undefined &&
        nodeFilter[0].args !== undefined
      ) {
        form.setFieldsValue({
          projectID: nodeFilter[0].args.projectId,
          modelName: nodeData.edit
            ? getmodelName(nodeFilter[0].args)
            : `(${nodeFilter[0].args.modelNumber})${nodeFilter[0].args.modelType}`,
        });

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
                tableDescription: field.tableDescription,
                duplicateStatus: field.duplicateStatus,
                checkbox: field.checkbox,
              })),
          });

          setValidateList(targets.map(e => e.duplicateStatus));
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
          //   case 'OUTPUTCUSTOM':
          //     setSelectStorage('OUTPUTWDC'); // Database
          //     setSelectDB('OUTPUTCUSTOM');
          //     form.setFieldsValue({
          //       storageType: getValuebyKey(storageList, 'OUTPUTWDC'),
          //       database: getValuebyKey(databaseList, 'OUTPUTCUSTOM'),
          //     });
          //     break;
          case 'OUTPUTEXCEL':
            setSelectStorage('OUTPUTEXCEL');
            form.setFieldsValue({
              storageType: getValuebyKey(storageList, 'OUTPUTEXCEL'),
            });
            break;
          case 'OUTPUTWTD':
            setSelectStorage('OUTPUTWTD');
            form.setFieldsValue({
              storageType: getValuebyKey(storageList, 'OUTPUTWTD'),
            });
            break;
          default:
            break;
        }
      }
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
        name: e.nodeName,
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

      if (someIdTheSame === true) {
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
              e.full_name = oldData.nodeName;
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
        // setOnBlurIndex(undefined); // 清空狀態
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
    handleSetField();
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
    handleSetField();
  }, [nodeData.edit]);

  useEffect(() => {
    const nowColumn = form.getFieldValue('columns');
    if (
      validateList &&
      validateList.length > 0 &&
      nowColumn &&
      nowColumn.length > 0
    ) {
      nowColumn.forEach((e, idx) => {
        if (e.duplicateStatus !== validateList[idx]) {
          e.duplicateStatus = validateList[idx];
        }
      });
      form.setFieldsValue({ column: nowColumn });
    }
  }, [validateList]);

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
            // tempLocation =
            //   changeValues === 'WisDom Deliver(Local)'
            //     ? 'OUTPUTWDL'
            //     : 'OUTPUTWDC';
            switch (changeValues) {
              case 'WisDom Deliver(Local)':
                tempLocation = 'OUTPUTWDL';
                break;
              case 'WisDom Deliver(Cloud)':
                tempLocation = 'OUTPUTWDC';
                break;
              default:
                tempLocation = 'OUTPUTWDC';
                break;
            }
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
              tableDescription: e.tableDescription,
              duplicateStatus: e.duplicateStatus,
              checkbox: e.checkbox,
            }));
            thisIdx = changeValues.length - 1;
            if (Object.keys(changeValues[thisIdx])[0] !== 'tableDescription') {
              mapping[thisIdx].duplicateStatus = null; // 輸入的那個清空狀態
            }

            setNewArg.targetMapping = mapping;

            // checkAntdValidate();
            setOnBlurData(setNewArg); // 有變化先塞onBlur在validate

            // 勾選變更為true
            if (
              thisIdx !== -1 &&
              changeValues[thisIdx] &&
              Object.keys(changeValues[thisIdx])[0] === 'checkbox' &&
              changeValues[thisIdx].checkbox === true
            ) {
              setOnBlurIndex(thisIdx);
              onBlurTableName(thisIdx, 'check');
            } else {
              const newValidate = mapping.map(e => e.duplicateStatus);
              setValidateList(newValidate);
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

  const handleValidateStatus = type => {
    if (type) {
      if (type === 'ruleError' || type === 'sameError') {
        return 'error';
      }
      return type;
    }
    return null;
  };

  const handleHelp = type => {
    if (type) {
      if (type === 'error' || type === 'sameError') {
        return 'This Table Name is duplicated!';
      }
      return null;
    }
    return null;
  };

  const handleChangeModel = (value, Option) => {
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter !== undefined) {
      if (nodeFilter[0].args === undefined) {
        nodeFilter[0].args = '';
      }
      const setNewArg = nodeFilter[0].args;
      setNewArg.modelId = Option.modelId;
      setNewArg.modelNumber = Option.key;
      setNewArg.modelType = Option.type;
    }
  };

  const onBlurProjectId = id => {
    if (id) {
      if (!oldProjectId || id !== oldProjectId) {
        getModelList(id);
      }
      setOldProjectId(id);
    } else {
      clearDataRobot();
      setDataRobotIdValidate('Please input a project id');
    }
  };

  return (
    <Style.DataRobotScroll>
      <Spin spinning={menuLoading || listLoading}>
        <Form
          data-test="formValueChange"
          form={form}
          onValuesChange={hangeValueChange}
          className="node-wrapper"
        >
          <Style.FormItem
            label="DataRobot Project ID"
            name="projectID"
            hasFeedback
            validateStatus={dataRobotIdValidate ? 'error' : null}
            help={dataRobotIdValidate || null}
            disabled={listLoading}
          >
            <Input
              data-test="projectID"
              placeholder="DataRobot Project ID"
              disabled={!nodeData.edit}
              onBlur={e => onBlurProjectId(e.target.value)}
            />
          </Style.FormItem>

          <Style.FormItem label="DataRobot Model Name" name="modelName">
            <Select
              placeholder="Please select a Model"
              disabled={!nodeData.edit || listLoading}
              onChange={handleChangeModel}
              showSearch
            >
              {dataRobot &&
                dataRobot.map(e => (
                  <Select.Option
                    key={e.modelNumber}
                    value={` (${e.modelNumber})${e.modelType}`}
                    type={e.modelType}
                    modelId={e.id}
                  >
                    ({e.modelNumber}){e.modelType}
                  </Select.Option>
                ))}
            </Select>
          </Style.FormItem>

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
              {/* <Form.Item style={{ padding: '0 15px' }}> */}
              <Style.FormItemMapping>
                <Form.List name="columns" className="field-box-list-container">
                  {fields => (
                    <>
                      {fields.map((field, fIdx) => (
                        // {fields.map(field => (
                        <>
                          <div className="field-box">
                            <Form.Item
                              name={[field.name, 'checkbox']}
                              fieldKey={[field.fieldKey, 'checkbox']}
                              valuePropName="checked"
                            >
                              <Checkbox
                                disabled={
                                  !nodeData.edit || selectStorage === ''
                                }
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
                              //   validateStatus={handleValidateStatus(
                              //     form.getFieldValue().columns[field.fieldKey],
                              //   )}
                              // help={handleHelp(
                              //     form.getFieldValue().columns[field.fieldKey],
                              //   )}
                              validateStatus={
                                validateList &&
                                handleValidateStatus(validateList[fIdx])
                              }
                              help={
                                validateList && handleHelp(validateList[fIdx])
                              }
                            >
                              <Input
                                data-test="tableNameInputValue"
                                placeholder="Table Name"
                                style={{ minWidth: 100, maxWidth: 500 }}
                                defaultValue={field.columnComment}
                                //   disabled={editDescriptQuery.isLoading}
                                maxLength={INPUT_RULES.TABLE_NAME.value}
                                disabled={
                                  !nodeData.edit || selectStorage === ''
                                }
                                onBlur={() => onBlurTableName(fIdx)}
                              />
                            </Form.Item>
                          </div>

                          {form.getFieldValue('storageType') ===
                            'WisDOM Temp Dataset' &&
                          form.getFieldValue('columns')[fIdx].checkbox ===
                            true ? (
                            <>
                              <div style={{ marginLeft: '90px' }}>
                                Table Description (limited to 100 characters):
                              </div>
                              <Form.Item
                                name={[field.name, 'tableDescription']}
                                fieldKey={[field.fieldKey, 'tableDescription']}
                              >
                                <TextArea
                                  style={{ marginLeft: '70px', width: '88%' }}
                                  placeholder="Table Description"
                                  maxLength={100}
                                  autoSize={{ minRows: 2, maxRows: 2 }}
                                  disabled={
                                    !nodeData.edit || selectStorage === ''
                                  }
                                />
                              </Form.Item>
                            </>
                          ) : null}
                        </>
                      ))}
                    </>
                  )}
                </Form.List>
              </Style.FormItemMapping>
            </>
          ) : null}
        </Form>
      </Spin>
    </Style.DataRobotScroll>
  );
};

export default Poperties;
