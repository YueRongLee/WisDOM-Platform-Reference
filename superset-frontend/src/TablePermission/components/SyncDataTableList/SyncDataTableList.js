/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, Button } from 'antd';
// import { ExclamationCircleOutlined } from '@ant-design/icons';
import { SyncDataApi } from '~~apis/';

const filterOption = [
  {
    value: 'All',
  },
  {
    value: 'Apply',
  },
  {
    value: 'Complete',
  },
];

const defaultPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
};

const SyncDataTableList = () => {
  const [dataSource, setDataSource] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState(defaultPagination);
  const [filterStatus, setFilterStatus] = useState('All');

  const getTableSyncData = async (status, current) => {
    try {
      setIsLoading(true);
      const payload = {
        filter: status || filterStatus,
        page: current,
        pageSize: pagination.pageSize,
      };
      const result = await SyncDataApi.getAsyncDataList(payload);
      setDataSource(result.syncDataRequestList);
      setPagination({ ...result.pageInfo, page: current });
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const applySyncData = async record => {
    try {
      const payload = {
        seqId: record.seqId,
      };
      await SyncDataApi.completeSyncData(payload);
      getTableSyncData(filterStatus, pagination.page);
    } catch (e) {
      console.log(e);
    }
  };

  const columns = [
    {
      title: 'Request User',
      dataIndex: 'requestUserName',
      width: '15%',
    },
    {
      title: 'Host',
      dataIndex: 'host',
      width: '10%',
    },
    {
      title: 'Port',
      dataIndex: 'port',
      width: '10%',
    },
    {
      title: 'DB Type',
      dataIndex: 'type',
      width: '15%',
    },
    {
      title: 'Source',
      dataIndex: 'database',
      width: '15%',
      render: tags => (
        <span>
          {tags.map(tag => (
            <Tag key={tag} style={{ margin: 5 }}>
              {tag}
            </Tag>
          ))}
        </span>
      ),
    },
    {
      title: 'Remark',
      dataIndex: 'remark',
      width: '15%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '10%',
    },
    {
      title: '',
      dataIndex: 'detail',
      width: '10%',
      render: (value, record) => (
        <>
          {record.status === 'Apply' ? (
            <Button bsStyle="primary" onClick={() => applySyncData(record)}>
              Consume Complete
            </Button>
          ) : null}
        </>
      ),
    },
  ];

  useEffect(() => {
    getTableSyncData(filterStatus, 1);
  }, []);

  const handleChange = value => {
    setFilterStatus(value);
    getTableSyncData(value, 1);
  };

  return (
    <>
      <div>
        Filter
        <Select
          value={filterStatus}
          style={{ width: 120, margin: 10 }}
          options={filterOption}
          onChange={handleChange}
        />
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: 'max-content' }}
        pagination={{
          position: 'bottom',
          pageSize: 10,
          current: pagination.page,
          total: pagination.total,
          onChange: page => getTableSyncData(filterStatus, page),
        }}
        rowKey="guid"
        loading={isLoading}
      />
    </>
  );
};

SyncDataTableList.propTypes = {};

SyncDataTableList.defaultProps = {};

export default SyncDataTableList;
