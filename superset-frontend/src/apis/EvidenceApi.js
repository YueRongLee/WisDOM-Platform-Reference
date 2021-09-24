import { EVIDENCE } from './url';
import AxiosApiClient from './AxiosApiClient';

const apiClient = new AxiosApiClient();

export const verify = async (file, proofUrl, cusConfig) => {
  const payload = new FormData();
  payload.append('file', file);
  payload.append('proofUrl', proofUrl);
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...cusConfig,
  };
  const { data } = await apiClient
    .post({ url: EVIDENCE.VERIFY, payload, config })
    .send();
  return data;
};
