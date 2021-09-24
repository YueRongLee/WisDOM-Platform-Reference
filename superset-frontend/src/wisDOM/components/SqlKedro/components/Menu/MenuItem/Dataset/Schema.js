/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
// eslint-disable-next-line no-restricted-imports
import { Table, Spin } from 'antd';
import { DATE_TYPE } from '~~constants/index';
import { TableApi } from '~~apis/';
import * as Style from './style';

const column = [
  {
    key: 'name',
    dataIndex: 'name',
    title: 'column',
  },
  {
    key: 'type',
    dataIndex: 'type',
    title: 'type',
  },
];

const Schema = ({ nodeData, data }) => {
  const [tableInfo, setTableInfo] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const getColumns = async () => {
    setLoading(true);
    try {
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      if (index !== -1) {
        const nodeArg = data.nodes[index].args;
        const result = await TableApi.getAllowedTableColumns(
          nodeArg.table_name,
        );
        setTableInfo({
          tableName: result.table.name,
          lastUpdateTime: result.lastUpdateTime,
          columns: result.table.columns,
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getColumns();
  }, []);

  return (
    <Spin wrapperClassName="schema-list-wrapper" spinning={isLoading}>
      <Style.SqlKedroBlock>
        <h4>{tableInfo.tableName}</h4>
        <div className="table-updatetime">
          {tableInfo.lastUpdateTime !== undefined &&
          tableInfo.lastUpdateTime !== ''
            ? moment(tableInfo.lastUpdateTime).format(DATE_TYPE.DATE_TIME)
            : ''}
        </div>
        <Table
          dataSource={tableInfo.columns}
          columns={column}
          rowKey="name"
          pagination={false}
        />
      </Style.SqlKedroBlock>
    </Spin>
  );
};

export default Schema;
