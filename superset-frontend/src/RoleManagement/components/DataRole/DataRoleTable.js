/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal } from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useModal } from '~~hooks';
import { RoleManagementApi } from '~~apis';
import { ROLE_MANAGEMENT_TYPE, ROLEPERMISSION } from '~~constants/index';
import DataRoleActionModal from './DataRoleActionModal';
import * as Style from './style';

const DataRoleTable = () => {
  let searchInput;
  const [state, setState] = useState([]); // 用於欄位 fuzzy search
  const [roleList, setRoleList] = useState([]);
  const [loading, setLoading] = useState(false); // Table 等待資料
  const [permissionList, setPermissionList] = useState();
  const [currentSelectRoleDetail, setCurrentSelectRoleDetail] = useState({}); // 當前點擊的角色列
  const dataRoleActionModal = useModal();
  const { confirm } = Modal;

  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));

  const getRoles = async () => {
    try {
      setLoading(true);
      let roles = await RoleManagementApi.getRoleList(
        ROLE_MANAGEMENT_TYPE.DATA_ROLE,
      );
      // Warning: Each child in a list should have a unique "key" prop.
      roles = roles.map(role => {
        const { deletable, enable, roleDesc, roleId, roleName, type } = role;
        return {
          type,
          key: roleId,
          name: roleName,
          description: roleDesc,
          deletable,
          enable,
        };
      });

      setRoleList(roles);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getRolePermissons = async () => {
    try {
      setLoading(true);
      const result = await RoleManagementApi.getRolePermissonList(
        ROLE_MANAGEMENT_TYPE.DATA_ROLE,
      );
      setPermissionList(result);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRoles();
    getRolePermissons();
  }, []);

  // 根據 roleId 取得細節資訊
  const getRoleDetail = async roleId => {
    try {
      setLoading(true);
      const result = await RoleManagementApi.getRoleDetail({
        roleId,
      });
      setCurrentSelectRoleDetail(result);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = criteria => {
    const { payload } = criteria;
    // NEW 的沒有 payload
    if (payload) {
      getRoleDetail(payload.key);
    }
    dataRoleActionModal.openModal(criteria);
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

  // 欄位 fuzzy search
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

  const showDeleteConfirmModal = async criteria => {
    confirm({
      title: 'Delete Role',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete ${criteria.name} ?`,
      width: 600,
      onOk: async () => {
        try {
          setLoading(true);
          await RoleManagementApi.deleteRole(criteria.key);
          getRoles();
        } catch (e) {
          console.log(e);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      width: '25%',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: '45%',
    },
    {
      dataIndex: '',
      width: '30%',
      title: () => (
        <Style.ActionTitle>
          {SYSTEMLIST &&
          ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.setting.roleManagement.dataRole.create.value,
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
      render: (_, record) => (
        <Style.RenderAction>
          {SYSTEMLIST &&
          ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.setting.roleManagement.dataRole.view.value,
          ) ? (
            <Style.RenderActionButton
              type="text"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() =>
                handleOpenModal({
                  type: 'VIEW',
                  payload: {
                    ...record,
                  },
                })
              }
            />
          ) : null}
          {SYSTEMLIST &&
          ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.setting.roleManagement.dataRole.edit.value,
          ) ? (
            <Style.RenderActionButton
              type="text"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() =>
                handleOpenModal({
                  type: 'EDIT',
                  payload: {
                    ...record,
                  },
                })
              }
            />
          ) : null}
          {SYSTEMLIST &&
          ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.setting.roleManagement.dataRole.delete.value,
          ) ? (
            <Style.RenderActionButton
              type="text"
              shape="circle"
              icon={<DeleteOutlined />}
              disabled={!record.deletable}
              onClick={() => showDeleteConfirmModal(record)}
            />
          ) : null}
        </Style.RenderAction>
      ),
    },
  ];

  return (
    <div id="data-role-table">
      <Table
        pagination={{
          position: 'bottom',
          defaultPageSize: 10,
          defaultCurrent: 1,
        }}
        columns={columns}
        dataSource={roleList}
        loading={loading}
      />
      <DataRoleActionModal
        modal={dataRoleActionModal}
        permissionList={permissionList}
        currentSelectRoleDetail={currentSelectRoleDetail}
        refresh={getRoles}
      />
    </div>
  );
};

export default DataRoleTable;
