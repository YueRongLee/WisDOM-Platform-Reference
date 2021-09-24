import AxiosApiClient from './AxiosApiClient';
import { ANNOUNCEMENT } from './url';

const apiClient = new AxiosApiClient();

export const getContent = async title => {
  const { data } = await apiClient
    .get({
      url: `${ANNOUNCEMENT.GET_ANNOUNCEMENT}/${title}`,
      payload: {},
      config: {},
    })
    .send();
  return data;
};

export const saveContent = async (title, content) => {
  const payload = { content };
  const config = {};
  const { data } = await apiClient
    .post({
      url: `${ANNOUNCEMENT.SAVE_ANNOUNCEMENT}/${title}`,
      payload,
      config,
    })
    .send();
  return data;
};
