import { useState, useRef } from 'react';
import AxiosApiClient from '../apis/AxiosApiClient';

const apiClient = new AxiosApiClient();

const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
  // total: 1,
};

const SORTER_ABBR = {
  descend: 'desc',
  ascend: 'asc',
};

const DEFAULT_SORTER = {
  field: '',
  order: SORTER_ABBR.descend,
};

const useQuery = option => {
  const [query, updateQuery] = useState(
    option.payload.query || option.payload || {},
  );
  const [pagination, updatePagination] = useState({
    ...DEFAULT_PAGINATION,
    ...(option.pagination || {}),
  });
  const [sorter, updateSorter] = useState({
    ...DEFAULT_SORTER,
    ...(option.sorter || {}),
  });
  const [header] = useState(option.header || {});

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(option.data);
  const [total, setTotal] = useState(0);
  const [updater, setUpdater] = useState(Math.random());
  const cancelFn = useRef({ cancel: () => {} });

  const payload = {
    query,
    pagination,
    sorter,
  };

  const setQuery = newState => {
    updateQuery({
      ...query,
      ...newState,
    });
  };

  const setPagination = newState => {
    const filteredState = Object.keys(newState).reduce((obj, stateKey) => {
      if (Object.prototype.hasOwnProperty.call(DEFAULT_PAGINATION, stateKey)) {
        return {
          ...obj,
          [stateKey]: newState[stateKey],
        };
      }
      return obj;
    }, {});
    updatePagination({
      ...pagination,
      ...filteredState,
    });

    let tmpCondition = sessionStorage.getItem('listCondition');
    if (tmpCondition !== undefined && tmpCondition !== null) {
      tmpCondition = JSON.parse(tmpCondition);
      tmpCondition = {
        ...tmpCondition,
        pagination: {
          ...filteredState,
        },
      };
      sessionStorage.setItem('listCondition', JSON.stringify(tmpCondition));
    }

    setUpdater(Math.random());
  };
  const setSorter = newState => {
    updateSorter(newState);
    setUpdater(Math.random());
  };

  const onError = async e => {
    await setError(e);
  };

  const replace = (url, thisPayload) =>
    Object.keys(thisPayload).reduce(
      (pre, curr) => pre.replace(`{${curr}}`, thisPayload[curr]),
      url,
    );

  const getPayloadWithoutPathQuery = (url, oldPayload) => {
    const newPayload = { ...oldPayload };
    Object.keys(oldPayload).forEach(key => {
      if (url.indexOf(`{${key}}`) !== -1) {
        delete newPayload[key];
      }
    });
    return newPayload;
  };

  async function fetchFn(newPayload = {}) {
    const allPayload = { ...query, ...newPayload };
    const request = apiClient[option.method]({
      url: replace(option.url, allPayload),
      payload: getPayloadWithoutPathQuery(option.url, allPayload),
      header,
      config: option.config,
    });
    cancelFn.current = request;
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await request.send();
      return response.data;
    } catch (e) {
      // return 'fetch_error';
      throw e;
    }
  }

  /**
   * 執行API並預設刷新loading狀態
   * @param {object} newPayload API參數
   * @param {boolean} updateLoading 是否刷新
   */
  async function exec(newPayload = {}, updateLoading = true) {
    let newData = option.data;
    try {
      if (updateLoading) {
        setIsLoading(true);
      }
      const response = await fetchFn(newPayload);
      // pushUserEvent(functionId);
      setData(response);
      newData = response;
      // if (response) {
      //   setData(response.data || option.data);
      //   newData = response.data || option.data;
      // }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      if (updateLoading) {
        setIsLoading(false);
      }
    }
    return newData;
  }

  /**
   * 執行API，不刷新loading狀態
   * @param {object} newPayload API參數
   */
  async function execNL(newPayload = {}) {
    return exec(newPayload, false);
  }

  async function execForForm(newPayload = {}, config = {}) {
    let newData = option.data;
    try {
      setIsLoading(true);

      const newQuery = {
        ...query,
        ...newPayload,
      };

      let ret = '';

      // eslint-disable-next-line no-restricted-syntax
      for (const it in newQuery) {
        if (ret !== '') ret += '&';
        if (it === 'data') {
          ret += `${encodeURIComponent(it)}=${encodeURIComponent(
            JSON.stringify(newQuery[it]),
          )}`;
        } else {
          ret += `${encodeURIComponent(it)}=${encodeURIComponent(
            newQuery[it],
          )}`;
        }
      }

      const request = apiClient[option.method](option.url, ret, header, config);
      cancelFn.current = request;
      const response = await request.send();
      // pushUserEvent(functionId);
      if (response) {
        setData(response.data || option.data);

        newData = response.data || option.data;
      } else {
        throw new Error('Unknown Error');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
    return newData;
  }

  async function execForCustom(
    url = option.url,
    newPayload = {},
    newHeader = header,
    config = {},
  ) {
    let newData = option.data;
    try {
      setIsLoading(true);
      const request = apiClient[option.method](
        url,
        newPayload,
        { ...header, ...newHeader },
        config,
      );
      cancelFn.current = request;
      const response = await request.send();
      // pushUserEvent(functionId);
      if (response) {
        setData(response.data || option.data);

        newData = response.data || option.data;
      } else {
        throw new Error('Unknown Error');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
    return newData;
  }

  async function execForFormData(newPayload = {}, config = {}) {
    let newData = option.data;
    try {
      setIsLoading(true);
      const request = apiClient[option.method](
        option.url,
        newPayload,
        header,
        config,
      );
      cancelFn.current = request;
      const response = await request.send();
      // pushUserEvent(functionId);
      if (response) {
        setData(response.data || option.data);

        newData = response.data || option.data;
      } else {
        throw new Error('Unknown Error');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
    return newData;
  }

  async function download(newPayload = {}, config = {}) {
    let newData = option.data;
    try {
      setIsLoading(true);
      const request = apiClient[option.method]({
        url: replace(option.url, newPayload),
        payload: getPayloadWithoutPathQuery(option.url, newPayload),
        header,
        config,
        onError,
      });
      cancelFn.current = request;
      const response = await request.send();
      // pushUserEvent(functionId);
      if (response) {
        // setData(response || option.data);
        newData = response || option.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
    return newData;
  }

  async function execForList(page = undefined, newQuery = {}) {
    let newData = option.data;
    try {
      setIsLoading(true);
      if (pagination && page) {
        pagination.page = page;
      }
      const updateQ = {
        ...query,
        ...newQuery,
      };
      updateQuery(updateQ);
      const newPayload = {
        ...updateQ,
        ...pagination,
      };

      sessionStorage.setItem('listCondition', JSON.stringify(newPayload));

      const request = apiClient[option.method]({
        url: replace(option.url, newPayload),
        payload: getPayloadWithoutPathQuery(option.url, newPayload),
        header,
        config: option.config,
      });
      cancelFn.current = request;
      const response = await request.send();
      // pushUserEvent(functionId);
      setData(response.data || option.data);

      /* customer setter */
      if (
        response &&
        Object.prototype.hasOwnProperty.call(response.data, 'pageInfo')
      ) {
        setTotal(response.data.pageInfo.total);
      }

      newData = response.data || option.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
    return newData;
  }

  const tableProps = {
    dataSource: data && data.result,
    loading: isLoading,
    onChange: (page, filters, sort) => {
      setPagination({
        page: page.current,
      });
      setSorter({
        field: sort.field,
        order: SORTER_ABBR[sort.order],
      });
    },
    pagination: {
      current: pagination.page,
      pageSize: pagination.pageSize,
      total,
    },
  };

  function getError() {
    return error ? JSON.parse(error) : {};
  }

  const cancel = () =>
    cancelFn.current && cancelFn.current.cancel
      ? cancelFn.current.cancel()
      : () => {};

  return {
    query,
    setQuery,
    pagination: {
      ...pagination,
      total,
    },
    setPagination,
    sorter,
    setSorter,
    payload,
    isLoading,
    data,
    error,
    exec,
    execNL,
    execForFormData,
    execForForm,
    execForList,
    execForCustom,
    download,
    tableProps,
    updater,
    getError,
    cancel,
    setData,
  };
};

export default useQuery;
