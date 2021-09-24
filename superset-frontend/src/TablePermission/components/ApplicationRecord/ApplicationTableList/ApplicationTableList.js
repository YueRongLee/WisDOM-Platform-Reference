/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Table, Divider, Space, Input, Button, Tooltip, Tag } from 'antd';
import Highlighter from 'react-highlight-words';
import {
  SearchOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useModal } from '~~hooks/';
import { TableApi } from '~~apis/';
import { DATE_TYPE, ROLEPERMISSION } from '~~constants/index';
import ApplyModal from './ApplyModal';
import ApprovalHistoryModal from './ApprovalHistoryModal';

const ApplicationTableList = () => {
  const applyModal = useModal();
  const approvalHistoryModal = useModal();

  // const getApproveListQuery = useQuery(TableApi.getApproveList);

  const [state, setState] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));
  const isView = ROLEPERMISSION.checkPermission(
    SYSTEMLIST,
    ROLEPERMISSION.dataPipeline.tablePremission.applicationRecord.view.value,
  );
  let searchInput;

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

  const checkExpird = endDate =>
    moment().valueOf() >= moment(endDate).subtract(7, 'days');

  const columns = [
    {
      key: 'tableName',
      title: 'Table Name',
      dataIndex: 'tableName',
      ...getColumnSearchProps('tableName'),
      render: (value, record, idx) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={
            isView
              ? () => approvalHistoryModal.openModal(record, idx)
              : () => {}
          }
        >
          {value}
        </div>
      ),
    },
    {
      key: 'categories',
      title: 'Data Domain',
      dataIndex: 'categories',
      render: (categories, record, idx) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={
            isView
              ? () => approvalHistoryModal.openModal(record, idx)
              : () => {}
          }
        >
          {categories.map((c, index) => (
            <Tag className="listTag2" key={index}>
              {c}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      key: 'applicant',
      title: 'Applicant',
      dataIndex: 'applicant',
      render: (value, record, idx) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={
            isView
              ? () => approvalHistoryModal.openModal(record, idx)
              : () => {}
          }
        >
          {value}
        </div>
      ),
    },
    {
      key: 'groupName',
      title: 'Group',
      dataIndex: 'groupName',
      render: (value, record, idx) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={
            isView
              ? () => approvalHistoryModal.openModal(record, idx)
              : () => {}
          }
        >
          {value}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (value, record, idx) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={
            isView
              ? () => approvalHistoryModal.openModal(record, idx)
              : () => {}
          }
        >
          {value}
        </div>
      ),
    },
    {
      key: 'endTime',
      title: 'End Date',
      dataIndex: 'endTime',
      render: (endDate, record, idx) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={
            isView
              ? () => approvalHistoryModal.openModal(record, idx)
              : () => {}
          }
        >
          {endDate ? moment(endDate).format(DATE_TYPE.DATE_TIME) : 'Dateless'}
        </div>
      ),
    },
    {
      key: 'action',
      title: '',
      dataIndex: 'action',
      render: (value, record) =>
        record.endDate ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {ROLEPERMISSION.checkPermission(
              SYSTEMLIST,
              ROLEPERMISSION.dataPipeline.tablePremission.applicationRecord
                .extend.value,
            ) ? (
              <Button
                type="primary"
                icon={<ClockCircleOutlined />}
                onClick={() => applyModal.openModal(record)}
              >
                Extend time
              </Button>
            ) : null}

            {checkExpird(record.endDate) ? (
              <Tooltip placement="top" title="Expiring">
                <ExclamationCircleOutlined
                  style={{
                    fontSize: 18,
                    color: 'tomato',
                    marginLeft: 10,
                  }}
                />
              </Tooltip>
            ) : null}
          </div>
        ) : null,
    },
  ];

  const compareString = (a, b) => {
    // 使用 toUpperCase() 忽略字元大小寫
    const bandA = a.tableName.toUpperCase();
    const bandB = b.tableName.toUpperCase();

    let comparison = 0;
    if (bandA > bandB) {
      comparison = 1;
    } else if (bandA < bandB) {
      comparison = -1;
    }
    return comparison;
  };

  const compareTime = (a, b) => {
    // 使用 toUpperCase() 忽略字元大小寫
    const bandA = a.endTime;
    const bandB = b.endTime;

    let comparison = 0;
    if (bandA > bandB) {
      comparison = 1;
    } else if (bandA < bandB) {
      comparison = -1;
    }
    return comparison;
  };

  const getUserApplyRecord = async () => {
    try {
      setLoading(true);
      const result = await TableApi.getUserApplyRecord();
      const timelist = result.filter(item => item.endTime !== '');
      const datelesslist = result.filter(item => item.endTime === '');

      setDataSource([
        ...timelist.sort(compareTime),
        ...datelesslist.sort(compareString),
      ]);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const extendApply = async (modalData, changeData) => {
    try {
      const config = {
        columnFilter: modalData.columnFilter,
        dept: modalData.dept,
        endDate: changeData.timeRange[1].format('YYYY/MM/DD'),
        groupId: modalData.groupId,
        period: changeData.period,
        project: modalData.project,
        reason: modalData.reason,
        startDate: changeData.timeRange[0].format('YYYY/MM/DD'),
        tableName: modalData.tableName,
        type: modalData.type,
        types: [modalData.type],
        userId: modalData.userId,
        userIds: [modalData.userId],
        uuid: modalData.uuid,
      };
      await TableApi.extendApply(config);
      getUserApplyRecord();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    // getApproveList();
    getUserApplyRecord();
  }, []);

  return (
    <>
      <Divider orientation="left">Preview</Divider>
      <Table
        columns={columns}
        dataSource={dataSource.map(item => ({
          key: item.uuid,
          ...item,
        }))}
        scroll={{ x: 'max-content' }}
        pagination={{
          position: 'bottom',
          defaultPageSize: 10,
        }}
        rowKey="guid"
        loading={loading}
        // onRow={(record, idx) => ({
        //   onClick: () => healthDataModal.openModal(record, idx), // click row
        //   style: { cursor: 'pointer' },
        // })}
        // onRow={record => ({
        //   onClick: () => (showDetail ? applyModal.openModal(record) : null),
        //   style: { cursor: showDetail ? 'pointer' : 'auto' },
        // })}
      />
      <ApplyModal modal={applyModal} onFinish={extendApply} />
      <ApprovalHistoryModal modal={approvalHistoryModal} />
    </>
  );
};

ApplicationTableList.propTypes = {};

ApplicationTableList.defaultProps = {};

export default ApplicationTableList;
