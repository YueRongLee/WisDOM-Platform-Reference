/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Table } from 'antd';
import moment from 'moment';
import { TableApi } from '~~apis/';

// const { Search } = Input;

const defaultPagination = {
  current: 1,
  pageSize: 10,
  total: 0,
};

// const defaultSorter = {
//   field: 'userName',
//   order: 'descend',
// };

const TableModal = ({ modal }) => {
  const [dataSource, setDataSource] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState(defaultPagination);
  // const [searchKey, setSearchKey] = useState('');

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
      render: value => (value ? moment(value).format('YYYY/MM/DD HH:MM') : ''),
    },
    {
      title: 'Dataflow ID',
      dataIndex: 'dataflowId',
      key: 'dataflowId',
      width: '15%',
    },
    {
      title: 'Access Count',
      dataIndex: 'count',
      key: 'count',
      width: '15%',
    },
  ];

  const getUsetAllows = async (tableName, page) => {
    try {
      setIsLoading(true);
      const payload = {
        pageQueryInfo: {
          page,
          pageSize: pagination.pageSize,
          // searchKey,
          // sorter: defaultSorter,
        },
        tableName,
      };

      const result = await TableApi.getUsetAllows(payload);
      setDataSource(result.userAllow);
      setPagination({
        ...pagination,
        total: result.pageInfo.total,
        current: page,
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
    getUsetAllows(modal.modalData.tableName, page);
  };

  useEffect(() => {
    if (modal.visible) {
      getUsetAllows(modal.modalData.tableName, 1);
    }
  }, [modal.visible]);

  // const onChangeInput = e => {
  //   setSearchKey(e.target.value);
  // };

  // const onSearch = () => {
  //   getUsetAllows(modal.modalData.tableName, 1);
  // };

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
      <>
        {/* <div
          className="DataSetTable"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 10,
          }}
        >
          <Search
            id="test-keyword"
            placeholder="input search text"
            onSearch={onSearch}
            value={searchKey}
            style={{
              marginRight: 10,
              width: 200,
            }}
            onChange={onChangeInput}
          />
        </div> */}
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
      </>
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
