/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Table, Divider, Space, Input, Button, Tag } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { useModal, useQuery } from '~~hooks/';
import { MetadataApi } from '~~apis/';
import { DATE_TYPE, PREVIEW_STATUS, ROLEPERMISSION } from '~~constants/index';
import HealthDataModal from '../HealthDataModal/HealthDataModal';
import { getConstObject } from '../../../../utils/common';

const CustomTableList = ({
  userId,
  allowed,
  // showDetail = true,
  hideData = [],
  page,
  pageSize,
}) => {
  const healthDataModal = useModal();

  const getUserDefinedListQuery = useQuery(MetadataApi.getUserDefinedList);

  const [state, setState] = useState([]);
  let searchInput;
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));
  const isView = ROLEPERMISSION.checkPermission(
    SYSTEMLIST,
    ROLEPERMISSION.dataPipeline.tablePremission.applicationRecord.view.value,
  );
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
    render: text =>
      state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      key: 'tableName',
      title: 'Table Name',
      dataIndex: 'tableName',
      ...getColumnSearchProps('tableName'),
    },
    {
      key: 'userEnName',
      title: 'User Name',
      //   dataIndex: 'userName',
      dataIndex: 'userEnName',
    },
    {
      key: '',
      title: 'User Id',
      dataIndex: 'uploadUserId',
    },
    {
      key: 'categories',
      title: 'Data Domain',
      dataIndex: 'categories',
      render: categories => {
        if (categories) {
          return categories?.map((c, index) => (
            <Tag className="listTag2" key={index}>
              {c}
            </Tag>
          ));
        }
        return '';
      },
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: status => getConstObject(PREVIEW_STATUS, status).name,
    },
    {
      key: 'updateTime',
      title: 'Update Time',
      dataIndex: 'updateTime',
      render: updateTime =>
        moment(updateTime).isValid
          ? moment(updateTime).format(DATE_TYPE.DATE_TIME)
          : updateTime,
    },
  ];

  const getUserDefinedList = async () => {
    try {
      await getUserDefinedListQuery.exec({
        userId,
        status: allowed,
        page,
        pageSize,
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getUserDefinedList();
  }, []);

  return (
    <>
      <Divider orientation="left">User-Defined</Divider>
      <Table
        columns={columns.filter(c => !hideData.includes(c.dataIndex))}
        dataSource={getUserDefinedListQuery.data.results?.map(item => ({
          key: item.seqId,
          ...item,
        }))}
        scroll={{ x: 'max-content' }}
        pagination={{
          position: 'bottom',
          defaultPageSize: 10,
        }}
        rowKey="guid"
        loading={getUserDefinedListQuery.isLoading}
        onRow={(record, idx) => ({
          onClick:
            record.status === 1 && isView
              ? () => healthDataModal.openModal(record, idx)
              : () => {}, // click row
          style: { cursor: record.status === 1 ? 'pointer' : 'auto' },
        })}
      />
      <HealthDataModal modal={healthDataModal} />
    </>
  );
};

CustomTableList.propTypes = {};

CustomTableList.defaultProps = {};

export default CustomTableList;
