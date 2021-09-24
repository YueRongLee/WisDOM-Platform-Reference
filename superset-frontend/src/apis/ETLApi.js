import { ETL } from './url';
import AxiosApiClient from './AxiosApiClient';

const apiClient = new AxiosApiClient();

export const getETLList = {
  url: ETL.GET_ETL_LIST,
  method: 'get',
  payload: {
    page: 1,
    pageSize: 9999,
  },
  data: {
    etlJobs: [],
    pageInfo: {},
  },
  config: {},
};

export const getETLDetail = async seqId => {
  const { data } = await apiClient
    .get({
      url: `${ETL.GET_DETAIL}/${seqId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getSql = async diagramMap => {
  const payload = diagramMap;
  const config = {};
  const { data } = await apiClient
    .post({ url: ETL.GET_SQL, payload, config })
    .send();
  return data;
};

export const saveETL = {
  url: ETL.SAVE_ETL,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const deleteETL = async seqId => {
  const payload = {};
  const config = {};
  const { data } = await apiClient
    .post({ url: `${ETL.DELETE_ETL}/${seqId}`, payload, config })
    .send();
  return data;
};

export const updateETL = async (seqId, payload) => {
  const config = {};
  const { data } = await apiClient
    .post({ url: `${ETL.UPDATE_ETL}/${seqId}`, payload, config })
    .send();
  return data;
};

export const getAllSql = {
  url: ETL.GET_SQL,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getShareETLList = {
  url: ETL.GET_SHARE_LIST,
  method: 'get',
  payload: {
    page: 1,
    pageSize: 9999,
  },
  data: {
    etlShareJobs: [],
    pageInfo: {},
  },
  config: {},
};

export const shareETL = {
  url: ETL.SHARE_ETL,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getShareETLDetail = {
  url: ETL.GET_SHARE_DETAIL,
  method: 'get',
  payload: {},
  data: {},
  config: {},
};

export const setETLEditStatus = async seqId => {
  const payload = { seqId };
  const config = {};
  const { data } = await apiClient
    .post({ url: `${ETL.SET_ETL_EDIT}`, payload, config })
    .send();
  return data;
};

export const cancelEditStatus = async seqId => {
  const payload = { seqId };
  const config = {};
  const { data } = await apiClient
    .post({ url: `${ETL.CANCEL_ETL_EDIT_STATUS}`, payload, config })
    .send();
  return data;
};
