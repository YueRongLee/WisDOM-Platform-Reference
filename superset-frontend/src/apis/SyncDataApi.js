import AxiosApiClient from './AxiosApiClient';
import { SYNCDATA } from './url';

const apiClient = new AxiosApiClient();

export const getCategoryList = async () => {
  const { data } = await apiClient
    .get({
      url: `${SYNCDATA.CATEGORY_LIST}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const applySyncData = async payload => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${SYNCDATA.APPLY_SYNC_DATA}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const getAsyncDataList = async payload => {
  const { data } = await apiClient
    .get({
      url: `${SYNCDATA.SYNC_DATA_LIST}`,
      payload,
      config: {},
    })
    .send();
  return data;
};

export const completeSyncData = async payload => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${SYNCDATA.COMPLETE_SYNC_DATA}`,
      payload,
      config,
    })
    .send();
  return data;
};
