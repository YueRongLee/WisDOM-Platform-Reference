import AxiosApiClient from './AxiosApiClient';
import { POWER_BI_TEMPLATE } from './url';

const apiClient = new AxiosApiClient();

export const getPowerBiTemplate = async payload => {
  const { data } = await apiClient
    .get({
      url: `${POWER_BI_TEMPLATE.POWER_BI_TEMPLATE_LIST}`,
      payload,
      config: {},
    })
    .send();
  return data;
};

export const updatePowerBiTemplate = async (payload, templateId) => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${POWER_BI_TEMPLATE.POWER_BI_TEMPLATE_UPDATE}/${templateId}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const deletePowerBiTemplate = async payload => {
  const { data } = await apiClient
    .delete({
      url: `${POWER_BI_TEMPLATE.POWER_BI_TEMPLATE_DELETE}/${payload.templateId}`,
      payload,
      config: {},
    })
    .send();
  return data;
};

export const createPowerBiTemplate = async payload => {
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${POWER_BI_TEMPLATE.POWER_BI_TEMPLATE_CREATE}`,
      payload,
      config,
    })
    .send();
  return data;
};

export const getPowerBiTemplateInfo = async templateId => {
  const { data } = await apiClient
    .get({
      url: `${POWER_BI_TEMPLATE.POWER_BI_TEMPLATE_INFO}/${templateId}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const getPowerBIColumnInfo = async (file, cusConfig) => {
  const payload = new FormData();
  payload.append('pbixFile', file);
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...cusConfig,
  };
  const { data } = await apiClient
    .post({
      url: POWER_BI_TEMPLATE.POWER_BI_TEMPLATE_GET_COLUMN_INFO,
      payload,
      config,
    })
    .send();
  return data;
};

export const getPowerBISchemaInfo = async (file, columnInfo, cusConfig) => {
  const payload = new FormData();
  payload.append('schemaFile', file);
  payload.append('columnInfo', JSON.stringify(columnInfo));
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...cusConfig,
  };
  const { data } = await apiClient
    .post({
      url: POWER_BI_TEMPLATE.POWER_BI_TEMPLATE_GET_SCHEMA_INFO,
      payload,
      config,
    })
    .send();
  return data;
};
