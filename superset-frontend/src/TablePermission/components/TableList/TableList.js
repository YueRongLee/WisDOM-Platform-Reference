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
import { DATE_TYPE, PREVIEW_STATUS, ROLEPERMISSION } from '~~constants/index';
import DetailModal from './DetailModal';
import { getConstObject } from '../../../utils/common';

const TableList = ({
  userId,
  allowed,
  showDetail = true,
  hideData = [],
  tableType,
  page,
  pageSize,
  refreshCount,
}) => {
  const detailModal = useModal();
  const [tableList, setTableList] = useState([]);
  const getApproveListQuery = useQuery(TableApi.getApproveList);

  const [state, setState] = useState([]);
  let searchInput;
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));
  const isApprove = ROLEPERMISSION.checkPermission(
    SYSTEMLIST,
    ROLEPERMISSION.dataPipeline.tablePremission.datasetPermission.approve.value,
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
      //   dataIndex: 'applyUserName',
      dataIndex: 'userEnName',
    },
    {
      key: 'userId',
      title: 'User Id',
      dataIndex: 'userId',
    },
    {
      key: 'dept',
      title: 'Department',
      dataIndex: 'dept',
    },
    {
      key: 'project',
      title: 'Project',
      dataIndex: 'project',
    },
    {
      key: 'categories',
      title: 'Data Domain',
      dataIndex: 'categories',
      render: categories =>
        categories.map((c, index) => (
          <Tag className="listTag2" key={index}>
            {c}
          </Tag>
        )),
    },
    {
      key: 'reason',
      title: 'Reason',
      dataIndex: 'reason',
    },
    {
      key: 'type',
      title: 'Type',
      dataIndex: 'type',
    },
    {
      key: 'allowed',
      title: 'Status',
      dataIndex: 'allowed',
      render: allowed => getConstObject(PREVIEW_STATUS, allowed).name,
    },
    {
      key: 'updateTime',
      title: 'Update Time',
      dataIndex: 'updateTime',
      render: updateTime => moment(updateTime).format(DATE_TYPE.DATE_TIME),
    },
  ];

  const handleGetExtend = async approveData => {
    try {
      const result = await getApproveListQuery.exec({
        userId,
        allowed: PREVIEW_STATUS.EXTEND_APPLYING.value,
        tableType,
        page,
        pageSize,
      });

      if (approveData) {
        const list = [...approveData, ...result.results];
        list.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime));
        setTableList(list);
      } else {
        setTableList(result.data.results);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getApproveList = async () => {
    try {
      if (tableType.length !== 0) {
        const result = await getApproveListQuery.exec({
          userId,
          allowed,
          tableType,
          page,
          pageSize,
        });

        if (allowed === PREVIEW_STATUS.APPLYING.value) {
          handleGetExtend(result.results);
        } else {
          setTableList(result.results);
        }
      } else await getApproveListQuery.exec({ userId, allowed });
    } catch (e) {
      console.log(e);
    }
  };

  const onFinish = () => {
    getApproveList();
    refreshCount();
  };

  useEffect(() => {
    getApproveList();
  }, []);

  return (
    <>
      <Divider orientation="left">Preview</Divider>
      <Table
        columns={columns.filter(c => !hideData.includes(c.dataIndex))}
        // dataSource={getApproveListQuery.data.results}
        dataSource={tableList?.map(item => ({
          key: item.uuid,
          ...item,
        }))}
        scroll={{ x: 'max-content' }}
        pagination={{
          position: 'bottom',
          defaultPageSize: 10,
        }}
        rowKey="guid"
        loading={getApproveListQuery.isLoading}
        onRow={record => ({
          onClick: () =>
            showDetail && isApprove ? detailModal.openModal(record) : null,
          style: { cursor: showDetail && isApprove ? 'pointer' : 'auto' },
        })}
      />
      <DetailModal modal={detailModal} onFinish={onFinish} />
    </>
  );
};

TableList.propTypes = {};

TableList.defaultProps = {};

export default TableList;
