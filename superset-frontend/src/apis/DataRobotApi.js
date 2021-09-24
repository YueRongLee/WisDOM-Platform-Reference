import AxiosApiClient from './AxiosApiClient';
import { DATAROBOT } from './url';

const apiClient = new AxiosApiClient();

export const getModelList = async tempPayload => {
  const payload = tempPayload;
  const config = {};
  const { data } = await apiClient
    .post({ url: `${DATAROBOT.LIST_MODEL}`, payload, config })
    .send();
  return data;
};

export const getMetriclList = async projectId => {
  const payload = {};
  const config = {};
  const { data } = await apiClient
    .get({ url: `${DATAROBOT.LIST_METRIC}/${projectId}`, payload, config })
    .send();
  return data;
};

export const getAccountList = {
  url: DATAROBOT.LIST_ACCOUNT,
  method: 'get',
  payload: {},
  data: {},
  config: {},
};
