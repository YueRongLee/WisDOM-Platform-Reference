import AxiosApiClient from './AxiosApiClient';
import { USER_MANAGEMENT } from './url';

const apiClient = new AxiosApiClient();

export const updateUser = async payload => {
  const config = {};
  const { data } = await apiClient
    .put({
      url: `${USER_MANAGEMENT.USER_MANAGEMENT}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const getUserDetail = async userId => {
  const { data } = await apiClient
    .get({
      url: `${USER_MANAGEMENT.USER_MANAGEMENT}/${userId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getUserList = async payload => {
  const { data } = await apiClient
    .post({
      url: `${USER_MANAGEMENT.GET_USER_LIST}`,
      payload,
      config: {},
    })
    .send();
  return data;
};

export const getUserPermission = async userId => {
  const { data } = await apiClient
    .get({
      url: `${USER_MANAGEMENT.GET_USER_PERMISSION}/${userId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};
