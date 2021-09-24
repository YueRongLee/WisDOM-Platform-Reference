/* eslint-disable no-restricted-imports */
import axios, { CancelToken } from 'axios';
import { message as Message, Modal } from 'antd';
import AppConfig from '~~config';

const API_CONFIG = {
  baseURL: AppConfig.serverUrl,
  timeout: 600000,
};

class AxiosApiClient {
  constructor(apiConfig) {
    this.axiosInstance = axios.create({ ...API_CONFIG, ...apiConfig });
  }

  setHeader(headerObject = null) {
    // const Authorization = isLogin() ? { Authorization: getToken() } : {};

    const defaultHeaders = {
      Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
      'Content-Security-Policy': 'upgrade-insecure-requests',
    };
    this.axiosInstance.defaults.headers = {
      ...defaultHeaders,
      ...headerObject,
    };
  }

  instance() {
    return this.axiosInstance;
  }

  get({ url, payload, config }) {
    this.setHeader(config.header);
    const source = CancelToken.source();
    return {
      send: () =>
        this.axiosInstance
          .get(url, {
            params: { ...payload },
            ...config,
            cancelToken: source.token,
          })
          .catch(this.onError),
      cancel: source.cancel,
    };
  }

  post({ url, payload, config }) {
    this.setHeader(config.header);
    const source = CancelToken.source();
    return {
      send: () =>
        this.axiosInstance
          .post(url, payload, { ...config, cancelToken: source.token })
          .catch(this.onError),
      cancel: source.cancel,
    };
  }

  delete({ url, payload, config }) {
    this.setHeader(config.header);
    const source = CancelToken.source();
    return {
      send: () =>
        this.axiosInstance
          .delete(url, payload, { ...config, cancelToken: source.token })
          .catch(this.onError),
      cancel: source.cancel,
    };
  }

  put({ url, payload, config }) {
    this.setHeader(config.header);
    const source = CancelToken.source();
    return {
      send: () =>
        this.axiosInstance
          .put(url, payload, { ...config, cancelToken: source.token })
          .catch(this.onError),
      cancel: source.cancel,
    };
  }

  patch(...args) {
    this.setHeader();
    return this.axiosInstance.patch(...args).catch(this.onError);
  }

  handlerError({ onError = () => {}, isShowError = true }) {
    return e => {
      onError(e);
      this.onError(e, isShowError);
    };
  }

  postFile(
    url,
    payload,
    header = { 'Content-Type': 'application/json' },
    config,
  ) {
    this.setHeader(header, 'blob');
    const source = CancelToken.source();
    return {
      send: () =>
        this.axiosInstance
          .post(...[url, payload], { cancelToken: source.token, ...config })
          .catch(this.onError),
      cancel: source.cancel,
    };
  }

  async onError(error, isShowError = true) {
    if (axios.isCancel(error)) {
      // console.warn("canceled");
    } else {
      let statudCode = 500;
      let errorKey = 'SYSTEM_ERROR';
      let errorCode = 0;
      let errorData = {};
      let errorMessage = '';
      if (error.response) {
        statudCode = error.response.status;
        errorKey =
          error.response.data && error.response.data.errorMsg
            ? error.response.data.errorMsg
            : errorKey;
        errorData = error.response.data;
        // eslint-disable-next-line prefer-destructuring
        errorCode = error.response.data.errorCode;
        errorMessage = error.response.data.message;
      } else if (error.request) {
        statudCode = error.request.status;
      }

      const errorObj = {
        status: statudCode,
        errorKey,
        errorData,
        errorCode,
        errorMessage,
      };

      let message = '';
      if (statudCode === 400) {
        if (error.response && error.response.data.errorMsg) {
          message = error.response.data.errorMsg;
        } else {
          message = 'System Error';
        }

        if (isShowError) {
          Message.error(message);
        }
      }

      if (statudCode === 401) {
        message = 'Token Expired';
        // if (isShowError) {
        //   Message.error(message);
        // }
        window.location.href = `${window.location.origin}/login?next=${window.location.href}`;
      }

      if (statudCode === 403) {
        message = 'Forbidden';
        if (error.response) {
          message = error.response.data.message || message;
        }

        if (isShowError) {
          const show = message.errorMessage || message;
          Message.error(show);
        }
      }

      if (statudCode === 422) {
        if (error.response) {
          if (error.response.data instanceof Blob) {
            message = JSON.parse(await error.response.data.text()).errorMsg;
          } else {
            message = error.response.data.errorMsg;
          }
        }

        if (isShowError) {
          Message.error(message);
        }
      }

      if (statudCode === 423) {
        if (error.response) {
          if (error.response.data instanceof Blob) {
            message = JSON.parse(await error.response.data.text());
          } else {
            message = error.response.data;
          }
        }

        if (isShowError) {
          const show = message.message;
          Modal.error({
            title: 'Error Message',
            content: show,
            onOk() {
              window.location.href = `${window.location.origin}/pipeline/create/`;
            },
          });
        }
      }

      if (!message) {
        if (error.response) {
          // eslint-disable-next-line prefer-destructuring
          message = error.response.data.message;
        }

        if (isShowError) {
          Message.error(message || 'System Error');
        }
      }

      throw new Error(JSON.stringify(errorObj));
    }
  }
}

export default AxiosApiClient;
