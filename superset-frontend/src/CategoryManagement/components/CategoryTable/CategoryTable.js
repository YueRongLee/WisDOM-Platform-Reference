/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
import {
  ExclamationCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Select, Modal, Button, Switch } from 'antd';
import { CategoryApi, UserApi } from '~~apis/';
import { ROLEPERMISSION } from '~~constants/index';
import TableModal from '../TableModal/TableModal';
import CreateModal from '../CreateModal/CreateModal';
import { useModal } from '~~hooks/';
import * as Style from './style';

const { Option } = Select;

const { confirm } = Modal;

const defaultPagination = {
  current: 1,
  pageSize: 10,
  total: 0,
};

const CategoryTable = () => {
  const [tableList, setTableList] = useState([]);
  const [changeList, setChangeList] = useState([]);
  const [memberList, setMemberList] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState(defaultPagination);

  const tableModal = useModal();
  const createModal = useModal();

  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));
  // const onChangeInput = e => {
  //   setKeyword(e.target.value);
  // };

  const columns = (list, handleChange, tableModal, enableCategory) => [
    {
      // title: 'Category',
      title: 'Data Domain',
      dataIndex: 'category',
      width: '60%',
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      width: '20%',
      render: (value, record) => (
        <Select
          showSearch
          value={value}
          style={{ width: 200 }}
          onChange={v => handleChange(v, record)}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          disabled={
            !ROLEPERMISSION.checkPermission(
              SYSTEMLIST,
              ROLEPERMISSION.setting.dataDomainManagement.edit.value,
            )
          }
        >
          {list.map(item => (
            <Option value={item.userId}>{item.userNameEn}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Enable',
      dataIndex: 'enabled',
      width: '10%',
      render: (value, record) => (
        <>
          <Switch
            checked={value}
            onChange={() => enableCategory(!value, record)}
            disabled={
              !ROLEPERMISSION.checkPermission(
                SYSTEMLIST,
                ROLEPERMISSION.setting.dataDomainManagement.edit.value,
              )
            }
          />
        </>
      ),
    },
    {
      title: 'Detail',
      dataIndex: 'Detail',
      width: '10%',
      render: (value, record) => (
        <>
          {ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.setting.dataDomainManagement.show.value,
          ) ? (
            <Button
              bsStyle="primary"
              onClick={() => tableModal.openModal(record.category)}
            >
              Show more
            </Button>
          ) : null}
        </>
      ),
    },
  ];

  const enableCategory = async (value, record) => {
    try {
      setLoading(true);
      const data = {
        category: record.category,
        enabled: value,
      };
      await CategoryApi.enableCategory(data);
      const tmpList = [...tableList].map(item => {
        if (item.category === record.category) {
          return {
            ...item,
            enabled: value,
          };
        }
        return { ...item };
      });
      setTableList(tmpList);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSelect = (value, record) => {
    const tempTableList = [...tableList].map(item => {
      if (item.categoryGroupName === record.categoryGroupName) {
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
        item => item.categoryGroupName !== record.categoryGroupName,
      );
      const temp = {
        userId: value,
        categoryGroupName: record.categoryGroupName,
      };
      setChangeList([...filterList, temp]);
    } else {
      const temp = {
        userId: value,
        categoryGroupName: record.categoryGroupName,
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

  const getDataSetList = async page => {
    try {
      setLoading(true);
      const payload = {
        page,
        pageSize: pagination.pageSize,
      };
      const result = await CategoryApi.getCategoryList(payload);
      setTableList(
        result.categoryInfo.map(item => ({
          ...item,
          owner: item.userProfile.userId,
        })),
      );
      setPagination({
        ...pagination,
        total: result.pageInfo.total,
        current: page || pagination.current,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setChangeList([]);
      setLoading(false);
    }
  };

  // const onSearch = () => {
  //   getDataSetList(1);
  // };

  const onChangePage = page => {
    setPagination({
      ...pagination,
      current: page,
    });
    getDataSetList(page);
  };

  const saveData = async () => {
    try {
      setLoading(true);
      const data = {
        changeOwnerInfo: changeList,
        pageInfo: {
          page: pagination.current,
          pageSize: 10,
        },
      };
      const result = await CategoryApi.changeOwner(data);
      setTableList(
        result.categoryInfo.map(item => ({
          ...item,
          owner: item.userProfile.userId,
        })),
      );
      setPagination({
        ...pagination,
        total: result.pageInfo.total,
        current: pagination.current,
      });
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

  const finishApply = () => {
    getDataSetList();
  };

  useEffect(() => {
    getUserList();
    getDataSetList();
  }, []);

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
        {/* <Search
          id="test-keyword"
          placeholder="input search text"
          onSearch={onSearch}
          value={keyword}
          style={{
            marginRight: 10,
            width: 200,
          }}
          onChange={onChangeInput}
        /> */}
        {ROLEPERMISSION.checkPermission(
          SYSTEMLIST,
          ROLEPERMISSION.setting.dataDomainManagement.add.value,
        ) ? (
          <PlusCircleOutlined
            style={{ fontSize: 20, marginRight: 10 }}
            onClick={() => createModal.openModal()}
          />
        ) : null}

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
          tableModal,
          enableCategory,
        )}
        dataSource={loading ? [] : tableList}
        pagination={{
          current: pagination.current,
          total: pagination.total,
          pageSize: 10,
          onChange: onChangePage,
        }}
        showSizeChanger={false}
        scroll={{ y: '60vh' }}
        rowKey="guid"
        loading={loading}
      />
      <TableModal modal={tableModal} />
      <CreateModal
        modal={createModal}
        memberList={memberList}
        finishApply={finishApply}
      />
    </Style.Container>
  );
};

CategoryTable.propTypes = {};

CategoryTable.defaultProps = {};

export default CategoryTable;
