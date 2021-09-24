/* eslint-disable no-plusplus */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Input, Space, TreeSelect, Select } from 'antd';
import { RoleManagementApi } from '~~apis/';
import {
  ROLE_NAME_RULES,
  INPUT_RULES,
  ROLE_MANAGEMENT_TYPE,
} from '~~constants/index';
import './CreateModalStyle.less';
// import * as Style from './style';

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

const CreateModal = ({ modal, treeData, refresh }) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('NEW');
  const [form] = Form.useForm();
  const [deletable, setDeletable] = useState(false);

  const handleBeforeLeave = () => {
    form.resetFields();
    modal.closeModal();
  };

  const checkParentPageView = tempList => {
    const finalList = [...tempList];
    tempList.forEach(item => {
      for (let i = 0; i < item.split('_').length; i++) {
        let str = '';
        for (let l = 0; l < i; l++) {
          str += `${item.split('_')[l]}_`;
        }
        if (str) {
          finalList.push(`${str}PAGEVIEW`);
        }
      }
    });

    form.setFieldsValue({
      permission: finalList,
    });
  };

  const hangeValueChange = changeValue => {
    if (changeValue !== undefined) {
      const changeColumn = Object.keys(changeValue)[0];
      if (changeColumn === 'permission') {
        checkParentPageView(Object.values(changeValue)[0]);
      }
      if (changeColumn === 'name') {
        form.setFieldsValue({
          name: Object.values(changeValue)[0],
        });
      }
      if (changeColumn === 'description') {
        form.setFieldsValue({
          description: Object.values(changeValue)[0],
        });
      }
    }
  };

  const getRoleDetail = async data => {
    try {
      setLoading(true);
      const payLoad = {
        roleId: data.roleId,
        roleName: data.roleName,
        roleType: ROLE_MANAGEMENT_TYPE.SYSTEM_ROLE,
      };

      const result = await RoleManagementApi.getRoleDetail(payLoad);
      const tempUserList = result.userlist.map(
        user => `${user.userNameEn}(${user.userId})`,
      );
      form.setFieldsValue({
        name: result.roleName,
        description: result.roleDesc,
        permission: result.permission,
        userList: tempUserList,
      });
      setDeletable(result.deletable);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async data => {
    try {
      setLoading(true);

      const payLoad = {
        roleDesc: data.description,
        roleName: data.name,
        permission: data.permission,
        roleType: ROLE_MANAGEMENT_TYPE.SYSTEM_ROLE,
      };

      await RoleManagementApi.createRole(payLoad);
      handleBeforeLeave();
      refresh();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const editRole = async data => {
    try {
      setLoading(true);
      const payLoad = {
        roleId: modal.modalData.payload.roleId,
        roleDesc: data.description,
        roleName: data.name,
        permission: data.permission,
        roleType: ROLE_MANAGEMENT_TYPE.SYSTEM_ROLE,
      };

      await RoleManagementApi.updateRole(payLoad);
      handleBeforeLeave();
      refresh();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async data => {
    try {
      setLoading(true);
      if (type === 'NEW') {
        createRole(data);
      }

      if (type === 'EDIT') {
        editRole(data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modal.visible) {
      setType(modal.modalData.type);

      if (modal.modalData.type !== 'NEW') {
        getRoleDetail(modal.modalData.payload);
      }
    }
  }, [modal.visible]);

  return (
    <Modal
      className="createModal"
      title={`${type.substring(0, 1) + type.substring(1).toLowerCase()} Role`}
      visible={modal.visible}
      onCancel={handleBeforeLeave}
      footer={
        <>
          {type === 'NEW' || type === 'EDIT' ? (
            <Space align="end">
              <Button disabled={loading} onClick={handleBeforeLeave}>
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
      }} // 高度自動,超過螢幕的60％就scroll
      destroyOnClose
      closable={!loading}
      mask
      maskClosable={!loading}
    >
      <Form
        {...formItemLayout}
        form={form}
        name="create"
        onFinish={handleFinish}
        scrollToFirstError
        onValuesChange={hangeValueChange}
      >
        {() => (
          <>
            <Form.Item
              name="name"
              label="Role Name"
              rules={[
                {
                  required: true,
                  message: 'Role name is required',
                },
                {
                  pattern: ROLE_NAME_RULES.pattern,
                  message:
                    'Start with alphabet and accept only letters(A-Za-z), numbers(0-9), space and underline(_)',
                },
              ]}
            >
              <Input
                maxLength={INPUT_RULES.TABLE_NAME.value}
                disabled={type === 'VIEW' || (type !== 'NEW' && !deletable)}
                placeholder="Please input the role name"
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: 'Description is required',
                },
              ]}
            >
              <Input.TextArea
                autoSize={{ minRows: 4 }}
                placeholder="Please input the description"
                disabled={type === 'VIEW'}
              />
            </Form.Item>
            <Form.Item
              name="permission"
              label="Permission(s)"
              rules={[
                {
                  required: true,
                  message: 'Permission(s) is required',
                },
              ]}
            >
              <TreeSelect
                disabled={type === 'VIEW'}
                treeData={treeData}
                treeCheckable
                dropdownMatchSelectWidth
                placeholder="Please select permission(s)"
              />
            </Form.Item>
            {type !== 'NEW' ? (
              <Form.Item name="userList" label="User List">
                <Select mode="multiple" disabled />
              </Form.Item>
            ) : null}
          </>
        )}
      </Form>
    </Modal>
  );
};

CreateModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  onUploadExist: PropTypes.func,
};

CreateModal.defaultProps = {};

export default CreateModal;
