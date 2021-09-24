/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal } from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { ROLE_MANAGEMENT_TYPE, ROLEPERMISSION } from '~~constants/index';
import CreateModal from './CreateModal/CreateModal';
import { RoleManagementApi } from '~~apis/';
import { useModal } from '~~hooks/';
import * as Style from './style';

const { confirm } = Modal;

const USER_LIST = [
  {
    userId: '001',
    userNameEn: 'Minny',
  },
  {
    userId: '002',
    userNameEn: 'Kai',
  },
  {
    userId: '003',
    userNameEn: 'Jason',
  },
];

const SystemRoleTable = () => {
  const [state, setState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [permissionList, setPermissionList] = useState();
  const [dataSource, setDataSource] = useState();
  let searchInput;
  const createModal = useModal();
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));

  const getRoleList = async () => {
    try {
      setLoading(true);

      let result = await RoleManagementApi.getRoleList(
        ROLE_MANAGEMENT_TYPE.SYSTEM_ROLE,
      );

      result = result.map(r => ({
        key: r.roleId,
        ...r,
      }));
      setDataSource(result);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getRolePermissonList = async () => {
    try {
      setLoading(true);

      const result = await RoleManagementApi.getRolePermissonList(
        ROLE_MANAGEMENT_TYPE.SYSTEM_ROLE,
      );
      setPermissionList(result);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  // const refresh = () => {
  //   getRoleList();
  // };

  const deleteRole = async roleId => {
    try {
      setLoading(true);
      await RoleManagementApi.deleteRole(roleId);
      getRoleList();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRoleList();
    getRolePermissonList();
  }, []);

  const showConfirm = record => {
    confirm({
      title: 'Delete Role',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete ${record.roleName} ?`,
      width: 520,
      onOk: async () => {
        deleteRole(record.roleId);
      },
      onCancel() {},
    });
  };

  const handleOpenModal = criteria => {
    createModal.openModal(criteria);
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
      title: 'Role Name',
      dataIndex: 'roleName',
      width: '25%',
      ...getColumnSearchProps('roleName'),
    },
    { title: 'Description', dataIndex: 'roleDesc', width: '45%' },
    {
      title: () => (
        <Style.ActionTitle>
          {SYSTEMLIST &&
          ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.setting.roleManagement.systemRole.create.value,
          ) ? (
            <Button
              type="primary"
              shape="circle"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal({ type: 'NEW' })}
            />
          ) : null}
        </Style.ActionTitle>
      ),
      dataIndex: '',
      width: '30%',
      render: (_, record) => (
        <Style.RenderAction>
          {SYSTEMLIST &&
          ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.setting.roleManagement.systemRole.view.value,
          ) ? (
            <Style.RenderActionButton
              type="text"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() =>
                handleOpenModal({
                  type: 'VIEW',
                  payload: record,
                  userList: USER_LIST.map(e => e.userNameEn),
                })
              }
            />
          ) : null}
          {SYSTEMLIST &&
          ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.setting.roleManagement.systemRole.edit.value,
          ) ? (
            <Style.RenderActionButton
              type="text"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() =>
                handleOpenModal({
                  type: 'EDIT',
                  payload: record,
                  userList: USER_LIST.map(e => e.userNameEn),
                })
              }
            />
          ) : null}
          {SYSTEMLIST &&
          ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.setting.roleManagement.systemRole.delete.value,
          ) ? (
            <Style.RenderActionButton
              type="text"
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => showConfirm(record)}
              disabled={!record.deletable}
            />
          ) : null}
        </Style.RenderAction>
      ),
    },
  ];

  // fake data
  // const roles = [
  //   {
  //     key: 1,
  //     name: 'System Administrator',
  //     description: 'System Owner',
  //   },
  //   {
  //     key: 2,
  //     name: 'System Operator',
  //     description: 'PIC of daily system operation',
  //   },
  //   {
  //     key: 3,
  //     name: 'System Stakeholder',
  //     description: 'User concern about blahblahblah... ',
  //   },
  //   { key: 4, name: 'System User', description: 'Basic User' },
  // ];

  return (
    <div className="data-role-table">
      <Table columns={columns} dataSource={dataSource} loading={loading} />
      <CreateModal
        modal={createModal}
        treeData={permissionList}
        refresh={getRoleList}
      />
    </div>
  );
};

export default SystemRoleTable;
