/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
import {
  ExclamationCircleOutlined,
  FileSearchOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import { Input, Select, Modal, Button, Tooltip } from 'antd';
import moment from 'moment';
import TableModal from '../TableModal/TableModal';
import { ROLE_TYPE, ROLEPERMISSION } from '~~constants/index';
import { TableApi, UserApi } from '~~apis/';
import ApprovalModal from '../ApprovalModal/ApprovalModal';
import { useModal } from '~~hooks/';

import * as Style from './style';

const { Option } = Select;

const { Search } = Input;

const { confirm } = Modal;

const defaultPagination = {
  current: 1,
  pageSize: 10,
  total: 0,
};

const defaultSorter = {
  field: 'tableName',
  order: 'descend',
};

const DataSetTable = () => {
  const [tableList, setTableList] = useState([]);
  const [changeList, setChangeList] = useState([]);
  const [memberList, setMemberList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState(defaultPagination);
  const [sorter, setSorter] = useState(defaultSorter);

  const tableModal = useModal();
  const approvalModal = useModal();
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));
  const onChangeInput = e => {
    setKeyword(e.target.value);
  };

  const columns = (list, handleChange, sorter, tableModal, approvalModal) => [
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
      width: '10%',
      sortOrder: sorter.field === 'source' ? sorter.order : false,
      sorter: true,
    },
    {
      title: 'Consume Time',
      dataIndex: 'consumeTime',
      width: '10%',
      sortOrder: sorter.field === 'consumeTime' ? sorter.order : false,
      sorter: true,
      render: value => moment(value).format('YYYY/MM/DD HH:MM'),
    },
    {
      title: 'Update Time',
      dataIndex: 'updateTime',
      width: '10%',
      sortOrder: sorter.field === 'updateTime' ? sorter.order : false,
      sorter: true,
      render: value => moment(value).format('YYYY/MM/DD HH:MM'),
    },
    {
      title: 'Data Domain',
      dataIndex: 'category',
      width: '8%',
      sortOrder: sorter.field === 'category' ? sorter.order : false,
      sorter: true,
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      width: '16%',
      sortOrder: sorter.field === 'owner' ? sorter.order : false,
      sorter: true,
      render: (value, record) => (
        <Select
          disabled={
            !localStorage.getItem('role').includes(ROLE_TYPE.DATA_MASTER) ||
            !ROLEPERMISSION.checkPermission(
              SYSTEMLIST,
              ROLEPERMISSION.setting.datasetMangement.edit.value,
            )
          }
          showSearch
          value={value}
          style={{ width: 200 }}
          onChange={v => handleChange(v, record)}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {list.map(item => (
            <Option value={item.userId}>{item.userNameEn}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Total Access',
      dataIndex: 'totalAccess',
      width: '6%',
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
          {record.admin ? (
            <Tooltip placement="top" title="Application Record">
              <FileSearchOutlined
                style={{ fontSize: 20 }}
                onClick={() => tableModal.openModal(record)}
              />
            </Tooltip>
          ) : null}
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
          {record.dataOwner ? (
            <Tooltip placement="top" title="Application Record">
              <FileDoneOutlined
                style={{ fontSize: 20 }}
                onClick={() => approvalModal.openModal(record)}
              />
            </Tooltip>
          ) : null}
        </div>
      ),
    },
  ];

  const handleChangeSelect = (value, record) => {
    const tempTableList = [...tableList].map(item => {
      if (item.tableName === record.tableName) {
        return {
          ...item,
          owner: value,
        };
      }
      return item;
    });
    setTableList(tempTableList);
    if (changeList.length > 0) {
      const filterList = changeList.filter(
        item => item.tableName !== record.tableName,
      );
      const temp = {
        changeOwner: value,
        tableName: record.tableName,
      };
      setChangeList([...filterList, temp]);
    } else {
      const temp = {
        changeOwner: value,
        tableName: record.tableName,
      };
      setChangeList([temp]);
    }
  };

  const getUserList = async () => {
    try {
      const result = await UserApi.getUserList();
      setMemberList(result);
    } catch (e) {
      console.log(e);
    }
  };

  const getDataSetList = async (page, tempSorter) => {
    try {
      setLoading(true);
      const payload = {
        searchKey: keyword,
        page: page || pagination.current,
        pageSize: pagination.pageSize,
        sorter: tempSorter || sorter,
      };
      const result = await TableApi.getTableInfo(payload);
      setTableList(result.tableOwnerList);
      setPagination({
        ...pagination,
        total: result.pageInfo.total,
        current: page,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setChangeList([]);
      setLoading(false);
    }
  };

  const onSearch = () => {
    getDataSetList(1);
  };

  // const onChangePage = page => {
  //   setPagination({
  //     ...pagination,
  //     current: page,
  //   });
  //   getDataSetList(page);
  // };

  const saveData = async () => {
    try {
      setLoading(true);
      const data = {
        tableWithOwnerChangeList: changeList,
      };
      const result = await TableApi.changeOwner(data);
      setTableList(result.tableOwnerList);
      setPagination({
        ...pagination,
        total: result.pageInfo.total,
        current: 1,
      });
      setKeyword('');
      getDataSetList();
    } catch (e) {
      console.log(e);
    } finally {
      setChangeList([]);
      setLoading(false);
    }
  };

  const showConfirm = () => {
    confirm({
      title: 'Do you Want to save these change items?',
      icon: <ExclamationCircleOutlined />,
      // content: 'Some descriptions',
      onOk() {
        saveData();
      },
      onCancel() {
        getDataSetList();
      },
    });
  };

  useEffect(() => {
    getUserList();
    getDataSetList();
  }, []);

  const onChange = (pagination, filters, tempSorter) => {
    getDataSetList(pagination.current, {
      field: tempSorter.field,
      order: tempSorter.order || 'ascend',
    });
    setSorter({ field: tempSorter.field, order: tempSorter.order || 'ascend' });
  };

  return (
    <Style.Container>
      <div
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
          value={keyword}
          style={{
            marginRight: 10,
            width: 200,
          }}
          onChange={onChangeInput}
        />
        <Button
          id="test-button"
          style={{
            width: 200,
          }}
          onClick={showConfirm}
          type="primary"
          disabled={changeList.length === 0}
        >
          Save Data
        </Button>
      </div>
      <Style.DataSetTable
        columns={columns(
          memberList,
          handleChangeSelect,
          sorter,
          tableModal,
          approvalModal,
        )}
        dataSource={loading ? [] : tableList}
        pagination={{
          current: pagination.current,
          total: pagination.total,
          pageSize: 10,
          // onChange: onChangePage,
        }}
        onChange={onChange}
        showSizeChanger={false}
        scroll={{ y: '55vh' }}
        rowKey="guid"
        loading={loading}
      />
      <TableModal modal={tableModal} />
      <ApprovalModal modal={approvalModal} />
    </Style.Container>
  );
};

DataSetTable.propTypes = {};

DataSetTable.defaultProps = {};

export default DataSetTable;
