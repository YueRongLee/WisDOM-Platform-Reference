import { METADATA } from './url';

export const getUserDefineTable = {
  url: METADATA.GET_USER_TABLE,
  method: 'get',
  payload: {},
  data: {
    data: [],
  },
  config: {},
};

export const getUserDefineTableSchema = {
  url: METADATA.GET_USER_TABLE_SCHEMA,
  method: 'get',
  payload: {},
  data: {
    data: [],
  },
  config: {},
};

export const getColumnType = {
  url: METADATA.GET_COLUMN_TYPE,
  method: 'get',
  payload: {},
  data: {
    data: [],
  },
  config: {},
};

export const getUserDefinedList = {
  url: METADATA.GET_USER_DEFINED_LIST,
  method: 'post',
  payload: {},
  data: [],
  config: {},
};

export const grantUserDefinedPermission = {
  url: METADATA.GRANT_USER_DEFINED_PERMISSION,
  method: 'post',
  payload: {},
  data: {},
  config: {},
};
