import { USER, USER_DEFINE, USER_GROUP, USER_TAG } from './url';
import AxiosApiClient from './AxiosApiClient';

const apiClient = new AxiosApiClient();

export const searchMember = {
  url: USER.USER_SEARCH,
  method: 'get',
  payload: {},
  data: [],
  config: {},
};

export const userUpload = {
  url: USER_DEFINE.USER_UPLOAD,
  method: 'postFile',
  payload: {},
  data: {},
  config: {},
};

export const getUploadHistory = {
  url: USER_DEFINE.GET_UPLOAD_HISTORY,
  method: 'get',
  payload: {},
  data: {
    histories: [],
    pageInfo: {},
  },
  config: {},
};

export const tableAddFile = {
  url: USER_DEFINE.TABLE_ADD_FILE,
  method: 'postFile',
  payload: {},
  data: {},
  config: {},
};

export const ColumnByFileVerify = async (file, cusConfig) => {
  const payload = new FormData();
  payload.append('file', file);
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...cusConfig,
  };
  const { data } = await apiClient
    .post({ url: USER_DEFINE.COLUMN_BY_FILE_ETL, payload, config })
    .send();
  return data;
};

export const ColumnBySchemaFileVerify = async (file, cusConfig) => {
  const payload = new FormData();
  payload.append('file', file);
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...cusConfig,
  };
  const { data } = await apiClient
    .post({ url: USER_DEFINE.COLUMN_BY_SCHEMA_FILE_ETL, payload, config })
    .send();
  return data;
};

export const getAllGroups = {
  url: USER_GROUP.GET_ALL_GROUPS,
  method: 'get',
  payload: {},
  data: {},
  config: {},
};

export const getGroups = {
  url: USER_GROUP.GET_GROUPS,
  method: 'get',
  payload: {},
  data: {
    groupListData: [],
    pageInfo: {},
  },
  config: {},
};

export const createGroup = {
  url: USER_GROUP.GET_GROUPS,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const deleteGroup = async groupId => {
  const payload = {};
  const config = {};
  const { data } = await apiClient
    .delete({ url: `${USER_GROUP.GET_GROUPS}/${groupId}`, payload, config })
    .send();
  return data;
};

export const getGroupTable = {
  url: USER_GROUP.GET_GROUP_TABLE,
  method: 'get',
  payload: {},
  data: {},
  config: {},
};

export const getGroupMember = {
  url: USER_GROUP.GET_GROUP_MEMBER,
  method: 'get',
  payload: {
    page: 1,
    pageSize: 9999,
  },
  data: {},
  config: {},
};

export const updateMember = {
  url: USER_GROUP.UPDATE_MEMBER,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getNormalUserGroups = {
  url: USER_GROUP.GET_NORMAL_GROUPS,
  method: 'get',
  payload: {
    page: 1,
    pageSize: 9999,
  },
  data: {},
  config: {},
};

export const setGroupAllow = {
  url: USER_GROUP.SET_GROUP_ALLOW,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const setGroupReject = {
  url: USER_GROUP.SET_GROUP_REJECT,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getTags = {
  url: USER_TAG.GET_CATEGORY,
  method: 'get',
  payload: {},
  data: {
    groupListData: [],
    pageInfo: {},
  },
  config: {},
};

export const getEnableTags = {
  url: USER_TAG.GET_CATEGORY_ENABLE,
  method: 'get',
  payload: {},
  data: {},
  config: {},
};

export const deleteGroupTable = async body => {
  const payload = body;
  const config = {};
  const { data } = await apiClient
    .post({ url: `${USER_GROUP.DELETE_GROUP_TABLE}`, payload, config })
    .send();
  return data;
};

export const getUserList = async () => {
  const payload = {};
  const config = {};
  const { data } = await apiClient
    .get({
      url: `${USER.USER_LIST}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const SearchUsersFromAAD = async searchKey => {
  const payload = {};
  const config = {};
  const { data } = await apiClient
    .get({
      url: `${USER.USER_SEARCH_AAD}${searchKey}`,
      payload,
      config,
    })
    .send();
  return data;
};
