/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Modal, Space, Button, Form, TreeSelect, Checkbox } from 'antd';
import { ROLE_MANAGEMENT_TYPE, HARD_CODE } from '~~constants/index';
import { UserManagementApi } from '~~apis';

const INITIAL_VALUE = {
  userId: '',
  name: '',
  email: '',
  isActive: false,
  systemRoles: [],
  dataRoles: [],
};

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};

const { TreeNode } = TreeSelect;

const UserActionModal = ({
  modal,
  roles,
  currentSelectUserDetail,
  setCurrentSelectUserDetail,
  refresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [modalValue, setModalValue] = useState(INITIAL_VALUE);
  const [userCannotDeleteRoles, setUserCannotDeleteRoles] = useState({});
  const [form] = Form.useForm();

  const handleCancel = () => {
    modal.closeModal();
    form.resetFields();
    setCurrentSelectUserDetail({});
  };

  const transformToRoleIds = ({ dataRoles, systemRoles }) => {
    const typeString = dataRoles
      ? ROLE_MANAGEMENT_TYPE.DATA_ROLES
      : ROLE_MANAGEMENT_TYPE.SYSTEM_ROLES;

    const roleIds = (dataRoles || systemRoles).map(roleName => {
      const { roleId } = roles[typeString].find(
        role => role.value === roleName,
      );
      return roleId;
    });
    return roleIds;
  };

  const editUser = async criteria => {
    const { userId, dataRoles, systemRoles } = criteria;
    try {
      setLoading(true);

      const dataRoleIds = transformToRoleIds({ dataRoles });
      const systemRoleIds = transformToRoleIds({ systemRoles });

      const roleIds = [...dataRoleIds, ...systemRoleIds];

      // 目前只能修改用戶的角色
      const payload = {
        userId,
        roleIds,
      };

      await UserManagementApi.updateUser(payload);

      handleCancel();
      refresh();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    const value = form.getFieldsValue();
    editUser(value);
  };

  const handleValueChange = changeValue => {
    const values = form.getFieldsValue();

    if (changeValue !== undefined) {
      const changeColumn = Object.keys(changeValue)[0];

      if (
        changeColumn === ROLE_MANAGEMENT_TYPE.SYSTEM_ROLES ||
        changeColumn === ROLE_MANAGEMENT_TYPE.DATA_ROLES
      ) {
        // 將不可刪除的角色加回
        const containCannotDeleteRoles = [
          ...userCannotDeleteRoles[changeColumn],
          ...Object.values(changeValue)[0].filter(
            value => !HARD_CODE.IS_NOT_DELETABLE_ROLE(value),
          ),
        ];

        // 過濾重複出現者
        const filteredDuplicate = [...new Set(containCannotDeleteRoles)];

        form.setFieldsValue({
          [changeColumn]: filteredDuplicate,
        });
      } else {
        form.setFieldsValue({
          [changeColumn]: Object.values(changeValue)[0],
        });
      }
    }
  };

  // 動態render EDIT, VIEW MODAL
  const renderModal = () => (
    <Modal
      title={modalValue.title}
      visible={modal.visible}
      onCancel={handleCancel}
      destroyOnClose
      footer={
        <>
          {modalValue.type === 'NEW' || modalValue.type === 'EDIT' ? (
            <Space align="end">
              <Button disabled={loading} onClick={handleCancel}>
                Cancel
              </Button>

              <Button loading={loading} type="primary" onClick={form.submit}>
                Confirm
              </Button>
            </Space>
          ) : null}
        </>
      }
      width={600}
      bodyStyle={{
        maxHeight: '60vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的75％就scroll
      closable={!loading}
      mask
      maskClosable={!loading}
    >
      <Form
        {...formItemLayout}
        form={form}
        name="userDetailForm"
        onFinish={handleFinish}
        scrollToFirstError
        onValuesChange={handleValueChange}
      >
        <Form.Item name="userId" label="User ID">
          <div>{currentSelectUserDetail.userId}</div>
        </Form.Item>
        <Form.Item name="name" label="Name">
          <div>{currentSelectUserDetail.userNameEn}</div>
        </Form.Item>
        <Form.Item name="email" label="E-mail">
          <div>{currentSelectUserDetail.email}</div>
        </Form.Item>
        <Form.Item name="isActive" valuePropName="checked" label="Is Active?">
          <Checkbox disabled>
            (Strongly recommend you to inactive the user name, instead of
            deleting it)
          </Checkbox>
        </Form.Item>
        <Form.Item
          name="systemRoles"
          label="systemRole(s)"
          rules={[{ required: true, message: 'SystemRole(s) is required' }]}
        >
          <TreeSelect
            disabled={modalValue.type === 'VIEW'}
            // treeData={roles.systemRoles}
            treeCheckable
            dropdownMatchSelectWidth
            placeholder={
              modalValue.type === 'VIEW' ? '' : 'Please select systemRole(s)'
            }
          >
            {roles.systemRoles?.map(role => {
              const { roleId, title, value } = role;

              const condition = HARD_CODE.IS_SYSTEM_USER(value);

              return (
                <TreeNode
                  key={value}
                  title={title}
                  value={value}
                  disableCheckbox={condition}
                />
              );
            })}
          </TreeSelect>
        </Form.Item>
        <Form.Item
          name="dataRoles"
          label="dataRole(s)"
          rules={[{ required: true, message: 'DataRole(s) is required' }]}
        >
          <TreeSelect
            disabled={modalValue.type === 'VIEW'}
            // treeData={roles.dataRoles}
            treeCheckable
            dropdownMatchSelectWidth
            placeholder={
              modalValue.type === 'VIEW' ? '' : 'Please select dataRole(s)'
            }
          >
            {roles.dataRoles?.map(role => {
              const { roleId, title, value } = role;

              const condition =
                HARD_CODE.IS_SYSTEM_ASSIGN_DATAROLE(value) ||
                HARD_CODE.IS_DATA_CITIZEN(value);

              return (
                <TreeNode
                  key={value}
                  title={title}
                  value={value}
                  disableCheckbox={condition}
                />
              );
            })}
          </TreeSelect>
        </Form.Item>
      </Form>
    </Modal>
  );

  const sortFunc = array => {
    array.sort((a, b) => a.roleId - b.roleId);
  };

  // 取得 user(by id) 所擁有的不可刪除的角色
  useEffect(() => {
    if (Object.keys(currentSelectUserDetail).length !== 0) {
      const dataRoles = [];
      const systemRoles = [];

      sortFunc(currentSelectUserDetail.dataRoles);
      sortFunc(currentSelectUserDetail.systemRoles);
      currentSelectUserDetail.dataRoles.forEach(role => {
        const { roleName } = role;

        if (
          HARD_CODE.IS_SYSTEM_ASSIGN_DATAROLE(roleName) ||
          HARD_CODE.IS_DATA_CITIZEN(roleName)
        ) {
          dataRoles.push(role.roleName);
        }
      });
      currentSelectUserDetail.systemRoles.forEach(role => {
        const { roleName } = role;

        if (HARD_CODE.IS_SYSTEM_USER(roleName)) {
          systemRoles.push(role.roleName);
        }
      });

      setUserCannotDeleteRoles({
        dataRoles,
        systemRoles,
      });
    }
  }, [currentSelectUserDetail]);

  const sortedRoles = roles => {
    const pushFrontItems = [];

    // 取出要排前的元素
    roles.forEach(role => {
      const { roleName } = role;

      if (
        HARD_CODE.IS_SYSTEM_USER(roleName) ||
        HARD_CODE.IS_DATA_CITIZEN(roleName) ||
        HARD_CODE.IS_SYSTEM_ASSIGN_DATAROLE(roleName)
      ) {
        pushFrontItems.push(role);
      }
    });

    sortFunc(pushFrontItems);

    // 原陣列過濾
    const newRoles = roles.filter(role => {
      const { roleName } = role;

      return (
        !HARD_CODE.IS_SYSTEM_USER(roleName) &&
        !HARD_CODE.IS_DATA_CITIZEN(roleName) &&
        !HARD_CODE.IS_SYSTEM_ASSIGN_DATAROLE(roleName)
      );
    });

    // concat 將兩陣列合併
    return pushFrontItems.concat(newRoles);
  };

  useEffect(() => {
    if (Object.keys(currentSelectUserDetail).length !== 0 && modal.modalData) {
      const { type } = modal.modalData;
      const {
        userId,
        name,
        email,
        isActive,
        systemRoles,
        dataRoles,
      } = currentSelectUserDetail;

      sortFunc(systemRoles);
      sortFunc(dataRoles);

      switch (type) {
        case 'VIEW':
          setModalValue({
            type,
            title: 'View User',
          });

          form.setFieldsValue({
            userId,
            isActive,
            // 轉換成 roleName 用於 Tree 顯示
            systemRoles: sortedRoles(systemRoles)?.map(role => role.roleName),
            dataRoles: sortedRoles(dataRoles)?.map(role => role.roleName),
          });
          break;
        case 'EDIT':
          setModalValue({
            type,
            title: 'Edit User',
          });

          form.setFieldsValue({
            userId,
            isActive,
            // 轉換成 roleName 用於 Tree 顯示
            systemRoles: sortedRoles(systemRoles)?.map(role => role.roleName),
            dataRoles: sortedRoles(dataRoles)?.map(role => role.roleName),
          });
          break;
        default:
          setModalValue(INITIAL_VALUE);
          break;
      }
    }
  }, [currentSelectUserDetail, modal.modalData]);

  return <>{renderModal()}</>;
};

export default UserActionModal;
