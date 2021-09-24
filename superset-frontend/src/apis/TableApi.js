import { TABLE_AUTH, TABLE_INFO, TABLE_ON_CHAIN_STATUS } from './url';
import AxiosApiClient from './AxiosApiClient';

const apiClient = new AxiosApiClient();

export const tableApply = {
  url: TABLE_AUTH.TABLE_APPLY,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getApproveList = {
  url: TABLE_AUTH.GET_APPROVE_LIST,
  method: 'post',
  payload: {},
  data: [],
  config: {},
};

export const grantPermission = {
  url: TABLE_AUTH.GRANT_PERMISSION,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const columnFilterTrialRun = {
  url: TABLE_AUTH.COLUMNFILTER_TRIAL_RUN,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const columnFilterPreview = {
  url: TABLE_AUTH.COLUMNFILTER_PREVIEW,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getAllowed = async () => {
  const { data } = await apiClient
    .get({
      url: TABLE_AUTH.GET_USER_ALLOWED,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getHealthTable = async tableid => {
  const payload = {};
  const config = {};
  const { data } = await apiClient
    .get({ url: `${TABLE_INFO.GET_HEALTH}/${tableid}`, payload, config })
    .send();
  return data;
};

export const editDescription = {
  url: TABLE_INFO.EDIT_DESCRIPTION,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getTableOnChainStatusList = {
  url: TABLE_ON_CHAIN_STATUS.GET_TABLE_INFO,
  method: 'get',
  payload: {},
  data: {
    infolist: [],
    pageInfo: {},
  },
  config: {},
};

export const getTableLineage = async tableid => {
  const payload = {};
  const config = {};
  const { data } = await apiClient
    .get({ url: `${TABLE_INFO.GET_TABLE_LINEAGE}/${tableid}`, payload, config })
    .send();
  return data;
};

export const tableDelete = {
  url: TABLE_AUTH.TABLE_DELETE,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getTableColumns = async groupId => {
  const payload = {};
  const config = {};
  const { data } = await apiClient
    .get({
      url: `${TABLE_INFO.GET_TABLE_COLUMNS}/${groupId}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const getAllowedTable = async (groupId, type) => {
  const payload = { groupId, type };
  const config = {};
  const { data } = await apiClient
    .get({
      url: `${TABLE_AUTH.ALLOWED_TABLE}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const getAllowedTableColumns = async tableName => {
  const payload = {};
  const config = {};
  const { data } = await apiClient
    .get({
      url: `${TABLE_INFO.GET_TABLE_COLUMNS_BY_NAME}/${tableName}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const getTablePermissionForGroup = async () => {
  const payload = {};
  const config = {};
  const { data } = await apiClient
    .get({
      url: `${TABLE_INFO.GET_TABLE_PERMISSION_FOR_GROUP}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const deleteTablePermissionForGroup = async uuid => {
  const payload = { uuid };
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${TABLE_INFO.DELETE_TABLE_PERMISSION_FOR_GROUP}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const getTableInfo = async payload => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${TABLE_INFO.GET_TABLE}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const changeOwner = async tempData => {
  const payload = {
    tableWithOwnerChangeList: tempData.tableWithOwnerChangeList,
  };
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${TABLE_INFO.CHANGE_OWNER}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const changeCategory = {
  url: TABLE_INFO.CHANGE_CATEGORY,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const extendApply = async payload => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${TABLE_AUTH.EXTEND_APPLY}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const getUsetAllows = async payload => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${TABLE_INFO.GET_USERALLOWS}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const getApplicationList = async payload => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${TABLE_INFO.GET_APPRPVED_LIST}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const disableAllowed = async payload => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${TABLE_AUTH.DISABLE_ALLOWED}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const getApplicationHealthTable = async (type, tableNAme) => {
  const payload = {};
  const config = {};
  const { data } = await apiClient
    .get({
      url: `${TABLE_AUTH.GET_APPLICATION_HEALTH}/${type}/${tableNAme}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const getCategoryList = async payload => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${TABLE_AUTH.GET_CATEGORY_APPLICATION_LIST}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const approveCategory = async payload => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${TABLE_AUTH.APPROVE_CATEGORY_APPLICATION}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const getApprovingCounts = async () => {
  const payload = {};
  const config = {};
  const { data } = await apiClient
    .get({
      url: `${TABLE_INFO.GET_APPROVING_COUNTS}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const getDatasetLastData = async tempPayload => {
  const payload = tempPayload;
  const config = {};
  const { data } = await apiClient
    .post({ url: `${TABLE_AUTH.LAST_DATE}`, payload, config })
    .send();
  return data;
};

export const getSignOffInfo = async uuid => {
  const payload = {};
  const config = {};
  const { data } = await apiClient
    .get({
      url: `${TABLE_AUTH.GET_SIGN_OFF_INFO}/${uuid}`,
      payload,
      config,
    })
    .send();

  return data;
};

export const getUserApplyRecord = async () => {
  const payload = {};
  const config = {};
  const { data } = await apiClient
    .get({
      url: `${TABLE_AUTH.GET_USER_APPLY_RECORD}`,
      payload,
      config,
    })
    .send();

  return data;
};

export const getUserApplyRecordDetail = async uuid => {
  const payload = {};
  const config = {};
  const { data } = await apiClient
    .get({
      url: `${TABLE_AUTH.GET_USER_APPLY_RECORD}/${uuid}`,
      payload,
      config,
    })
    .send();

  return data;
};
