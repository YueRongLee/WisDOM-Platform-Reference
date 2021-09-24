/* eslint-disable no-unused-vars */
/* eslint-disable react/no-danger */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
// eslint-disable-next-line no-restricted-imports
import {
  Spin,
  Space,
  Button,
  message,
  Tooltip,
  Pagination,
  Timeline,
  Divider,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  // SettingOutlined,
  CloseOutlined,
  LockOutlined,
  CheckOutlined,
  PlaySquareOutlined,
  UnlockOutlined,
  // InfoCircleOutlined,
  RedoOutlined,
  CaretRightOutlined,
  CaretUpOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import RunPreviewKedro from 'src/wisDOM/components/FlowsComponent/RunPreviewKedro/RunPreviewKedro';
import ConfirmModal from 'src/wisDOM/components/ConfirmModal/ConfirmModal';
import { WorkFlowApi, DataFlowApi } from 'src/apis/';
import { DATE_TYPE, ROLEPERMISSION } from '~~constants/index';
import { useModal, useQuery } from '~~hooks/';
import WorkflowKedro from '../../../wisDOM/components/WorkflowKedro/WorkflowKedro';
import './WorkFlowETLInfoStyle.less';
import WorkflowRunDetailModal from '../WorkflowRunDetailModal/WorkflowRunDetailModal';
import * as Style from './style';

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));

const INIT_PERMISSION = {
  edit: false,
  active: false,
  execute: false,
  delete: false,
};

const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));

