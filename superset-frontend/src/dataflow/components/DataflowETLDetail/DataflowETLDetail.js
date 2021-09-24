/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
// eslint-disable-next-line no-restricted-imports
import {
  Spin,
  Space,
  Button,
  Modal,
  message,
  Tooltip,
  Pagination,
  Result,
  Switch,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  SettingOutlined,
  CloseOutlined,
  CheckOutlined,
  PlaySquareOutlined,
  InfoCircleOutlined,
  RedoOutlined,
  // WarningOutlined,
} from '@ant-design/icons';
import { refreshChart } from 'src/chart/chartAction';
import ConfirmModal from 'src/wisDOM/components/ConfirmModal/ConfirmModal';
import { getCheckPublish } from 'src/apis/DataFlowApi';
import { DataFlowApi } from '~~apis/';
import { DATE_TYPE, ROLEPERMISSION } from '~~constants/index';
import { useModal, useQuery } from '~~hooks/';
import SqlKedro from '../../../wisDOM/components/SqlKedro/SqlKedro';
import './DataflowETLDetailStyle.less';
import CustomCronModal from '../../../wisDOM/components/CronModal/CustomCronModal';
import DataflowRunDetailModal from '../DataflowRunDetailModal/DataflowRunDetailModal';
import WorkflowReferenceModal from '../WorkflowReferenceModal/WorkflowReferenceModal';
import LoadingModal from '../../../components/LoadingModal/LoadingModal';

import * as Style from './style';
// import RunIcon from '../../../../images/running.svg';

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));

const INIT_VALUE = {
  diagram: undefined,
  seqId: undefined,
  projectName: undefined,
  groupId: undefined,
};

const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));

const INIT_PERMISSION = { edit: false, execute: false, delete: false };

