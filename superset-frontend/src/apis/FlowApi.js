import { FLOW } from './url';

export const syncTable = {
  url: FLOW.SYNC_TABLE,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const syncTestConn = {
  url: FLOW.TEST_CONN,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};

export const getSyncRecord = {
  url: FLOW.GET_SYNC_RECORD,
  method: 'get',
  payload: {},
  data: {
    data: [],
  },
  config: {},
};

export const getListSyncRecord = {
  url: FLOW.GET_LIST_SYNC_RECORD,
  method: 'get',
  payload: {},
  data: {
    data: [],
  },
  config: {},
};
