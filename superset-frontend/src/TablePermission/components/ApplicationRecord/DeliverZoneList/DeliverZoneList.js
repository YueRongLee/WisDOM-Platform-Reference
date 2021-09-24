/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Table, Divider, Space, Input, Button, Tag } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { useModal, useQuery } from '~~hooks/';
import { TableApi } from '~~apis/';
import {
  DATE_TYPE,
  PREVIEW_STATUS,
  SYSTEM_TYPE,
  ROLEPERMISSION,
} from '~~constants/index';
import DetailModal from '../../TableList/DetailModal';
import HealthDataModal from '../HealthDataModal/HealthDataModal';
import { getConstObject } from '../../../../utils/common';

const TableList = ({
  userId,
  allowed,
  // showDetail = true,
  hideData = [],
  tableType,
  page,
  pageSize,
}) => {
  const detailModal = useModal();
  const healthDataModal = useModal();

  const getApproveListQuery = useQuery(TableApi.getApproveList);

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
      title: 'Table Name',
      dataIndex: 'tableName',
      ...getColumnSearchProps('tableName'),
    },
    {
      title: 'User Name',
      //   dataIndex: 'applyUserName',
      dataIndex: 'userEnName',
    },
    {
      title: 'User Id',
      dataIndex: 'userId',
    },
    {
      title: 'Department',
      dataIndex: 'dept',
    },
    {
      title: 'Project',
      dataIndex: 'project',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
    },
    {
      title: 'Data Domain',
      dataIndex: 'categories',
      render: categories =>
        categories.map(c => <Tag className="listTag2">{c}</Tag>),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      filters: [
        {
          text: SYSTEM_TYPE.props.WDC.key,
          value: SYSTEM_TYPE.props.WDC.key,
        },
        {
          text: SYSTEM_TYPE.props.WDL.key,
          value: SYSTEM_TYPE.props.WDL.key,
        },
      ],
      onFilter: (value, record) => record.type.indexOf(value) === 0,
    },
    {
      title: 'Status',
      dataIndex: 'allowed',
      render: allowed => getConstObject(PREVIEW_STATUS, allowed).name,
    },
    {
      title: 'Update Time',
      dataIndex: 'updateTime',
      render: updateTime => moment(updateTime).format(DATE_TYPE.DATE_TIME),
    },
  ];

  const getApproveList = async () => {
    try {
      if (tableType.length !== 0) {
        await getApproveListQuery.exec({
          userId,
          allowed,
          tableType,
          page,
          pageSize,
        });
      } else await getApproveListQuery.exec({ userId, allowed });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getApproveList();
  }, []);

  return (
    <>
      <Divider orientation="left">Wisdom-DeliverZone</Divider>
      <Table
        columns={columns.filter(c => !hideData.includes(c.dataIndex))}
        dataSource={getApproveListQuery.data.results}
        scroll={{ x: 'max-content' }}
        pagination={{
          position: 'bottom',
          defaultPageSize: 10,
        }}
        rowKey="guid"
        loading={getApproveListQuery.isLoading}
        // onRow={record => ({
        //   onClick: () => (showDetail ? detailModal.openModal(record) : null),
        //   style: { cursor:  'pointer' },
        // })}
        onRow={(record, idx) => ({
          onClick: isView
            ? () => healthDataModal.openModal(record, idx)
            : () => {}, // click row
          style: { cursor: 'pointer' },
        })}
      />
      <DetailModal modal={detailModal} onFinish={getApproveList} />
      <HealthDataModal modal={healthDataModal} />
    </>
  );
};

TableList.propTypes = {};

TableList.defaultProps = {};

export default TableList;
