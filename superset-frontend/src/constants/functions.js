// import React from 'react';
// import Icon from '@ant-design/icons';
import moment from 'moment';
import { TableApi } from '~~apis/';

export const NODE_NAME = name => {
  if (name && name.length > 10) {
    return `${name.substring(0, 8)}...`;
  }
  return name;
};

export const SET_DATA = (
  data,
  nodeChange,
  index,
  newID,
  getArgNode,
  setNewArg,
  newEdge,
) => {
  if (nodeChange && data && index !== undefined && index !== -1 && newID) {
    const DATA = data;
    const nodeFullName = nodeChange.full_name
      ? nodeChange.full_name
      : nodeChange.name;
    const changeNewArg = setNewArg;
    if (changeNewArg.type === 'cleansing') {
      changeNewArg.type = 'transform';
    }
    const timeSegmentUnit = nodeChange.timeSegmentUnit || '';
    const timeSegmentValue = nodeChange.timeSegmentValue || 0;
    DATA.nodes[index] = {
      full_name: nodeFullName,
      name: NODE_NAME(nodeFullName),
      id: newID,
      type: nodeChange.type,
      args: { ...changeNewArg, timeSegmentUnit, timeSegmentValue },
      check: getArgNode ? getArgNode.check : undefined,
      schema: getArgNode ? getArgNode.schema : undefined,
    };

    // 不存在則刪除指定欄位
    if (!nodeChange.timeSegmentUnit) {
      delete DATA.nodes[index].args.timeSegmentUnit;
    }
    if (!nodeChange.timeSegmentValue) {
      delete DATA.nodes[index].args.timeSegmentValue;
    }

    const newData = {
      edges: [...newEdge],
      nodes: DATA.nodes,
    };
    return newData;
  }
  return null;
};

// 時間轉換顯示
export const TIMESTAMP_TO_TIME = timestamp => {
  if (timestamp && timestamp !== '' && timestamp !== null) {
    // const date = new Date(timestamp); // 10位需*1000,13位不用
    // const Y = `${date.getUTCFullYear()}/`;
    // const M = `${
    //   date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    // }/`;
    // const D = `${date.getDate()} `;
    // const h = `${date.getHours()}:`;
    // const m = `${date.getMinutes()}:`;
    // const s = date.getSeconds();
    // return Y + M + D + h + m + s;

    return moment(timestamp).format('YYYY/MM/DD HH:mm:ss');
  }
  return null;
};

// Table是否超過1個月
export const CHECK_TIMESTAMP_BY_TABLENAME = async tableName => {
  //   const result = GET_TABLE_BY_NAME(tableName);
  try {
    if (tableName) {
      const result = await TableApi.getAllowedTableColumns(tableName);
      const stamp =
        result && result !== null && result.lastUpdateTime
          ? result.lastUpdateTime
          : undefined;

      if (stamp) {
        const now = new Date();
        const timeStamp = new Date(stamp); // 10位需*1000,13位不用
        const subtract = now.getTime() - timeStamp.getTime();
        const value = new Date(subtract);
        const monthCount = value.getMonth();
        // const dayCount = value.getDate();//差幾天
        if (monthCount >= 1) {
          return true;
        }
        return false;
      }
      return false;
    }
    return false;
  } catch (e) {
    return false;
  }
};

// stamp是否超過1個月
export const CHECK_TIMESTAMP = timestamp => {
  if (timestamp) {
    const now = new Date();
    const stamp = new Date(timestamp); // 10位需*1000,13位不用
    const subtract = now.getTime() - stamp.getTime();
    const value = new Date(subtract);
    const monthCount = value.getMonth();
    if (monthCount >= 1) {
      return true;
    }
  }
  return false;
};

export const GET_NODE_DETAIL = (data, id) =>
  data.nodes.filter(node => node.id === id);

export const COLUMN_TYPE_MAPPING = type => {
  const STRING = ['string', 'text', 'varchar', 'char'];
  const DOUBLE = ['double', 'float'];
  const INTEGER = ['integer', 'int', 'bigint'];
  // const DECIMAL = ["decimal"],
  // const BOOLEAN = ["boolean"],
  // const BINARY = ["binary"],
  const DATETIME = ['dateTime', 'timestamp', 'date', 'dateTimeOffset'];

  if (STRING.includes(type)) {
    return 'string';
  }
  if (DOUBLE.includes(type)) {
    return 'double';
  }
  if (INTEGER.includes(type)) {
    return 'int';
  }
  if (DATETIME.includes(type)) {
    return 'date';
  }
  return type;
};
