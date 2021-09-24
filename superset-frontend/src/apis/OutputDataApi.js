import AxiosApiClient from './AxiosApiClient';
import { OUTPUT_DATA } from './url';

const apiClient = new AxiosApiClient();

export const getWorkflowList = async id => {
  const payload = {};
  const { data } = await apiClient
    .get({
      url: `${OUTPUT_DATA.GET_WORKFLOW_LIST}/${id}`,
      payload,
      config: {},
    })
    .send();
  return data;
};

export const getFileList = async payload => {
  const { data } = await apiClient
    .get({
      url: `${OUTPUT_DATA.GET_WORKFLOW_LIST}/${payload.groupId}/${payload.workflowSeqId}`,
      payload,
      config: {},
    })
    .send();
  return data;
};

export const downloadExcelFile = async payload => {
  const { data } = await apiClient
    .get({
      url: `${OUTPUT_DATA.GET_WORKFLOW_LIST}/${payload.groupId}/${payload.workflowSeqId}/${payload.fileName}/download`,
      payload,
      config: {},
    })
    .send();
  return data;
};

export const deleteExcelFile = async payload => {
  const { data } = await apiClient
    .get({
      url: `${OUTPUT_DATA.GET_WORKFLOW_LIST}/${payload.groupId}/${payload.workflowSeqId}/${payload.fileName}/delete`,
      payload,
      config: {},
    })
    .send();
  return data;
};

// export const updatePowerBiTemplate = async (payload, templateId) => {
//   const config = {};
//   const { data } = await apiClient
//     .post({
//       url: `${POWER_BI_TEMPLATE.POWER_BI_TEMPLATE_UPDATE}/${templateId}`,
//       payload,
//       config,
//     })
//     .send();
//   return data;
// };
