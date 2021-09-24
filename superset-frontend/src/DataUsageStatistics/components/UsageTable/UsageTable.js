/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
import { FileSearchOutlined, FileDoneOutlined } from '@ant-design/icons';
import { Input, Tooltip } from 'antd';
import { PowerBiTemplateApi } from '~~apis/';
import TableModal from '../TableModal/TableModal';
import { useModal } from '~~hooks/';
import * as Style from './style';

const { Search } = Input;

const defaultPagination = {
  current: 1,
  pageSize: 10,
  total: 0,
};

const defaultSorter = {
  field: 'tableName',
  order: 'descend',
};

const tempData = [
  {
    tableName: 'tableName',
    source: 'source',
    consumeTime: 'consumeTime',
    updateTime: 'updateTime',
    category: 'type',
    dataOwner: 'dataOwner',
    totalAccess: 'totalAccess',
  },
];

const UsageTable = () => {
  const [tableList, setTableList] = useState(tempData);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState(defaultPagination);
  const [sorter, setSorter] = useState(defaultSorter);

  const tableModal = useModal();

  const onChangeInput = e => {
    setKeyword(e.target.value);
  };

  const columns = (sorter, tableModal) => [
    {
      title: 'Table Name',
      dataIndex: 'tableName',
      width: '15%',
      sortOrder: sorter.field === 'tableName' ? sorter.order : false,
      sorter: true,
    },
    {
      title: 'Source',
      dataIndex: 'source',
      width: '15%',
      sortOrder: sorter.field === 'source' ? sorter.order : false,
      sorter: true,
    },
    {
      title: 'Consume Time',
      dataIndex: 'consumeTime',
      width: '15%',
      sortOrder: sorter.field === 'consumeTime' ? sorter.order : false,
      sorter: true,
    },
    {
      title: 'Update Time',
      dataIndex: 'updateTime',
      width: '10%',
      sortOrder: sorter.field === 'updateTime' ? sorter.order : false,
      sorter: true,
    },
    {
      title: 'Data Domain',
      dataIndex: 'category',
      width: '10%',
      sortOrder: sorter.field === 'category' ? sorter.order : false,
      sorter: true,
    },
    {
      title: 'Data Owner',
      dataIndex: 'dataOwner',
      width: '10%',
      sortOrder: sorter.field === 'dataOwner' ? sorter.order : false,
      sorter: true,
    },
    {
      title: 'Total Access',
      dataIndex: 'totalAccess',
      width: '10%',
      sortOrder: sorter.field === 'totalAccess' ? sorter.order : false,
      sorter: true,
    },
    {
      title: 'Application Record',
      dataIndex: 'record',
      width: '10%',
      render: (value, record) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Tooltip placement="top" title="Application Record">
            <FileSearchOutlined
              style={{ fontSize: 20 }}
              onClick={() => tableModal.openModal(record)}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: ' Approval Record',
      dataIndex: 'record',
      width: '10%',
      render: (value, record) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Tooltip placement="top" title="Application Record">
            <FileDoneOutlined
              style={{ fontSize: 20 }}
              onClick={() => tableModal.openModal(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const getTemplateList = async (page, tempSorter) => {
    try {
      setLoading(true);
      const payload = {
        page,
        pageSize: pagination.pageSize,
        searchKey: keyword,
        sorter: tempSorter || sorter,
      };
      const result = await PowerBiTemplateApi.getPowerBiTemplate(payload);
      setTableList(result.templateList);
      setPagination({
        ...pagination,
        total: result.pageInfo.total,
        current: page || pagination.current,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = () => {
    getTemplateList(1);
  };

  const onChangePage = page => {
    setPagination({
      ...pagination,
      current: page,
    });
    getTemplateList(page);
  };

  useEffect(() => {
    // getTemplateList();
  }, []);

  const onChange = (pagination, filters, sorter) => {
    getTemplateList(1, sorter);
    setSorter({ field: sorter.field, order: sorter.order });
  };

  return (
    <Style.Container>
      <div
        className="DataSetTable"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Search
          placeholder="input search text"
          onSearch={onSearch}
          value={keyword}
          style={{
            marginRight: 10,
            width: 200,
          }}
          onChange={onChangeInput}
        />
      </div>

      <Style.DataSetTable
        columns={columns(sorter, tableModal)}
        dataSource={loading ? [] : tableList}
        pagination={{
          current: pagination.current,
          total: pagination.total,
          pageSize: 10,
          onChange: onChangePage,
        }}
        onChange={onChange}
        showSizeChanger={false}
        scroll={{ y: '60vh' }}
        rowKey="guid"
        loading={loading}
      />
      <TableModal modal={tableModal} />
    </Style.Container>
  );
};

UsageTable.propTypes = {};

UsageTable.defaultProps = {};

export default UsageTable;