const WorkFlowETLInfo = ({
  curr,
  setCurr,
  update,
  fourceUpdate,
  setCreateNewWork,
  edit,
  setEdit,
}) => {
  const [isLoading, setLoading] = useState(false);
  const [deleteLoading, setDeleteIsLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [deserialize, setDeserialize] = useState('');
  const [resetShowData, setResetShowData] = useState(false);
  const [save, setSave] = useState(true); // workspace預設已存
  const [currentPage, setCurrentPage] = useState(1);
  const [runHistoryData, setRunHistoryData] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const [currentTabKey, setCurrentTabKey] = useState('etlContentVisual');
  const [count, setCount] = useState(0);
  const [runsEdit, setRunsEdit] = useState(false);
  const [isStepsLoading, setStepsLoading] = useState(false);
  const [diagram, setDiagram] = useState({
    diagram: '',
    nodeInfo: [],
  });
  const [workflowDigram, setWorkflowDiagram] = useState('');
  const [workflowNodeInfo, setWorkflowNodeInfo] = useState([]);
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [permission, setPermission] = useState({ ...INIT_PERMISSION });

  const saveWorkFlow = useQuery(WorkFlowApi.saveWorkFlow);

  const deleteConfirmModal = useModal();
  const workflowRunDetailModal = useModal();

  const resetDeserialize = () => {
    setResetShowData(true);
  };

  const getWorkFlowRunStatus = async seqId => {
    try {
      const result = await WorkFlowApi.getWorkFlowRunStatus(seqId);
      setRunsEdit(result);
      setTimeout(() => {
        setCount(count + 1);
      }, 5000);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getWorkFlowDetail = async () => {
    setLoading(true);
    try {
      const result = await WorkFlowApi.getWorkFlowDetail(curr);
      const editing = await WorkFlowApi.checkWorkFlowLock(curr);
      setActive(result.isActivated);
      setEdit(false);
      setDetailData({ ...result, editing });
      getWorkFlowRunStatus(result.seqId);
      resetDeserialize(); // List item change =>update chart
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getWorkFlowRunDetail = async runId => {
    setStepsLoading(true);
    try {
      const result = await WorkFlowApi.getWorkFlowRunDetail(runId);
      setWorkflowDiagram(result.diagram);
      setWorkflowNodeInfo(result.workflowNodeInfo);
      setDiagram({
        diagram: result.diagram,
        nodeInfo: result.workflowNodeInfo,
      });
      const determineResult = result.workflowNodeInfo.map(item => {
        if (item.nodeType === 'TRANSFORM') {
          return {
            ...item,
            nodeType: 'DATA FLOW',
          };
        }
        return item;
      });
      return determineResult;
    } catch (e) {
      console.log(e);
    } finally {
      setStepsLoading(false);
    }
  };

  const getWorkFlowHistory = async page => {
    setLoading(true);
    try {
      const elmnt = document.getElementById('top');
      const result = await WorkFlowApi.getWorkFlowHistory(curr, page);
      const tempResult = [...result.results].map(item => ({
        ...item,
        expand: false,
        workflowSteps: [],
      }));
      setRunHistoryData(tempResult);
      setPageInfo(result.pageInfo);
      elmnt.scrollTop = 10;
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  // TODO Jason
  const setEditStatus = async () => {
    try {
      await WorkFlowApi.setEditStatus(detailData.seqId);
    } catch (e) {
      console.log(e);
    }
  };

  // TODO Jason
  const handleCloseEditClick = async () => {
    try {
      setEdit(false);
      setSave(true);
      resetDeserialize();
      await WorkFlowApi.cancelEditStatus(detailData.seqId);
      await getWorkFlowDetail();
    } catch (e) {
      console.log(e);
    }
  };

  const handleWorkActive = async () => {
    setLoading(true);
    try {
      if (!isActive) {
        await WorkFlowApi.WorkFlowActive(curr);
      } else {
        await WorkFlowApi.WorkFlowDeActive(curr);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setActive(!isActive);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteIsLoading(true);
    try {
      await WorkFlowApi.deleteDataFlow(detailData.seqId);
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

  const dataRobotCheck = createDRNodes => {
    let check = false;
    createDRNodes.forEach(e => {
      if (e.check === 'error') {
        check = true;
      }
    });

    return check;
  };

  const insertDataError = filterNodes => {
    let totalStatus = false;
    const targetList = filterNodes.map(e => e.args.targetMapping);

    if (targetList) {
      targetList.forEach(e => {
        const checkboxList = e.map(a => a.checkbox);
        const noRepeat = [...new Set(checkboxList)];
        if (noRepeat.length === 1 && noRepeat[0] !== true) {
          totalStatus = true;
        }
      });
    }

    return totalStatus;
  };

  const handleSave = async () => {
    deserialize.nodes.forEach(e => {
      if (e.args.targetMapping) {
        e.args.targetMapping.forEach(a => {
          if (a.checkbox !== true) {
            a.checkbox = false;
          }
        });
      }
    });

    const filter = deserialize.nodes.filter(
      e => e.args.targetMapping !== undefined,
    );
    const filterCreateDataRobot = deserialize.nodes.filter(
      e => e.args.classification === 'createDataRobotProject',
    );

    const errorAry = filter.map(e =>
      e.args.targetMapping.find(
        e =>
          e.duplicateStatus === 'error' ||
          e.duplicateStatus === 'sameError' ||
          e.duplicateStatus === 'ruleError',
      ),
    );

    if (errorAry[0] !== undefined) {
      message.error(
        'There is a error in table name mapping , please check it!',
      );
    } else if (
      filterCreateDataRobot.length > 0 &&
      dataRobotCheck(filterCreateDataRobot)
    ) {
      message.error(
        'Some properies is null or error in Create a Project on DataRobot Prediction , please check it !',
      );
    } else if (filter && insertDataError(filter)) {
      message.error(
        'No TableName checkbox selected for output in InsertData/DataRobot Prediction ,please check it !',
      );
    } else if (
      detailData.projectName === '' ||
      detailData.projectName === undefined
    ) {
      message.error('Please Input a Project Name!');
    } else {
      setLoading(true);
      try {
        const sendData = {
          diagram: deserialize,
          seqId: detailData.seqId,
          projectName: detailData.projectName,
          groupId: detailData.groupId,
        };
        const seqId = await saveWorkFlow.exec(sendData);
        if (seqId) {
          message.success('This Workflow save successfully');
          setSave(true);
          fourceUpdate();
        }
        setEdit(false);
      } catch (e) {
        // message.error(e.message);
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRunMethod = async () => {
    // check test connect
    // nodes=>args=>frontend=>testConnect
    setLoading(true);
    try {
      const response = await WorkFlowApi.runWorkFlow(curr);
      if (response) {
        setPermission({ ...INIT_PERMISSION });
        message.success('This Workflow run successfully!');
      }
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async () => {
    try {
      const result = await WorkFlowApi.checkPermission(detailData.seqId);
      setPermission(result);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (curr === detailData.seqId) {
      getWorkFlowRunStatus(detailData.seqId);
    }
  }, [count]);

  useEffect(() => {
    if (detailData.seqId) {
      checkPermission();
    }
  }, [detailData, isLoading]);

  const renderNormalModeButton = () => (
    <Space>
      {/* <UnlockOutlined /> */}
      <Tooltip
        placement="top"
        title={
          permission.active
            ? detailData.editing || runsEdit
              ? 'Workflow is running or edited'
              : isActive
              ? 'Active'
              : 'InActive'
            : 'Not permission'
        }
      >
        <Button
          type="text"
          shape="circle"
          icon={!isActive ? <LockOutlined /> : <UnlockOutlined />}
          onClick={handleWorkActive}
          disabled={
            !permission.active ||
            detailData.referenced ||
            detailData.editing ||
            runsEdit ||
            !ROLEPERMISSION.checkPermission(
              SYSTEMLIST,
              ROLEPERMISSION.dataPipeline.myFlows.workflow.active.value,
            )
          }
        />
      </Tooltip>
      <Tooltip
        placement="top"
        title={
          !permission.execute || detailData.editing || runsEdit
            ? 'Workflow is running or edited'
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
              ROLEPERMISSION.dataPipeline.myFlows.workflow.execute.value,
            )
          }
        />
      </Tooltip>
      <Tooltip
        placement="top"
        title={
          permission.edit
            ? detailData.editing || runsEdit
              ? 'Workflow is running or edited'
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
              ROLEPERMISSION.dataPipeline.myFlows.workflow.edit.value,
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
              ? 'Workflow is running or edited'
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
              ROLEPERMISSION.dataPipeline.myFlows.workflow.delete.value,
            )
          }
          type="text"
          shape="circle"
          icon={<DeleteOutlined />}
          //   onClick={deleteConfirmModal.openModal}
          onClick={() =>
            deleteConfirmModal.openModal({
              showMsg: (
                <p>Are you sure you want to delete {detailData.projectName}?</p>
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
          //       ROLEPERMISSION.dataPipeline.myFlows.workflow.share.value,
          //     )
          // }
          type="text"
          shape="circle"
          icon={<ShareAltOutlined />}
          // onClick={shareEtlModal.openModal}
        />
      </Tooltip>
    </Space>
  );

  const renderEditModeButton = () => (
    <Space>
      {/* {getUIValue !== '' ? ( */}
      {/* <Button
        disabled={detailData.referenced}
        type="text"
        shape="circle"
        icon={<SettingOutlined />}
        // onClick={() => handleSet()}
      /> */}
      {/* ) : null} */}
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
    </Space>
  );

  const changeEtlContentTab = key => {
    setCurrentTabKey(key);
    if (key === 'etlContentRuns') {
      getWorkFlowHistory(currentPage);
    }
  };

  const getDataFlowInfo = async id => {
    setDiagramLoading(true);
    try {
      const result = await DataFlowApi.getDataFlowDetailWithDiagram(id);
      setDiagram({
        diagram: result.diagram,
        nodeInfo: result.nodeInfo,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setDiagramLoading(false);
    }
  };

  const setWorkflow = () => {
    setDiagramLoading(true);
    setDiagram({
      diagram: workflowDigram,
      nodeInfo: workflowNodeInfo,
    });
    setDiagramLoading(false);
  };

  const showWorkFlowRunInfo = data => {
    if (data && Array.isArray(data)) {
      if (data.length !== 0) {
        const getCircleColor = status => {
          let circleColor;
          switch (status) {
            case 'SUCCESS':
              circleColor = 'green';
              return circleColor;
            case 'FAIL':
              circleColor = 'red';
              return circleColor;
            case 'SKIP':
              circleColor = 'blue';
              return circleColor;
            case 'RUNNING':
              circleColor = 'gray';
              return circleColor;
            default:
              circleColor = 'gray';
              return circleColor;
          }
        };
        return (
          <div>
            <Button
              type="primary"
              icon={<ApartmentOutlined />}
              style={{ marginBottom: 10 }}
              onClick={() => setWorkflow()}
            >
              Workflow
            </Button>
            <div style={{ width: '100%', display: 'flex', marginTop: 10 }}>
              <div style={{ width: '50%', height: 400, overflow: 'auto' }}>
                <Timeline>
                  {data.map(node => (
                    <Timeline.Item color={getCircleColor(node.status)}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: 20,
                        }}
                      >
                        <span
                          style={{
                            color: getCircleColor(node.status),
                            fontWeight: 'bold',
                            marginTop: 5,
                          }}
                        >
                          {node.status}
                        </span>
                        {node.nodeType === 'DATA FLOW' ? (
                          <Button
                            icon={<ApartmentOutlined />}
                            shape="circle"
                            style={{
                              marginLeft: 10,
                              background: '#5DAC81',
                              borderColor: '#5DAC81',
                              color: '#ffff',
                            }}
                            onClick={() => getDataFlowInfo(node.dataflowRunId)}
                          />
                        ) : null}
                      </div>
                      <p>
                        <span style={{ color: 'rgb(144 144 144 / 90%)' }}>
                          Node Name:{' '}
                        </span>
                        {node.nodeName}
                      </p>
                      <p>
                        <span style={{ color: 'rgb(144 144 144 / 90%)' }}>
                          Node Type:{' '}
                        </span>
                        {node.nodeType}
                      </p>
                      <p>
                        <span style={{ color: 'rgb(144 144 144 / 90%)' }}>
                          Node Action:{' '}
                        </span>{' '}
                        {node.nodeAction}
                      </p>
                      {node.errorMessage !== '' ? (
                        <p>
                          <span style={{ color: 'rgb(144 144 144 / 90%)' }}>
                            Node Error Message:{' '}
                          </span>{' '}
                          <div
                            dangerouslySetInnerHTML={{
                              __html: node.errorMessage,
                            }}
                          />
                        </p>
                      ) : null}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
              <div
                style={{
                  width: '50%',
                  height: 400,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {diagramLoading ? (
                  <Spin spinning={diagramLoading} />
                ) : (
                  <RunPreviewKedro
                    diagram={diagram.diagram}
                    nodeInfo={diagram.nodeInfo}
                    // workflowNodeInfo
                  />
                )}
              </div>
            </div>
          </div>
        );
      }
      return <div>No Node Data of this run</div>;
    }
    return null;
  };

  const expand = async seqId => {
    const tempResult = [...runHistoryData];

    for (let i = 0; i < tempResult.length; i++) {
      if (tempResult[i].seqId === seqId) {
        if (!tempResult[i].expand) {
          tempResult[i].expand = !tempResult[i].expand;
          tempResult[i].workflowSteps = await getWorkFlowRunDetail(
            tempResult[i].seqId,
          );
        } else {
          tempResult[i].expand = !tempResult[i].expand;
        }
      } else {
        tempResult[i].expand = false;
      }
    }
    setRunHistoryData(tempResult);
  };

  const workflowStatusBox = () =>
    runHistoryData !== [] &&
    runHistoryData.map(run => (
      <>
        <Style.StatusBox>
          <div onClick={() => expand(run.seqId)}>
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '14px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {run.createDt && moment(run.createDt).format(DATE_TYPE.DATE_TIME)}
              {run.expand ? (
                <CaretUpOutlined style={{ fontSize: 18 }} />
              ) : (
                <CaretRightOutlined style={{ fontSize: 18 }} />
              )}
            </div>
            <Style.StatusBoxContent>
              <div>
                Last Run Status:{' '}
                <span style={{ marginLeft: 10 }}>
                  {run.status}
                  {/* {run.status && (
                <Tooltip placement="rightTop" title={<span>Step Info</span>}>
                  <InfoCircleOutlined
                    onClick={() => getWorkFlowRunDetail(run.seqId)}
                  />
                </Tooltip>
              )} */}
                </span>
              </div>
              <div>
                Last Run:{' '}
                <span style={{ marginLeft: 10 }}>
                  {run.updateDt &&
                    moment(run.updateDt).format(DATE_TYPE.DATE_TIME)}
                </span>
              </div>
            </Style.StatusBoxContent>
          </div>
          {run.expand && (
            <Spin spinning={isStepsLoading}>
              <Divider style={{ background: '#cfd8dc' }} />
              <div>{showWorkFlowRunInfo(run.workflowSteps)}</div>
            </Spin>
          )}
        </Style.StatusBox>
      </>
    ));

  const changePage = page => {
    setCurrentPage(page);
    getWorkFlowHistory(page);
  };

  const renderEtlContent = () => (
    <Style.EtlContentTabs
      activeKey={currentTabKey}
      onChange={changeEtlContentTab}
    >
      <Style.EtlContentTabPane tab="Visual" key="etlContentVisual">
        {detailData.diagram !== undefined &&
        currentTabKey === 'etlContentVisual' ? (
          <>
            <div className="toolbutton">
              {!edit ? renderNormalModeButton() : renderEditModeButton()}
            </div>
            <WorkflowKedro
              oEntity={JSON.parse(detailData.diagram)}
              dataFlowChangedGroupId={detailData.groupId}
              edit={edit}
              setDiagram={setDeserialize}
              sqlID={detailData.seqId}
              resetShowData={resetShowData}
              setResetShowData={setResetShowData}
              historyMode // true = In workspace
              save={save}
              setSave={setSave}
              isCreateNewWork={false}
              setCreateNewWork={setCreateNewWork}
            />
          </>
        ) : null}
      </Style.EtlContentTabPane>
      <Style.EtlContentTabPane tab="Runs" key="etlContentRuns">
        {detailData.diagram !== undefined &&
        currentTabKey === 'etlContentRuns' ? (
          <>
            <RedoOutlined
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                fontSize: '20px',
                marginRight: '20px',
              }}
              onClick={() => getWorkFlowHistory(currentPage)}
            />

            <Style.StatusBoxTitle>
              Recent job runs(<span>{pageInfo.recentJob}</span>)
            </Style.StatusBoxTitle>
            <Style.StatusBoxContainer id="top">
              {workflowStatusBox()}
              <Style.Pagination>
                <Pagination
                  current={currentPage}
                  onChange={changePage}
                  total={pageInfo.total}
                  pageSize={10}
                />
              </Style.Pagination>
            </Style.StatusBoxContainer>
          </>
        ) : null}
        <WorkflowRunDetailModal modal={workflowRunDetailModal} />
      </Style.EtlContentTabPane>
    </Style.EtlContentTabs>
  );

  useEffect(() => {
    if (curr) {
      setCurrentTabKey('etlContentVisual');
      setCurrentPage(1);

      getWorkFlowDetail();
      getWorkFlowHistory(currentPage);
    }
  }, [curr, update]);

  return (
    <div className="etlDetail">
      <Spin spinning={isLoading}>
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
      {/* <Modal
        title="Confirm Deletion"
        visible={deleteConfirmModal.visible}
        onCancel={deleteConfirmModal.closeModal}
        onOk={handleDelete}
        confirmLoading={deleteLoading}
        maskClosable={!deleteLoading}
        closeable={!deleteLoading}
        cancelButtonProps={{ disabled: deleteLoading }}
      >
        <p>Are you sure you want to delete {detailData.projectName}?</p>
      </Modal> */}
      <ConfirmModal
        modal={deleteConfirmModal}
        handleOK={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default WorkFlowETLInfo;
