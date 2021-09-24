/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import { Table, Space, Input, Button, Modal } from 'antd';
import Highlighter from 'react-highlight-words';
import {
  SearchOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { TableApi } from '~~apis/';
import { ROLEPERMISSION } from '~~constants/index';

const { confirm } = Modal;
const pageSize = 10;

const GroupTableList = () => {
  const [state, setState] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  let searchInput;
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));

  const getTablePermissionForGroup = async () => {
    try {
      setIsLoading(true);
      const result = await TableApi.getTablePermissionForGroup();
      setDataSource(result);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTablePermissionForGroup = async uuid => {
    try {
      await TableApi.deleteTablePermissionForGroup(uuid);
      getTablePermissionForGroup();
    } catch (e) {
      console.log(e);
    }
  };

  const showConfirm = record => {
    confirm({
      title: 'Do you Want to delete these items?',
      icon: <ExclamationCircleOutlined />,
      // content: 'Some descriptions',
      onOk() {
        deleteTablePermissionForGroup(record.uuid);
      },
    });
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  const handleReset = clearFilters => {
    clearFilters();
    setState({ searchText: '' });
  };

  const renderContentFilter = (value, record, index) => {
    const obj = {
      children: (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[state.searchText]}
          autoEscape
          textToHighlight={value ? value.toString() : ''}
        />
      ),
      props: {},
    };

    const firstColumn = dataSource
      .filter(item => item.tableName.includes(state.searchText || ''))
      .findIndex(item => item.tableName === value);
    if (firstColumn % pageSize === index) {
      obj.props.rowSpan = dataSource
        .filter(item => item.tableName.includes(state.searchText))
        .filter(item => item.tableName === value).length;
    } else {
      obj.props.rowSpan = 0;
    }

    return obj;
  };

  const renderContent = (value, record, index) => {
    const obj = {
      children: (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[state.searchText]}
          autoEscape
          textToHighlight={value ? value.toString() : ''}
        />
      ),
      props: {},
    };

    const firstColumn = dataSource.findIndex(item => item.tableName === value);
    if (firstColumn % pageSize === index) {
      obj.props.rowSpan = dataSource.filter(
        item => item.tableName === value,
      ).length;
    } else if (
      firstColumn > -1 &&
      dataSource.filter(item => item.tableName === value).length === 1
    ) {
      obj.props.rowSpan = 1;
    } else {
      obj.props.rowSpan = 0;
    }

    return obj;
  };

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => (
      <SearchOutlined style={{ color: filtered ? '#d8800d' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.select(), 100);
      }
    },
    render: (text, record, idx) =>
      state.searchedColumn === dataIndex
        ? renderContentFilter(text, record, idx)
        : text,
  });

  const columns = [
    {
      title: 'Table Name',
      dataIndex: 'tableName',
      width: '45%',
      ...getColumnSearchProps('tableName'),
      render: (value, record, index) => renderContent(value, record, index),
    },
    {
      title: 'Group Name',
      dataIndex: 'groupName',
      width: '45%',
      render: value => (
        // <div style={{ display: 'flex', alignItems: 'center' }}>
        <div>{value}</div>
        // <DeleteOutlined
        //   style={{ marginLeft: 10 }}
        //   onClick={() => showConfirm(record)}
        // />
        // </div>
      ),
    },
    {
      title: '',
      dataIndex: 'delete',
      width: '10%',
      render: (value, record) => (
        <>
          {ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.dataPipeline.tablePremission.groupPermission.delete
              .value,
          ) ? (
            <DeleteOutlined
              style={{ marginLeft: 10 }}
              onClick={() => showConfirm(record)}
            />
          ) : null}
        </>
      ),
    },
  ];

  useEffect(() => {
    getTablePermissionForGroup();
  }, []);

  return (
    <>
      <Table
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: 'max-content' }}
        pagination={{
          position: 'bottom',
          defaultPageSize: 10,
        }}
        rowKey="guid"
        loading={isLoading}
      />
    </>
  );
};

GroupTableList.propTypes = {};

GroupTableList.defaultProps = {};

export default GroupTableList;