const DataflowETLDetail = ({
  groupId,
  curr,
  setCurr,
  fourceUpdate,
  edit,
  setEdit,
}) => {
  const [detailData, setDetailData] = useState({ ...INIT_VALUE });
  const [deleteIsLoading, setDeleteIsLoading] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [cronLoading, setCronLoading] = useState(false);
  const [targetUsedLoading, setTargetUsedLoading] = useState(false);
  const [saveOrRunLoading, setSaveOrRunLoading] = useState(false);
  const [resetShowData, setResetShowData] = useState(false);
  const [cronValue, setCronValue] = useState(''); //  for UI to Cron
  const [getUIValue, setGetUIValue] = useState(''); // for Cron to UI
  const [saveCronValue, setSaveCronValue] = useState('');
  const [healthyAssessment, setHealthyAssessment] = useState(false); // 是否啟用 dataset 更新檢查功能
  const [deserialize, setDeserialize] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [runHistoryData, setRunHistoryData] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const [currentTabKey, setCurrentTabKey] = useState('etlContentVisual');
  const deleteConfirmModal = useModal();
  const publishConfirmModal = useModal();
  const cronPopupModal = useModal();
  const saveDataFlow = useQuery(DataFlowApi.saveDataFlow);
  const dataflowRunDetailModal = useModal();
  const referenceModal = useModal();
  const [count, setCount] = useState(0);
  const [runsEdit, setRunsEdit] = useState(false);
  const [publishChange, setPublishChange] = useState(false); // for target clickPublish
  const [oldKedroDiagram, setOldKedroDiagram] = useState(); // 一進來塞到kedro的圖
  const [permission, setPermission] = useState({ ...INIT_PERMISSION });
  const [usedTargetList, setUsedTargetList] = useState();
  const loadingModal = useModal();
  // const [outputData, setOutputData] = useState([]);
  const outputData = [];

  //   const resetDeserialize = () => {
  //     setResetShowData(true);
  //   };

  const trimNumber = str => str.replace(/\d+/g, '');

  const checkDataflowTargetIsUsed = async () => {
    setTargetUsedLoading(true);
    try {
      const result = await DataFlowApi.getUsedTargetId(curr);
      setUsedTargetList(result);
    } catch (e) {
      console.log(e);
    } finally {
      setTargetUsedLoading(false);
    }
  };

  const getDataFlowDetail = async editMode => {
    setLoading(true);
    try {
      const result = await DataFlowApi.getDataFlowDetail(curr);
      const editing = await DataFlowApi.checkDataFlowLock(curr); // check editingm
      const tmpDiagram = JSON.parse(result.diagram);

      if (
        detailData.diagram !== undefined &&
        JSON.stringify(tmpDiagram) !== JSON.stringify(detailData.diagram)
      ) {
        const oldDiagram = detailData.diagram.nodes.map(e => e.id); // old ID List
        const nowDiagram = tmpDiagram.nodes.map(e => e.id); // now ID List

        const sameId = oldDiagram.filter(e => nowDiagram.includes(e));
        const mom = moment().format('x');
        let count = 0;

        tmpDiagram.nodes.forEach(e => {
          if (sameId.includes(e.id)) {
            tmpDiagram.edges.forEach(x => {
              if (x.source === e.id) {
                // eslint-disable-next-line no-param-reassign
                x.source = trimNumber(e.id) + mom + count;
              }
              if (x.target === e.id) {
                // eslint-disable-next-line no-param-reassign
                x.target = trimNumber(e.id) + mom + count;
              }
            });
            e.id = trimNumber(e.id) + mom + count;
            count += 1;
          }
        });
      }
      setOldKedroDiagram(tmpDiagram);
      result.diagram = tmpDiagram;

      setDetailData({ ...result, editing });
      setGetUIValue(result.schedule);
      // 接入數據要存預設檢查更新值
      setHealthyAssessment(result.healthyAssessment);

      if (editMode !== undefined) {
        setEdit(editMode);
      } else setEdit(false);
      //   resetDeserialize(); // List item change =>update chart
      setResetShowData(true);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      checkDataflowTargetIsUsed();
    }
  };

  const getDataFlowHistory = async page => {
    setLoading(true);
    try {
      const result = await DataFlowApi.getDataFlowHistory(curr, page);
      setRunHistoryData(result.results);
      setPageInfo(result.pageInfo);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (curr) {
      setCurrentTabKey('etlContentVisual');
      setCurrentPage(1);
      getDataFlowDetail();
      getDataFlowHistory(currentPage);
    }
  }, [curr]);

  const targetIdChange = () => {
    const oldTargetList =
      oldKedroDiagram && oldKedroDiagram.nodes.length !== 0
        ? oldKedroDiagram.nodes.filter(item => item.type === 'Target')
        : [];
    const nowTargetList =
      deserialize.nodes.length !== 0
        ? deserialize.nodes.filter(item => item.type === 'Target')
        : [];

    const nowIdList = nowTargetList.map(e => e.id);
    const oldIdList = oldTargetList.map(e => e.id);

    return (
      JSON.stringify(nowIdList.sort()) !== JSON.stringify(oldIdList.sort()) // change=true
    );
  };

  const getDataFlowRunStatus = async () => {
    try {
      const result = await DataFlowApi.getDataFlowRunStatus(detailData.seqId);
      setRunsEdit(result);
      setCount(count + 1);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (detailData.seqId && !edit) {
      setTimeout(
        () => {
          getDataFlowRunStatus();
        },
        count > 0 ? 10000 : 1,
      );
    }
  }, [detailData, count]);

  const checkBeforeSave = sendData => {
    const transformList =
      sendData.diagram.nodes.length !== 0
        ? sendData.diagram.nodes.filter(item => item.type === 'Transform')
        : [];

    const saveStatus = transformList.map(item => {
      if (item.args.classification === 'SelectFields') {
        return (
          item.args.fields === undefined ||
          (item.args.fields !== undefined && item.args.fields.length === 0)
        );
      }
      if (item.args.classification === 'Customize') {
        return (
          item.args.sql === undefined ||
          (item.args.sql !== undefined && item.args.sql === '') ||
          item.args.frontend === undefined ||
          item.args.frontend.sqlVerify === undefined ||
          (item.args.frontend &&
            item.args.frontend.sqlVerify &&
            item.args.frontend.sqlVerify === false)
        );
      }
      if (item.args.classification === 'Join') {
        // should be inner/left/rightjoin
        return true;
      }
      return '';
    });
    return saveStatus.includes(true);
  };

  const checkTargetBeforeSave = sendData => {
    const targetList =
      sendData.diagram.nodes.length !== 0
        ? sendData.diagram.nodes.filter(item => item.type === 'Target')
        : [];

    // Transform or Cleansing 有error不能save
    const transformList =
      sendData.diagram.nodes.length !== 0
        ? sendData.diagram.nodes.filter(item => item.type === 'Transform')
        : [];

    const CleanList =
      sendData.diagram.nodes.length !== 0
        ? sendData.diagram.nodes.filter(item => item.type === 'Cleansing')
        : [];

    const errorFilter = targetList.filter(e => e.check === 'error');
    const errorFilterTrans = transformList.filter(e => e.check === 'error');
    const errorFilterClean = CleanList.filter(e => e.check === 'error');

    if (
      errorFilter.length > 0 ||
      errorFilterTrans.length > 0 ||
      errorFilterClean.length > 0
    ) {
      return true;
    }
    return false;
  };

  const sameTarget = data => {
    const targetList =
      data.diagram.nodes.length !== 0
        ? data.diagram.nodes.filter(item => item.type === 'Target')
        : [];

    if (targetList.length !== 0) {
      const uniqName = [...new Set(targetList.map(e => e.full_name))];
      if (uniqName.length !== targetList.length) {
        return true;
      }
      return false;
    }
    return false;
  };

  const saveDataflow = async sendData => {
    setSaveOrRunLoading(true);
    try {
      const seqId = await saveDataFlow.exec(sendData); // save之後拿到 seqId 才能執行run按鈕
      if (seqId) {
        message.success('This Dataflow save successfully!');
      }

      await getDataFlowDetail();

      setEdit(false);
    } catch (e) {
      message.error(e.message);
    } finally {
      setSaveOrRunLoading(false);
    }
  };

  const OpenReferenceModel = data => {
    referenceModal.openModal(data);
  };

  const checkReference = async sendData => {
    if (targetIdChange()) {
      setSaveOrRunLoading(true);
      try {
        if (detailData.seqId) {
          const result = await DataFlowApi.getWorkflowReferences(
            detailData.seqId,
          );
          if (result.referenceProject.length !== 0) {
            setSaveOrRunLoading(false);
            OpenReferenceModel({ list: result.referenceProject });
          } else {
            // 沒有reference直接save
            // setSaveOrRunLoading(false);
            // handleSaveApi();
            saveDataflow(sendData);
          }
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      saveDataflow(sendData);
    }
  };

  const handleSaveApi = async () => {
    if (deserialize.nodes.length !== 0) {
      const sendData = {
        projectName: detailData.projectName,
        groupId: detailData.groupId,
        diagram: deserialize,
        schedule: saveCronValue || detailData.schedule,
        seqId: detailData.seqId,
        healthyAssessment,
      };
      // setSaveOrRunLoading(true);

      try {
        // await DataFlowApi.validateDataFlow(data); // 先驗證過在save
        if (!checkBeforeSave(sendData) && !checkTargetBeforeSave(sendData)) {
          if (!sameTarget(sendData)) {
            checkReference(sendData); // dataflow沒有錯在call api
            // const seqId = await saveDataFlow.exec(sendData); // save之後拿到 seqId 才能執行run按鈕
            // if (seqId) {
            //   message.success('This Dataflow save successfully!');
            // }
            // setEdit(false);
          } else {
            message.error('Target name is repeat , please change it!');
          }
        } else {
          message.error('You need to set node properties successfully!');
        }
      } catch (e) {
        message.error(e.message);
      } finally {
        setCronLoading(false);
        // setSaveOrRunLoading(false);
        setSaveCronValue('');
      }
    } else {
      message.success('There is no Data to Save!');
    }
  };

  const referenceOK = () => {
    // handleSaveApi();
    if (deserialize.nodes.length !== 0) {
      const sendData = {
        projectName: detailData.projectName,
        groupId: detailData.groupId,
        diagram: deserialize,
        schedule: saveCronValue || detailData.schedule,
        seqId: detailData.seqId,
        healthyAssessment,
      };
      saveDataflow(sendData);
    }
    referenceModal.closeModal();
  };

  const handleConfirmOK = () => {
    handleSaveApi();
    publishConfirmModal.closeModal();
  };

  const clickPublish = () => {
    const publishList =
      deserialize && deserialize.nodes.filter(e => e.args.publish === true);
    if (publishList && publishList.length > 0) {
      return true;
    }
    if (detailData.schedule !== '') {
      // 如果都沒有publish就清掉cron
      setGetUIValue('');
      detailData.schedule = '';
    }

    return false;
  };

  const handleTablePublish = async () => {
    try {
      const publishList =
        deserialize && deserialize.nodes.filter(e => e.args.publish === true);

      const nameFilter = publishList.filter(
        e => e.args.table_name !== undefined,
      );

      if (nameFilter.length > 0) {
        const tableList = publishList.map(e => e.args.table_name);
        setSaveOrRunLoading(true);
        const sendData = {
          tableList,
        };
        const result = await DataFlowApi.getCheckPublish(
          detailData.seqId,
          sendData,
        );

        if (result === true) {
          publishConfirmModal.openModal({
            title: 'Renewed Confirm',
            showMsg: (
              <Result
                // status="warning"
                extra={
                  <div style={{ fontSize: '16px' }}>
                    The dataset will be renewed after the dataflow is executed
                    and approved by data domain owner.
                  </div>
                }
              />
            ),
          });
        } else {
          handleSaveApi();
        }
      } else {
        message.error('There is no table name for published target node.');
      }
    } catch (e) {
      console.log(e);
    } finally {
      setSaveOrRunLoading(false);
    }
  };

  const handleSave = async () => {
    if (clickPublish() && detailData.schedule === '') {
      message.error(
        <>
          Please click schedule <SettingOutlined /> and setting for publishing
          table.
        </>,
      );
    } else if (clickPublish()) {
      handleTablePublish();
    } else {
      handleSaveApi();
    }
  };

  const handleBeforeLeave = () => {
    setCronValue('');
    setGetUIValue('');
    setSaveCronValue('');
    cronPopupModal.closeModal();
  };

  // TODO Jason
  const setEditStatus = async () => {
    try {
      await DataFlowApi.setEditStatus(detailData.seqId);
    } catch (e) {
      console.log(e);
    }
  };

  // TODO Jason
  const handleCloseEditClick = async () => {
    try {
      handleBeforeLeave();
      setSaveCronValue('');
      //   resetDeserialize();
      //   setResetShowData(true); // 在sqlKedro塞oldKedroDiagram
      setEdit(false);
      await DataFlowApi.cancelEditStatus(detailData.seqId);
      await getDataFlowDetail(); // 會setResetShowData
    } catch (e) {
      console.log(e);
    }
  };

  const handleResume = () => {
    getDataFlowDetail(true);
  };

  const handleSet = () => {
    if (saveCronValue !== '') setGetUIValue(saveCronValue);
    else setGetUIValue(detailData.schedule);
    cronPopupModal.openModal();
  };

  const handleDelete = async () => {
    setDeleteIsLoading(true);
    try {
      await DataFlowApi.deleteDataFlow(detailData.seqId);
      message.success('This Dataflow has been successfully deleted');
      setCurr();
      fourceUpdate();
      deleteConfirmModal.closeModal();
    } catch (e) {
      message.error(e.message);
    } finally {
      setDeleteIsLoading(false);
    }
  };

  const handleOK = () => {
    setCronLoading(true);
    if (
      cronValue !== '' &&
      cronValue !== undefined &&
      getUIValue !== undefined
    ) {
      setSaveCronValue(cronValue);
      handleBeforeLeave();
    } else if (getUIValue !== undefined) handleBeforeLeave();
    else {
      message.error('Check your select !');
    }
    setCronLoading(false);
  };

  const handleRunMethod = async () => {
    setSaveOrRunLoading(true);
    try {
      const response = await DataFlowApi.runDataFlow(curr);
      if (response) {
        setPermission({ ...INIT_PERMISSION });
        message.success('This Dataflow run successfully!');
      }
    } catch (e) {
      console.log(e);
    } finally {
      setSaveOrRunLoading(false);
    }
  };

  const checkPermission = async () => {
    try {
      const result = await DataFlowApi.checkPermission(detailData.seqId);

      setPermission(result);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setSaveOrRunLoading(false);
    }
  };

  const onChangeHealthyAssessment = checked => {
    setHealthyAssessment(checked);
  };

  useEffect(() => {
    if (detailData.seqId) {
      checkPermission();
    }
  }, [detailData, isLoading, saveOrRunLoading]);

  const renderNormalModeButton = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <span style={{ marginRight: 10 }}>
          Enable dataset healthy assessment
        </span>
        <Switch
          disabled
          style={{ width: '60px' }}
          checkedChildren="ON"
          unCheckedChildren="OFF"
          checked={healthyAssessment}
        />
      </div>
      <div>
        <Tooltip
          placement="top"
          title={
            !permission.execute || detailData.editing || runsEdit
              ? 'Dataflow is running or edited'
              : 'Run'
          }
        >
          <Button
            type="text"
            shape="circle"
            icon={<PlaySquareOutlined />}
            onClick={handleRunMethod}
            disabled={
              !permission.execute ||
              detailData.referenced ||
              detailData.editing ||
              runsEdit ||
              !ROLEPERMISSION.checkPermission(
                SYSTEMLIST,
                ROLEPERMISSION.dataPipeline.myFlows.dataflow.execute.value,
              )
            }
          />
        </Tooltip>
        <Tooltip
          placement="top"
          title={
            permission.edit
              ? detailData.editing || runsEdit
                ? 'Dataflow is running or edited'
                : 'Edit'
              : 'Not permission'
          }
        >
          <Button
            disabled={
              !permission.edit ||
              detailData.referenced ||
              detailData.editing ||
              runsEdit ||
              !ROLEPERMISSION.checkPermission(
                SYSTEMLIST,
                ROLEPERMISSION.dataPipeline.myFlows.dataflow.edit.value,
              )
            }
            type="text"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => {
              setEdit(true);
              setEditStatus();
            }}
          />
        </Tooltip>
        <Tooltip
          placement="top"
          title={
            permission.delete
              ? detailData.editing || runsEdit
                ? 'Dataflow is running or edited'
                : 'Delete'
              : 'Not permission'
          }
        >
          <Button
            disabled={
              !permission.delete ||
              detailData.referenced ||
              detailData.editing ||
              runsEdit ||
              !ROLEPERMISSION.checkPermission(
                SYSTEMLIST,
                ROLEPERMISSION.dataPipeline.myFlows.dataflow.delete.value,
              )
            }
            type="text"
            shape="circle"
            icon={<DeleteOutlined />}
            //   onClick={deleteConfirmModal.openModal}
            onClick={() =>
              deleteConfirmModal.openModal({
                showMsg: (
                  <p>
                    Are you sure you want to delete {detailData.projectName}?
                  </p>
                ),
              })
            }
          />
        </Tooltip>
        <Tooltip placement="top" title="Share">
          <Button
            // disabled={detailData.editing}
            disabled
            // disabled={
            //     !ROLEPERMISSION.checkPermission(
            //       SYSTEMLIST,
            //       ROLEPERMISSION.dataPipeline.myFlows.dataflow.share.value,
            //     )
            // }
            type="text"
            shape="circle"
            icon={<ShareAltOutlined />}
            // onClick={shareEtlModal.openModal}
          />
        </Tooltip>
      </div>
    </div>
  );

  const handleShowSchedule = () => {
    if (clickPublish()) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (publishChange === true) {
      handleShowSchedule();
      setPublishChange(false);
    }
  }, [publishChange]);

  useEffect(() => {
    if (cronValue) {
      detailData.schedule = cronValue;
      handleShowSchedule();
    }
  }, [cronValue]);

  const renderEditModeButton = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <span style={{ marginRight: 10 }}>
          Enable dataset healthy assessment
        </span>
        <Switch
          style={{ width: '60px' }}
          checkedChildren="ON"
          unCheckedChildren="OFF"
          checked={healthyAssessment}
          onChange={onChangeHealthyAssessment}
        />
      </div>
      <div>
        {handleShowSchedule() ? (
          <Tooltip placement="top" title="Schedule">
            <Button
              disabled={detailData.referenced}
              type="text"
              shape="circle"
              icon={<SettingOutlined />}
              onClick={() => handleSet()}
            />
          </Tooltip>
        ) : null}
        <Tooltip placement="top" title="Cancel">
          <Button
            disabled={detailData.referenced}
            type="text"
            shape="circle"
            icon={<CloseOutlined />}
            onClick={handleCloseEditClick}
          />
        </Tooltip>
        <Tooltip placement="top" title="Save">
          <Button
            disabled={detailData.referenced}
            type="text"
            shape="circle"
            icon={<CheckOutlined />}
            onClick={handleSave}
          />
        </Tooltip>
      </div>
    </div>
  );

  const changeEtlContentTab = key => {
    setCurrentTabKey(key);
    if (key === 'etlContentRuns') {
      getDataFlowHistory(currentPage);
    }
  };

  const getExecutionTimeFormat = (time, format, unit) => {
    if (time || time !== 0) {
      if (moment(time).format(format) !== '00') {
        return `${moment(time).format(format)} ${unit}`;
      }
      return '';
    }
    return '--';
  };

  const getDataFlowRunDetail = async runId => {
    setLoading(true);
    try {
      const result = await DataFlowApi.getDataFlowRunDetail(runId);
      dataflowRunDetailModal.openModal(result);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const dataflowStatusBox = () =>
    runHistoryData !== [] &&
    runHistoryData.map((run, index) => (
      <Style.StatusBox key={index}>
        <div
          style={{
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          {run.endTime && moment(run.endTime).format(DATE_TYPE.DATE_TIME)}
          {run.status === 'FAILED' && (
            <Tooltip placement="rightTop" title={<span>Error Info</span>}>
              <InfoCircleOutlined
                onClick={() => getDataFlowRunDetail(run.runId)}
              />
            </Tooltip>
          )}
        </div>
        <Style.StatusBoxContent>
          <div>
            Run Status: <span>{run.status ? run.status : '--'}</span>
          </div>
          <Style.SepLine />
          <div>
            Execution Time:{' '}
            <span style={{ marginLeft: 0 }}>
              {getExecutionTimeFormat(run.executionTime, 'mm', 'min')}
            </span>
            <span>
              {getExecutionTimeFormat(run.executionTime, 'ss', 'secs')}
            </span>
          </div>
          <Style.SepLine />
          <div>
            <div>
              Start Time:{' '}
              <span>
                {run.startTime
                  ? moment(run.startTime).format(DATE_TYPE.DATE_TIME)
                  : '--'}
              </span>
            </div>
            <div>
              End Time:{' '}
              <span>
                {run.endTime
                  ? moment(run.endTime).format(DATE_TYPE.DATE_TIME)
                  : '--'}
              </span>
            </div>
          </div>
        </Style.StatusBoxContent>
      </Style.StatusBox>
    ));

  const changePage = page => {
    setCurrentPage(page);
    getDataFlowHistory(page);
  };

  const renderEtlContent = () => (
    // const todayDate = new Date().toLocaleDateString();
    // const todayRunJobs = runHistoryData.filter(
    //   run => moment(run.startTime).format('DD/MM/YYYY') === todayDate,
    // );

    <Style.EtlContentTabs
      // defaultActiveKey="etlContentVisual"
      activeKey={currentTabKey}
      onChange={changeEtlContentTab}
    >
      <Style.EtlContentTabPane tab="Visual" key="etlContentVisual">
        {detailData.diagram !== undefined ? (
          <>
            <div>
              {!edit ? renderNormalModeButton() : renderEditModeButton()}
            </div>
            <SqlKedro
              oEntity={detailData.diagram}
              dataFlowChangedGroupId={
                detailData.groupId !== undefined ? detailData.groupId : groupId
              }
              edit={edit}
              setDiagram={setDeserialize}
              sqlID={detailData.seqId}
              resetShowData={resetShowData}
              setResetShowData={setResetShowData}
              changeGroupStatus={false}
              historyMode
              projectName={detailData.projectName}
              diagram={deserialize}
              schedule={saveCronValue || detailData.schedule}
              handleResume={handleResume}
              setPublishChange={setPublishChange}
              //   oldKedroDiagram={oldKedroDiagram}
              usedTargetList={usedTargetList}
            />
          </>
        ) : null}
      </Style.EtlContentTabPane>
      <Style.EtlContentTabPane tab="Runs" key="etlContentRuns">
        <RedoOutlined
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            fontSize: '20px',
            marginRight: '20px',
          }}
          onClick={() => getDataFlowHistory(currentPage)}
        />
        <Style.StatusBoxTitle>
          Recent job runs(<span>{pageInfo.recentJob}</span>)
        </Style.StatusBoxTitle>
        <Style.StatusBoxContainer>
          {dataflowStatusBox()}
          <Style.Pagination>
            <Pagination
              current={currentPage}
              onChange={changePage}
              total={pageInfo.total}
              pageSize={10}
            />
          </Style.Pagination>
        </Style.StatusBoxContainer>
        <DataflowRunDetailModal modal={dataflowRunDetailModal} />
      </Style.EtlContentTabPane>
    </Style.EtlContentTabs>
  );
  return (
    <div className="etlDetail">
      <Spin spinning={isLoading || saveOrRunLoading || targetUsedLoading}>
        <div className="etlHeader">
          <div className="left">
            <Style.ProjectTitle title={detailData.projectName}>
              {detailData.projectName}
            </Style.ProjectTitle>
            <div className="etlInfo-detail-container">
              <div>
                <p>GroupName: {detailData.groupName && detailData.groupName}</p>
                <p>Frequency: {detailData.frequency && detailData.frequency}</p>
              </div>
              {edit || detailData.editorEnName ? (
                <div className="edit-info">
                  <p>
                    Current Editor:{' '}
                    {edit ? bootstrap.user.lastName : detailData.editorEnName}
                  </p>
                  <p>
                    Editing Time:{' '}
                    {edit
                      ? moment().format(DATE_TYPE.DATE_TIME)
                      : detailData.editAt
                      ? moment(detailData.editAt).format(DATE_TYPE.DATE_TIME)
                      : ''}
                  </p>
                </div>
              ) : null}
              {edit || detailData.editorEnName ? null : (
                <div className="edit-info">
                  <p>Last Editor: {detailData.lastUpdateUserEnName}</p>
                  <p>
                    Last Edit Time:{' '}
                    {detailData.lastUpdateUserAt
                      ? moment(detailData.lastUpdateUserAt).format(
                          DATE_TYPE.DATE_TIME,
                        )
                      : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="etlContent">{renderEtlContent()}</div>
      </Spin>
      {/* <Spin spinning={updateIsloading}> */}
      {/* </Spin> */}
      {/* <Modal
        title="Confirm Deletion"
        visible={deleteConfirmModal.visible}
        onOk={handleDelete}
        onCancel={deleteConfirmModal.closeModal}
        maskClosable={!deleteIsLoading}
        confirmLoading={deleteIsLoading}
        closable={!deleteIsLoading}
        cancelButtonProps={{ disabled: deleteIsLoading }}
      >
        <p>Are you sure you want to delete {detailData.projectName}?</p>
      </Modal> */}
      <ConfirmModal
        modal={deleteConfirmModal}
        handleOK={handleDelete}
        loading={deleteIsLoading}
      />
      <ConfirmModal
        modal={publishConfirmModal}
        handleOK={handleConfirmOK}
        loading={saveOrRunLoading}
      />
      <CustomCronModal
        modal={cronPopupModal}
        loading={cronLoading}
        handleOK={handleOK}
        setCronValue={setCronValue}
        getUIValue={getUIValue}
        setGetUIValue={setGetUIValue}
        // healthyAssessment={healthyAssessment}
        // setHealthyAssessment={setHealthyAssessment}
      />
      <WorkflowReferenceModal modal={referenceModal} handleOK={referenceOK} />
    </div>
  );
};

DataflowETLDetail.propTypes = {};

DataflowETLDetail.defaultProps = {};

export default DataflowETLDetail;
