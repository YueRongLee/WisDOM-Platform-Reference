/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
  Spin,
  Tooltip,
  Tag,
  Progress,
  Space,
  Button,
  Modal,
  message,
  Divider,
  Input,
  Form,
  Alert,
} from 'antd';
import {
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  SettingOutlined,
  ShareAltOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import ReactGA from 'react-ga';
import SqlDiagram from 'src/wisDOM/components/SqlDiagram/SqlDiagram';
import ConfirmModal from 'src/wisDOM/components/ConfirmModal/ConfirmModal';
import { ETLApi } from '~~apis';
import {
  BLOCKCHAIN_STATUS,
  OUTPUT_TYPE,
  DATE_TYPE,
  INPUT_RULES,
  ROLEPERMISSION,
} from '~~constants/index';
import AppConfig from '~~config/';
import { useModal, useQuery } from '~~hooks/';
import { isObject } from '~~utils/common';
import SqlEditor from '../../../wisDOM/components/SqlEditor/SqlEditor';
import ethereum from '../../../../images/ethereum.svg';
import CustomCronModal from '../../../wisDOM/components/CronModal/CustomCronModal';

import './ETLDetailStyle.less';
import * as Style from './style';

const INIT_VALUE = {
  blockchainInfo: undefined,
  enabled: undefined,
  etlSql: undefined,
  eventId: undefined,
  lastJobMessage: undefined,
  lastJobStatus: undefined,
  outputCDM: undefined,
  outputDB: undefined,
  outputHive: undefined,
  outputWl: undefined,
  piplineRequest: undefined,
  projectName: undefined,
  pyPath: undefined,
  schedule: undefined,
  seqId: undefined,
  userId: undefined,
  diagram: undefined,
  referenced: undefined,
};

const ETLDetail = ({ curr, setCurr, forceUpdate, forceUpdateShare, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [alertError, setError] = useState();
  const [deleteIsLoading, setDeleteIsLoading] = useState(false);
  const [updateIsloading, setUpdateIsLoading] = useState(false);
  const [shareIsloading, setShareIsloading] = useState(false);
  const [cronLoading, setCronLoading] = useState(false);
  const [detailData, setDetailData] = useState({ ...INIT_VALUE });
  const [edit, setEdit] = useState(false);
  const [resetDeserializeVal, setResetDeserializeVal] = useState(0);
  const [model, setModel] = useState();
  const deleteConfirmModal = useModal();
  const [cronValue, setCronValue] = useState(''); //  for UI to Cron
  const [getUIValue, setGetUIValue] = useState(''); // for Cron to UI
  const [saveCronValue, setSaveCronValue] = useState(''); // for OK save Value
  const cronPopupModal = useModal();
  const getAllSqlQuery = useQuery(ETLApi.getAllSql);
  const shareQuery = useQuery(ETLApi.shareETL);
  const shareEtlModal = useModal();
  const saveConfirmModal = useModal();
  const [form] = Form.useForm();
  const { trackEvent } = useMatomo();
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));
  const resetDeserialize = () => {
    let nextVal = resetDeserializeVal;
    setResetDeserializeVal((nextVal += 1));
  };

  const resetAll = () => {
    setDetailData({ ...INIT_VALUE });
    setEdit(false);
    resetDeserialize();
  };

  const getETLDetail = async () => {
    setIsLoading(true);
    try {
      const result = await ETLApi.getETLDetail(curr);
      setDetailData(result);
      setGetUIValue(result.schedule);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const setEditStatus = async () => {
    try {
      await ETLApi.setETLEditStatus(detailData.seqId);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    resetAll();
    if (curr) {
      getETLDetail();
    }
  }, [curr]);

  const getOutputArr = () => {
    const rtn = OUTPUT_TYPE.getOptionList()
      .filter(type => detailData[type.key])
      .map(type => type.showName);
    return rtn;
  };

  const handleBeforeLeave = () => {
    setCronValue('');
    setGetUIValue('');
    form.resetFields();
    shareEtlModal.closeModal();
    cronPopupModal.closeModal();
  };

  const handleShareLeave = () => {
    form.resetFields();
    shareEtlModal.closeModal();
  };

  const handleCloseEditClick = async () => {
    try {
      handleBeforeLeave();
      setSaveCronValue('');
      resetDeserialize();
      setEdit(false);
      await ETLApi.cancelEditStatus(detailData.seqId);
    } catch (e) {
      console.log(e);
    }
  };

  const checkSql = async serialize => {
    let error = [];
    try {
      const result = await getAllSqlQuery.exec(serialize);
      error = model
        .getNodes()
        .filter(
          node =>
            node.getOptions().type === 'OutputSettingNode' &&
            result[node.getID()] !== 'SELECT ' &&
            result[node.getID()] !== node.getModalData().sql,
        );
      error.forEach(node => {
        node.cleanNode();
        node.error(['Sql not equal to preview data']);
      });
    } catch (e) {
      console.log(e);
    }
    return error;
  };

  const handleUpdate = async () => {
    const errorMessages = model.getNodes().filter(node => {
      if (node.validate) {
        return node.validate() !== undefined;
      }
      return false;
    });

    if (errorMessages.length) {
      return;
    }

    const serialize = model.serialize();
    const error = await checkSql(serialize);
    if (error.length) {
      return;
    }

    ReactGA.event({
      category: 'ETL',
      action: 'ETL save',
    });
    trackEvent({
      category: 'ETL',
      action: 'ETL save',
    });
    try {
      setUpdateIsLoading(true);
      const req = {
        diagramMap: {
          ...serialize,
          domain: detailData.piplineRequest.domain,
          folderName: detailData.piplineRequest.folderName,
          permission: detailData.piplineRequest.permission,
          schedule: saveCronValue !== '' ? saveCronValue : detailData.schedule,
        }, // 沒變就保留原本的
        groupId: detailData.groupId,
      };
      const { result } = await ETLApi.updateETL(detailData.seqId, req);
      message.success('All changes have been successfully saved!');
      forceUpdate();
      setCurr(result);
      setEdit(false);
    } catch (e) {
      // 後端驗證entity name重複
      if (isObject(e.message)) {
        const errorObj = JSON.parse(e.message);
        if (errorObj.errorData.result) {
          Object.keys(errorObj.errorData.result).forEach(nodeId => {
            model.getNode(nodeId).error(['Entity Name is duplicated']);
          });
          cronPopupModal.closeModal();
        }
      } else {
        console.log(e.message);
      }
    } finally {
      setUpdateIsLoading(false);
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

  const handleSet = () => {
    if (saveCronValue !== '') setGetUIValue(saveCronValue);
    else setGetUIValue(detailData.schedule);
    cronPopupModal.openModal();
  };

  const renderNormalModeButton = () => (
    <Space>
      {ROLEPERMISSION.checkPermission(
        SYSTEMLIST,
        ROLEPERMISSION.dataPipeline.workspace.edit.value,
      ) ? (
        <Button
          disabled={detailData.referenced || detailData.editing}
          type="text"
          shape="circle"
          icon={<EditOutlined />}
          onClick={() => {
            setEdit(true);
            setEditStatus();
          }}
        />
      ) : null}
      {ROLEPERMISSION.checkPermission(
        SYSTEMLIST,
        ROLEPERMISSION.dataPipeline.workspace.delete.value,
      ) ? (
        <Button
          disabled={detailData.referenced || detailData.editing}
          type="text"
          shape="circle"
          icon={<DeleteOutlined />}
          onClick={() =>
            deleteConfirmModal.openModal({
              showMsg: (
                <p>Are you sure you want to delete {detailData.projectName}?</p>
              ),
            })
          }
        />
      ) : null}
      {ROLEPERMISSION.checkPermission(
        SYSTEMLIST,
        ROLEPERMISSION.dataPipeline.workspace.share.value,
      ) ? (
        <Button
          disabled={detailData.editing}
          type="text"
          shape="circle"
          icon={<ShareAltOutlined />}
          onClick={shareEtlModal.openModal}
        />
      ) : null}
    </Space>
  );

  const renderEditModeButton = () => (
    <Space>
      <Button
        disabled={detailData.referenced}
        type="text"
        shape="circle"
        icon={<SettingOutlined />}
        onClick={() => handleSet()}
      />
      <Button
        disabled={detailData.referenced}
        type="text"
        shape="circle"
        icon={<CloseOutlined />}
        onClick={handleCloseEditClick}
      />
      <Button
        disabled={detailData.referenced}
        type="text"
        shape="circle"
        icon={<CheckOutlined />}
        onClick={handleUpdate}
      />
    </Space>
  );

  const handleDelete = async () => {
    ReactGA.event({
      category: 'ETL',
      action: 'ETL delete',
    });
    trackEvent({
      category: 'ETL',
      action: 'ETL delete',
    });
    try {
      setDeleteIsLoading(true);
      await ETLApi.deleteETL(detailData.seqId);
      message.success('This ETL has been successfully deleted');
      forceUpdate();
      setCurr();
      deleteConfirmModal.closeModal();
    } catch (e) {
      message.error(e.message);
    } finally {
      setDeleteIsLoading(false);
    }
  };

  const handleShareEtlOK = async data => {
    ReactGA.event({
      category: 'ETL',
      action: 'ETL Share',
    });
    trackEvent({
      category: 'ETL',
      action: 'ETL Share',
    });
    setShareIsloading(true);
    try {
      const req = {
        seqId: detailData.seqId,
        emails: data.emailList.map(e => e.email),
      };
      await shareQuery.exec(req);
      message.success('Share Success');
      handleShareLeave();
      setError();
      const regex = new RegExp(req.emails.join('|'), 'i');
      if (regex.test(user.email)) {
        forceUpdateShare();
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setShareIsloading(false);
    }
  };

  const handleRecord = () => {
    ReactGA.event({
      category: 'ETL',
      action: 'ETL Blockchain proof download',
    });
    trackEvent({
      category: 'ETL',
      action: 'ETL Blockchain proof download',
    });
  };
  return (
    <div className="etlDetail">
      <Spin style={{ height: '100%' }} spinning={isLoading}>
        <div className="etlHeader">
          <div className="left">
            <Style.ProjectTitle title={detailData.projectName}>
              {detailData.projectName}
              {detailData.blockchainInfo && (
                <Tooltip
                  placement="bottom"
                  title={detailData.blockchainInfo.status}
                >
                  <div
                    className={`etlstatus ${
                      detailData.blockchainInfo &&
                      detailData.blockchainInfo.status ===
                        BLOCKCHAIN_STATUS.VERIFY_OK
                        ? 'verifyok'
                        : ''
                    }`}
                  />
                </Tooltip>
              )}
              {detailData.blockchainInfo &&
                detailData.blockchainInfo.status ===
                  BLOCKCHAIN_STATUS.VERIFY_OK && (
                  <Progress
                    type="circle"
                    width={15}
                    percent={100}
                    status={
                      detailData.blockchainInfo.verify ? 'success' : 'exception'
                    }
                  />
                )}
            </Style.ProjectTitle>
            <div className="etlInfo-detail-container">
              <div>
                <p
                  title={
                    detailData.piplineRequest &&
                    detailData.piplineRequest.permission
                  }
                >
                  {detailData.piplineRequest &&
                    detailData.piplineRequest.permission}
                </p>
                <p>GroupName: {detailData.groupName && detailData.groupName}</p>
                <p>Frequency: {detailData.frequency && detailData.frequency}</p>
              </div>
              <div className="edit-info">
                <p>
                  Editor: {detailData.editorEnName && detailData.editorEnName}
                </p>
                <p>
                  Edit Time:{' '}
                  {detailData.editAt &&
                    moment(detailData.editAt).format(DATE_TYPE.DATE_TIME)}
                </p>
              </div>
            </div>
            <div>
              {getOutputArr().map(output => (
                <Tag key={output}>{output}</Tag>
              ))}
            </div>
          </div>
          <div className="right">
            {detailData.blockchainInfo &&
              detailData.blockchainInfo.status ===
                BLOCKCHAIN_STATUS.VERIFY_OK && (
                <div className="etlblockchaincircle">
                  <a
                    href={`${AppConfig.itmUrl}/etherscan/${detailData.blockchainInfo.clearanceOrder}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src={ethereum} alt="" />
                  </a>
                </div>
              )}
            {detailData.blockchainInfo &&
              detailData.blockchainInfo.status ===
                BLOCKCHAIN_STATUS.VERIFY_OK && (
                <div className="etlblockchaincircle">
                  <a
                    href={`${AppConfig.itmUrl}/verificationProof/${detailData.blockchainInfo.clearanceOrder}/${detailData.blockchainInfo.indexValue}`}
                  >
                    <DownloadOutlined onClick={() => handleRecord()} />
                  </a>
                </div>
              )}
          </div>
        </div>
        <Spin spinning={updateIsloading}>
          <div className="etlContent">
            {detailData.diagram ? (
              <>
                <div className="toolbutton">
                  {edit ? renderEditModeButton() : renderNormalModeButton()}
                </div>
                <SqlDiagram
                  deserialize={detailData.diagram}
                  disabled={detailData.referenced || !edit}
                  reset={resetDeserializeVal}
                  getModel={setModel}
                  groupId={detailData.groupId}
                />
              </>
            ) : (
              detailData.piplineRequest &&
              detailData.piplineRequest.etlRequests.map((sc, idx) => (
                <>
                  {idx ? <Divider /> : null}
                  <SqlEditor key={sc.entityName} source={sc} readOnly />
                </>
              ))
            )}
          </div>
        </Spin>
      </Spin>
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
      <CustomCronModal
        modal={cronPopupModal}
        setCronValue={setCronValue}
        getUIValue={getUIValue}
        setGetUIValue={setGetUIValue}
        handleOK={handleOK}
        loading={cronLoading}
      />
      <Modal
        title="Execute Immediately Confirm"
        visible={saveConfirmModal.visible}
        onCancel={saveConfirmModal.closeModal}
        footer={
          <Space align="end">
            <Button onClick={saveConfirmModal.closeModal}>No</Button>
            <Button type="primary" onClick={() => handleUpdate()}>
              Yes
            </Button>
          </Space>
        }
        maskClosable={!updateIsloading}
        confirmLoading={updateIsloading}
        closable={!updateIsloading}
        cancelButtonProps={{ disabled: updateIsloading }}
      >
        <p>Do you want to perform the update frequency immediately ?</p>
      </Modal>

      <Modal
        title="Share with other user"
        visible={shareEtlModal.visible}
        bodyStyle={{
          maxHeight: '50vh',
          overflow: 'auto',
        }} // 高度自動,超過螢幕的50％就scroll
        onCancel={handleShareLeave}
        footer={
          <Space align="end">
            <Button
              disabled={shareIsloading}
              onClick={shareEtlModal.closeModal}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={form.submit}
              loading={shareIsloading}
            >
              Ok
            </Button>
          </Space>
        }
        closable={!shareIsloading}
        maskClosable={!shareIsloading}
      >
        {alertError ? (
          <div style={{ marginBottom: 24 }}>
            <Alert message={alertError} type="error" showIcon />
          </div>
        ) : null}
        <Form
          name="share"
          form={form}
          onFinish={handleShareEtlOK}
          scrollToFirstError
        >
          <Form.Item
            name="emailList"
            label="Share with"
            rules={[
              {
                required: true,
                message: 'Please add a column',
              },
            ]}
          >
            <Form.List name="emailList">
              {(fields, { add, remove }) => (
                <>
                  <div>
                    {fields.map(field => (
                      <Space key={field.key} align="center">
                        <Form.Item
                          {...field}
                          name={[field.name, 'email']}
                          fieldKey={[field.fieldKey, 'email']}
                          rules={[
                            {
                              type: 'email',
                              required: true,
                              message: 'Missing email or format error',
                            },
                          ]}
                          style={{ width: '300px' }}
                        >
                          <Input
                            disabled={shareIsloading}
                            placeholder="Email"
                            maxLength={INPUT_RULES.EMAIL.value}
                          />
                        </Form.Item>
                        <Form.Item {...field}>
                          <MinusCircleOutlined
                            onClick={() => {
                              remove(field.name);
                            }}
                          />
                        </Form.Item>
                      </Space>
                    ))}
                    <Button
                      style={{ width: '300px' }}
                      type="dashed"
                      onClick={() => {
                        add();
                      }}
                      block
                    >
                      <PlusOutlined />
                    </Button>
                  </div>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

ETLDetail.propTypes = {
  curr: PropTypes.number,
  setCurr: PropTypes.func,
  forceUpdate: PropTypes.func,
  forceUpdateShare: PropTypes.func,
  user: PropTypes.shape({}),
};

ETLDetail.defaultProps = {
  curr: undefined,
  setCurr: () => null,
  forceUpdate: () => null,
  forceUpdateShare: () => null,
  user: {},
};

export default ETLDetail;
