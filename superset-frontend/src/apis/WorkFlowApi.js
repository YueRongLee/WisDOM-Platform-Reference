import AxiosApiClient from './AxiosApiClient';
import { WORKFLOW } from './url';

const apiClient = new AxiosApiClient();

export const saveWorkFlow = {
  url: WORKFLOW.SAVE_WORK_FLOW,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getWorkFlowList = {
  url: WORKFLOW.GET_WORKFLOW_LIST,
  method: 'get',
  payload: {
    page: 1,
    pageSize: 9999,
  },
  data: {},
  config: {},
};

export const getWorkFlowDetail = async seqId => {
  const { data } = await apiClient
    .get({
      url: `${WORKFLOW.GET_WORKFLOW_DETAIL}/${seqId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const checkWorkFlowLock = async seqId => {
  const { data } = await apiClient
    .get({
      url: `${WORKFLOW.CHECK_WORKFLOW_LOCKED}/${seqId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const setEditStatus = async seqId => {
  const payload = { seqId };
  const config = {};
  const { data } = await apiClient
    .post({ url: `${WORKFLOW.WORKFLOW_EDIT_STATUS}`, payload, config })
    .send();
  return data;
};

export const cancelEditStatus = async seqId => {
  const payload = { seqId };
  const config = {};
  const { data } = await apiClient
    .post({ url: `${WORKFLOW.CANCEL_WORKFLOW_EDIT_STATUS}`, payload, config })
    .send();
  return data;
};

export const deleteDataFlow = async seqId => {
  const payload = { seqId };
  const config = {};
  const { data } = await apiClient
    .post({ url: `${WORKFLOW.DELETE_WORKFLOW}`, payload, config })
    .send();
  return data;
};

export const WorkFlowActive = async seqId => {
  const payload = { seqId };
  const config = {};
  const { data } = await apiClient
    .post({ url: `${WORKFLOW.ACTIVE_WORKFLOW}`, payload, config })
    .send();
  return data;
};

export const WorkFlowDeActive = async seqId => {
  const payload = { seqId };
  const config = {};
  const { data } = await apiClient
    .post({ url: `${WORKFLOW.DEACTIVE_WORKFLOW}`, payload, config })
    .send();
  return data;
};

export const getDataflowByGroup = async groupId => {
  const { data } = await apiClient
    .get({
      url: `${WORKFLOW.GET_DATAFLOW_BY_GROUP}/${groupId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getTargetMapping = async seqId => {
  const { data } = await apiClient
    .get({
      url: `${WORKFLOW.GET_TARGET_MAPPING}/${seqId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const runWorkFlow = async seqId => {
  const payload = { seqId };
  const config = {};
  const { data } = await apiClient
    .post({ url: `${WORKFLOW.RUN_WORKFLOW}`, payload, config })
    .send();
  return data;
};

export const testConnection = {
  url: WORKFLOW.TEST_CONNECT,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getTargetSchema = async seqId => {
  const { data } = await apiClient
    .get({
      url: `${WORKFLOW.GET_TARGET_SCHEMAS}/${seqId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const tableNameDuplicated = {
  url: WORKFLOW.TABLE_NAME_DUPLICATED,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getWorkFlowHistory = async (seqId, page) => {
  const { data } = await apiClient
    .get({
      url: `${WORKFLOW.WORKFLOW_HISTORY}/${seqId}?page=${page}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getWorkFlowRunDetail = async workflowHistorySeqId => {
  const { data } = await apiClient
    .get({
      url: `${WORKFLOW.WORKFLOW_DETAIL}/${workflowHistorySeqId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getApiNodeUrl = async workflowSeqId => {
  const { data } = await apiClient
    .get({
      url: `${WORKFLOW.WORKFLOWNODE_URL}/${workflowSeqId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getWorkFlowRunStatus = async seqId => {
  const payload = { seqId };
  const config = {};
  const { data } = await apiClient
    .post({ url: `${WORKFLOW.WORKFLOW_ISRUNNING}`, payload, config })
    .send();
  return data;
};

export const postPowerBiPreview = {
  url: WORKFLOW.WORKFLOW_POWERBI_PREVIEW,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getPowerBiTableList = async templateId => {
  const { data } = await apiClient
    .get({
      url: `${WORKFLOW.WORKFLOW_POWERBI_TEMPLATE}/${templateId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getPowerBiTemplate = {
  url: WORKFLOW.WORKFLOW_POWERBI_TEMPLATE,
  method: 'get',
  payload: {},
  data: {},
  config: {},
};

export const getEmailSearchList = async searchKey => {
  const { data } = await apiClient
    .get({
      url: `${WORKFLOW.WORKFLOW_RECEIVER}${searchKey}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const checkPermission = async seqId => {
  const { data } = await apiClient
    .get({
      url: `${WORKFLOW.WORKFLOW_CHECK_PERMISSION}/${seqId}/checkPermission`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};
