/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import moment from 'moment';
// import { ExclamationCircleOutlined } from '@ant-design/icons';
import { TableApi } from 'src/apis/';
import HealthDataModal from './HealthDataModal';
import { useModal } from '~~hooks/';
import { ROLEPERMISSION } from '~~constants/index';

const defaultPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
};

const SOURCE = {
  1: 'Set data domain while user upload',
  2: 'Data owner change data domain',
  3: 'Dataflow publish a table',
};
const CategoryTableList = ({ refreshCount }) => {
  const [dataSource, setDataSource] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState(defaultPagination);

  const healthDataModal = useModal();
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));
  const isApprove = ROLEPERMISSION.checkPermission(
    SYSTEMLIST,
    ROLEPERMISSION.dataPipeline.tablePremission.dataDomainPermission.approve
      .value,
  );

  // 時間轉換
  function timestampToTime(timestamp) {
    if (timestamp !== '' && timestamp !== null) {
      return moment(timestamp).format('YYYY/MM/DD HH:mm:ss');
    }
    return null;
  }

  const getTableData = async current => {
    try {
      setIsLoading(true);
      const payload = {
        page: current,
        pageSize: pagination.pageSize,
        status: [2], // 申請中:2  allowed:1  reject: 3
      };
      const result = await TableApi.getCategoryList(payload);
      const tempResult = result.list.map(item => ({
        applicationId: item.datasetApplication.applicationId,
        tableName: item.datasetApplication.tableName,
        tableDescription: item.tableInfo.table.comment,
        source: SOURCE[item.datasetApplication.sourceType],
        owners: item.tableInfo.ownerEnName,
        updateTime: timestampToTime(item.tableInfo.lastUpdateTime),
        healthData: item.tableInfo,
      }));
      setDataSource(tempResult);
      setPagination({ ...result.pageInfo, page: current });
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    await getTableData();
    await refreshCount();
  };

  // const applySyncData = async record => {
  //   try {
  //     const payload = {
  //       seqId: record.seqId,
  //     };
  //     await SyncDataApi.completeSyncData(payload);
  //     getTableData(pagination.page);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  const columns = [
    {
      title: 'Table Name',
      dataIndex: 'tableName',
      width: '20%',
    },
    {
      title: 'Table Description',
      dataIndex: 'tableDescription',
      width: '20%',
    },
    {
      title: 'Source',
      dataIndex: 'source',
      width: '20%',
    },
    {
      title: 'Owners',
      dataIndex: 'owners',
      width: '20%',
    },
    {
      title: 'Update Time',
      dataIndex: 'updateTime',
      width: '20%',
    },
  ];

  useEffect(() => {
    getTableData(1);
  }, []);

  return (
    <>
      <Table
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: 'max-content' }}
        pagination={{
          position: 'bottom',
          pageSize: 10,
          current: pagination.page,
          total: pagination.total,
          onChange: page => getTableData(page),
        }}
        onRow={(record, idx) => ({
          onClick: () =>
            isApprove ? healthDataModal.openModal(record, idx) : () => {}, // click row
          style: { cursor: 'pointer' },
        })}
        rowKey="guid"
        loading={isLoading}
      />
      <HealthDataModal modal={healthDataModal} refresh={refresh} />
    </>
  );
};

CategoryTableList.propTypes = {};

CategoryTableList.defaultProps = {};

export default CategoryTableList;
