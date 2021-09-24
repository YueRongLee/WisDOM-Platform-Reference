import { PREVIEW } from './url';
import AxiosApiClient from './AxiosApiClient';

const apiClient = new AxiosApiClient();

export const previewETL = {
  url: PREVIEW.PREVIEW_ETL,
  method: 'post',
  payload: {},
  data: {
    data: [],
    pagination: { total: 0 },
  },
  config: {},
};

export const getPreviewTable = async (tableName, type, groupId) => {
  const payload = {
    type,
    groupId,
  };
  const config = {};
  const { data } = await apiClient
    .get({ url: `${PREVIEW.PREVIEW_TABLE}/${tableName}`, payload, config })
    .send();
  return data;
};

export const getPreviewChecks = async tableNameList => {
  const payload = tableNameList;
  const config = {};
  const { data } = await apiClient
    .post({ url: PREVIEW.PREVIEW_CHECKS, payload, config })
    .send();
  return data;
};
