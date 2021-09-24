import AxiosApiClient from './AxiosApiClient';
import { DATAFLOW } from './url';

const apiClient = new AxiosApiClient();

export const saveDataFlow = {
  url: DATAFLOW.ETL_SAVE,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getDataFlowList = {
  url: DATAFLOW.GET_DATAFLOW_LIST,
  method: 'get',
  payload: {
    page: 1,
    pageSize: 9999,
  },
  data: {},
  config: {},
};

export const getDataFlowDetail = async seqId => {
  const { data } = await apiClient
    .get({
      url: `${DATAFLOW.GET_DATAFLOW_DETAIL}/${seqId}`,
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
    .post({ url: `${DATAFLOW.SET_DATAFLOW_STATUS}`, payload, config })
    .send();
  return data;
};

export const cancelEditStatus = async seqId => {
  const payload = { seqId };
  const config = {};
  const { data } = await apiClient
    .post({ url: `${DATAFLOW.CANCEL_DATAFLOW_EDIT_STATUS}`, payload, config })
    .send();
  return data;
};

export const checkDataFlowLock = async seqId => {
  const { data } = await apiClient
    .get({
      url: `${DATAFLOW.CHECK_DATAFLOW_LOCKED}/${seqId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const deleteDataFlow = async seqId => {
  const payload = { seqId };
  const config = {};
  const { data } = await apiClient
    .post({ url: `${DATAFLOW.DELETE_DATAFLOW}`, payload, config })
    .send();
  return data;
};

export const runDataFlow = async seqId => {
  const payload = { seqId };
  const config = {};
  const { data } = await apiClient
    .post({ url: `${DATAFLOW.RUN_DATAFLOW}`, payload, config })
    .send();
  return data;
};

export const validateDataFlow = async dataflow => {
  const payload = dataflow;
  const config = {};
  const { data } = await apiClient
    .post({ url: `${DATAFLOW.VALIDATE_DATAFLOW}`, payload, config })
    .send();
  return data;
};

export const preview = {
  url: DATAFLOW.ETL_PREVIEW,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getTargetNode = async seqId => {
  const { data } = await apiClient
    .get({
      url: `${DATAFLOW.GET_TARGETNODE}/${seqId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getTargetSchema = async seqId => {
  const { data } = await apiClient
    .get({
      url: `${DATAFLOW.GET_TARGET_SCHEMAS}/${seqId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getOutputSchema = {
  url: DATAFLOW.GET_OUTPUT_SCHEMA,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getDataFlowHistory = async (seqId, page) => {
  const { data } = await apiClient
    .get({
      url: `${DATAFLOW.DATAFLOW_HISTORY}/${seqId}?page=${page}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getDataFlowRunDetail = async runId => {
  const { data } = await apiClient
    .get({
      url: `${DATAFLOW.DATAFLOW_DETAIL}/${runId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getImmediateResult = async payload => {
  // const payload = { payload };
  const config = {};
  const { data } = await apiClient
    .post({ url: `${DATAFLOW.DATAFLOW_IMMEDIATERESULT}`, payload, config })
    .send();
  return data;
};

export const getDataFlowRunStatus = async seqId => {
  const payload = { seqId };
  const config = {};
  const { data } = await apiClient
    .post({ url: `${DATAFLOW.DATAFLOW_ISRUNNING}`, payload, config })
    .send();
  return data;
};

export const getWorkflowReferences = async seqId => {
  const { data } = await apiClient
    .get({
      url: `${DATAFLOW.GET_WORKFLOW_REFERENCE}/${seqId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getDataFlowDetailWithDiagram = async runId => {
  const { data } = await apiClient
    .get({
      url: `${DATAFLOW.GET_DATAFLOW_DETAIL_WITH_DIAGRAM}/${runId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getTableDuplicate = async tableName => {
  const { data } = await apiClient
    .get({
      url: `${DATAFLOW.GET_TABLE_EXIT}/${tableName}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getCheckPublish = async (seqId, payload) => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${DATAFLOW.GET_CHECK_PUBLISH}/${seqId}/checkPublish`,
      payload,
      config,
    })
    .send();
  return data;
};

export const checkPermission = async seqId => {
  const { data } = await apiClient
    .get({
      url: `${DATAFLOW.DATAFLOW_CHECK_PERMISSION}/${seqId}/checkPermission`,
      payload: {},
      config: {},
    })
    .send();

  return data;
};

export const getTableSampleData = async payload => {
  const { tableName, groupId } = payload;
  const { data } = await apiClient
    .get({
      url: `${DATAFLOW.GET_TABLE_SAMPLE_DATA}/${tableName}/sample`,
      payload: { groupId },
      config: {},
    })
    .send();

  return data;
};

export const getUsedTargetId = async dataflowId => {
  const { data } = await apiClient
    .get({
      url: `/dataflow/${dataflowId}/targetIdUsedByWorkflow`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};
