/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Table, Input, Button } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';

import {
  ROLE_MANAGEMENT_TYPE,
  ROLEPERMISSION,
  HARD_CODE,
} from '~~constants/index';
import { UserManagementApi, RoleManagementApi } from '~~apis';
// import { RoleManagementApi } from 'src/apis';
import { useModal } from '~~hooks';
import UserActionModal from './UserActionModal';
import * as Style from './style';

const { Search } = Input;

const DEFAULT_PAGINATE = {
  current: 1,
  pageSize: 10,
  total: 0,
};

const DEFAULT_SORT = {
  field: 'userId',
  order: 'ascend',
};

const UserTable = () => {
  // 自定義 hook
  const userActionModal = useModal();

  // 儲存 API user list results
  const [userList, setUserList] = useState([]);
  // 當前點擊的 user 列
  const [currentSelectUserDetail, setCurrentSelectUserDetail] = useState({});
  // modal 下拉選單
  const [roles, setRoles] = useState({});
  // Table 等待資料 loading
  const [loading, setLoading] = useState(false);
  // 模糊搜尋 keyword
  const [keyword, setKeyword] = useState('');
  // // Table 分頁
  const [paginate, setPaginate] = useState(DEFAULT_PAGINATE);
  // // Table sort 排序
  const [sort, setSort] = useState(DEFAULT_SORT);

  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));

  // 取得 user 分頁
  const getUsers = async (criteria = {}) => {
    // Table change 值變
    const { pagination, sorter } = criteria;
    try {
      setLoading(true);
      const payload = {
        searchKey: keyword,
        page: pagination || paginate.current,
        pageSize: paginate.pageSize,
        sorter: sorter || sort,
      };
      const result = await UserManagementApi.getUserList(payload);
      // Warning: Each child in a list should have a unique "key" prop.
      // api 回傳分頁user
      const { pageInfo, userProfileRoles } = result;
      const users = userProfileRoles.map(user => ({
        ...user,
        key: user.userId,
        // 布林無法顯示在 Table，需轉字串
        isActive: user.isActive.toString(),
      }));
      setUserList(users);
      setPaginate(prev => ({
        ...prev,
        total: pageInfo.total,
        current: pagination || paginate.current,
      }));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const sortFunc = array => {
    array.sort((a, b) => a.roleId - b.roleId);
  };

  // 用於 modal 的 dataRole, systemRole 下拉選單treeSelect
  const getRoles = async type => {
    try {
      setLoading(true);

      const roles = await RoleManagementApi.getRoleList(type);

      if (roles[0].type === ROLE_MANAGEMENT_TYPE.SYSTEM_ROLE) {
        // 取出 system user 另存陣列，排序用
        const pushBehindItems = [];

        // 取出要排後的元素
        roles.forEach(role => {
          const { roleName } = role;
          if (HARD_CODE.IS_SYSTEM_USER(roleName)) {
            pushBehindItems.push(role);
          }
        });

        sortFunc(pushBehindItems);
        // 原陣列過濾 system user, 再將排後的元素用 concat 接在後方
        const newRoles = roles
          .filter(role => !HARD_CODE.IS_SYSTEM_USER(role.roleName))
          .concat(pushBehindItems);

        setRoles(prevRoles => ({
          ...prevRoles,
          systemRoles: newRoles.map(role => {
            const { roleName } = role;
            if (HARD_CODE.IS_SYSTEM_USER(roleName)) {
              return {
                roleId: role.roleId,
                title: `${role.roleName}  (default)`,
                value: role.roleName,
              };
            }
            return {
              roleId: role.roleId,
              title: role.roleName,
              value: role.roleName,
            };
          }),
        }));
      }
      if (roles[0].type === ROLE_MANAGEMENT_TYPE.DATA_ROLE) {
        // 取出 data citizen, data owner, data domain owner, data steward 另存陣列，排序用
        const pushBehindItems = [];

        // 取出要排後的元素
        roles.forEach(role => {
          const { roleName } = role;
          if (
            HARD_CODE.IS_SYSTEM_ASSIGN_DATAROLE(roleName) ||
            HARD_CODE.IS_DATA_CITIZEN(roleName)
          ) {
            pushBehindItems.push(role);
          }
        });

        // 原陣列過濾 指定items, 再將排後的元素用 concat 接在後方
        sortFunc(pushBehindItems);
        const newRoles = roles
          .filter(role => {
            const { roleName } = role;

            return (
              !HARD_CODE.IS_SYSTEM_ASSIGN_DATAROLE(roleName) &&
              !HARD_CODE.IS_DATA_CITIZEN(roleName)
            );
          })
          .concat(pushBehindItems);

        setRoles(prevRoles => ({
          ...prevRoles,
          dataRoles: newRoles.map(role => {
            const { roleName } = role;
            if (HARD_CODE.IS_DATA_CITIZEN(roleName)) {
              return {
                roleId: role.roleId,
                title: `${role.roleName}  (default)`,
                value: role.roleName,
              };
            }
            if (HARD_CODE.IS_SYSTEM_ASSIGN_DATAROLE(roleName)) {
              return {
                roleId: role.roleId,
                title: `${role.roleName}  (system assign only)`,
                value: role.roleName,
              };
            }
            return {
              roleId: role.roleId,
              title: role.roleName,
              value: role.roleName,
            };
          }),
        }));
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();

    getRoles(ROLE_MANAGEMENT_TYPE.SYSTEM_ROLE);
    getRoles(ROLE_MANAGEMENT_TYPE.DATA_ROLE);
  }, []);

  // 根據 userId 取得細節資訊
  const getUserDetail = async criteria => {
    const { userId } = criteria;
    try {
      setLoading(true);

      const result = await UserManagementApi.getUserDetail(userId);

      setCurrentSelectUserDetail(result);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = criteria => {
    const { payload } = criteria;

    getUserDetail(payload);

    userActionModal.openModal(criteria);
  };

  const columns = sorter => [
    {
      title: 'User Id',
      dataIndex: 'userId',
      sortOrder: sorter.field === 'userId' && sorter.order,
      sorter: true,
      width: '20%',
    },
    {
      title: 'Name',
      dataIndex: 'userNameEn',
      sortOrder: sorter.field === 'userNameEn' && sorter.order,
      sorter: true,
      width: '25%',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sortOrder: sorter.field === 'email' && sorter.order,
      sorter: true,
      width: '25%',
    },
    {
      title: 'Is Active?',
      dataIndex: 'isActive',
      sortOrder: sorter.field === 'isActive' && sorter.order,
      sorter: true,
      width: '15%',
    },
    {
      dataIndex: '',
      width: '15%',
      render: (_, record) => (
        <Style.RenderAction>
          {SYSTEMLIST &&
          ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.setting.userManagement.view.value,
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
            ROLEPERMISSION.setting.userManagement.edit.value,
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
        </Style.RenderAction>
      ),
    },
  ];

  // 搜尋框 執行搜尋時
  const onSearch = () => {
    getUsers();
  };

  // 搜尋框 變動時設值
  const onChangeInput = e => {
    setKeyword(e.target.value);
  };

  const onTableChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const { field, order } = sorter;

    getUsers({
      pagination: current,
      sorter: { field, order: order || 'ascend' },
    });

    setSort({ field, order: order || 'ascend' });
  };

  return (
    <div id="user-table">
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
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
      <Table
        pagination={paginate}
        columns={columns(sort)}
        dataSource={userList}
        loading={loading}
        // 分頁、排序、過濾變化時觸發
        onChange={onTableChange}
      />
      <UserActionModal
        modal={userActionModal}
        roles={roles}
        currentSelectUserDetail={currentSelectUserDetail}
        setCurrentSelectUserDetail={setCurrentSelectUserDetail}
        refresh={getUsers}
      />
    </div>
  );
};
export default UserTable;
