import AxiosApiClient from './AxiosApiClient';
import { CATEGORY } from './url';

const apiClient = new AxiosApiClient();

export const getCategoryList = async payload => {
  const { data } = await apiClient
    .get({
      url: `${CATEGORY.CATEGORY_LIST}`,
      payload,
      config: {},
    })
    .send();
  return data;
};

export const getTableList = async payload => {
  const { data } = await apiClient
    .get({
      url: `${CATEGORY.CATEGORY_TABLES}`,
      payload,
      config: {},
    })
    .send();
  return data;
};

export const applySyncData = async payload => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${CATEGORY.APPLY_SYNC_DATA}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const changeOwner = async payload => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${CATEGORY.CATEGORY_CHANGE_OWNER}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const addCategory = async payload => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${CATEGORY.CATEGORY_ADD}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const enableCategory = async payload => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${CATEGORY.CATEGORY_ENABLE}`,
      payload,
      config,
    })
    .send();
  return data;
};
