import AxiosApiClient from './AxiosApiClient';
import { ROLE_MANAGEMENT } from './url';

const apiClient = new AxiosApiClient();

export const createRole = async payload => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${ROLE_MANAGEMENT.ROLE_MANAGEMENT}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const updateRole = async payload => {
  const config = {};
  const { data } = await apiClient
    .put({
      url: `${ROLE_MANAGEMENT.ROLE_MANAGEMENT}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const getRolePermissonList = async roleType => {
  const { data } = await apiClient
    .get({
      url: `${ROLE_MANAGEMENT.ROLE_MANAGEMENT}/${roleType}/permissions`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getRoleDetail = async payload => {
  const { data } = await apiClient
    .post({
      url: `${ROLE_MANAGEMENT.GET_ROLE_DETAIL}`,
      payload,
      config: {},
    })
    .send();
  return data;
};

export const getRoleList = async roleType => {
  const { data } = await apiClient
    .get({
      url: `${ROLE_MANAGEMENT.GET_ROLE_LIST}/${roleType}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const deleteRole = async roleId => {
  const { data } = await apiClient
    .delete({
      url: `${ROLE_MANAGEMENT.ROLE_MANAGEMENT}/${roleId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};
