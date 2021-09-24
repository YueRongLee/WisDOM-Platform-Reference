/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Table } from 'antd';
import { CategoryApi } from '~~apis/';

const defaultPagination = {
  current: 1,
  pageSize: 10,
  total: 0,
};

const TableModal = ({ modal }) => {
  const [dataSource, setDataSource] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState(defaultPagination);

  const columns = [
    {
      title: 'User Name',
      dataIndex: 'userName',
      key: 'userName',
      width: '20%',
    },
    {
      title: 'Project',
      dataIndex: 'project',
      key: 'project',
      width: '15%',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: '15%',
    },
    {
      title: 'Apply Time',
      dataIndex: 'applyTime',
      key: 'applyTime',
      width: '15%',
    },
    {
      title: 'Dataflow ID',
      dataIndex: 'dataflowId',
      key: 'dataflowId',
      width: '15%',
    },
    {
      title: 'Access Count',
      dataIndex: 'accessCount',
      key: 'accessCount',
      width: '15%',
    },
  ];

  const getTableList = async (category, page) => {
    try {
      setIsLoading(true);
      const payload = {
        category,
        page,
        pageSize: pagination.pageSize,
      };
      const result = await CategoryApi.getTableList(payload);
      setDataSource(result.tableName.map(item => ({ tableName: item })));
      setPagination({
        ...pagination,
        total: result.pageInfo.total,
        current: page || pagination.current,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const onChangePage = page => {
    setPagination({
      ...pagination,
      current: page,
    });
    getTableList(modal.modalData, page);
  };

  useEffect(() => {
    if (modal.visible) {
      getTableList(modal.modalData);
    }
  }, [modal.visible]);

  return (
    <Modal
      title="Detail Data"
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的70％就scroll
      onCancel={() => modal.closeModal()}
      footer={false}
      width={900}
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        // scroll={{ x: 'max-content' }}
        pagination={{
          current: pagination.current,
          total: pagination.total,
          pageSize: 10,
          onChange: onChangePage,
        }}
        size="middle"
        loading={isLoading}
      />
    </Modal>
  );
};

TableModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape(),
  }).isRequired,
};

TableModal.defaultProps = {};

export default TableModal;
