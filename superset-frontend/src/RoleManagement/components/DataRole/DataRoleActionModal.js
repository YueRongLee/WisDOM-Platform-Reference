/* eslint-disable no-plusplus */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-imports */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  List,
  TreeSelect,
  Space,
  Button,
  Select,
} from 'antd';
import ConfirmModal from 'src/wisDOM/components/ConfirmModal/ConfirmModal';
import { RoleManagementApi } from '~~apis/';
import * as Style from './style';
import {
  ROLE_NAME_RULES,
  INPUT_RULES,
  ROLE_MANAGEMENT_TYPE,
} from '~~constants/index';

// modal 初始值，由父元件點擊操作時更改
const INITIAL_VALUE = {
  type: '',
  title: '',
  value: '',
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

const DataRoleActionModal = ({
  modal,
  permissionList,
  currentSelectRoleDetail,
  refresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [modalValue, setModalValue] = useState(INITIAL_VALUE);
  const [form] = Form.useForm();

  // permission list pageView 權限邏輯
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

  const handleCancel = () => {
    modal.closeModal();
    form.resetFields();
  };

  const createRole = async criteria => {
    const { name, description, permission } = criteria;

    try {
      setLoading(true);

      const payload = {
        roleType: ROLE_MANAGEMENT_TYPE.DATA_ROLE,
        roleName: name,
        roleDesc: description,
        permission,
      };

      await RoleManagementApi.createRole(payload);

      handleCancel();
      refresh();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const editRole = async criteria => {
    const { name, description, permission } = criteria;
    const { roleId } = currentSelectRoleDetail;

    try {
      setLoading(true);

      const payload = {
        roleId,
        roleName: name,
        roleDesc: description,
        permission,
      };

      await RoleManagementApi.updateRole(payload);
      handleCancel();
      refresh();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      const value = form.getFieldsValue();

      if (modalValue.type === 'NEW') {
        createRole(value);
      }
      if (modalValue.type === 'EDIT') {
        editRole(value);
      }

      handleCancel();
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    } finally {
      setLoading(false);
    }
  };

  // 動態render NEW, EDIT, VIEW MODAL
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
        name="dataRoleForm"
        onFinish={handleFinish}
        scrollToFirstError
        onValuesChange={hangeValueChange}
      >
        <Form.Item
          name="name"
          label="Role Name"
          rules={[
            { required: true, message: 'Role name is required' },
            {
              pattern: ROLE_NAME_RULES.pattern,
              message:
                'Start with alphabet and accept only letters(A-Za-z), numbers(0-9), space and underline(_)',
            },
          ]}
        >
          <Input
            maxLength={INPUT_RULES.TABLE_NAME.value}
            disabled={
              modalValue.type === 'VIEW' ||
              (modalValue.type !== 'NEW' && !currentSelectRoleDetail.deletable)
            }
            placeholder={
              modalValue.type === 'VIEW' ? '' : 'Please input the role name'
            }
          />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Description is required' }]}
        >
          <Input.TextArea
            autoSize={{ minRows: 4 }}
            disabled={modalValue.type === 'VIEW'}
            placeholder={
              modalValue.type === 'VIEW' ? '' : 'Please input the description'
            }
          />
        </Form.Item>
        <Form.Item
          name="permission"
          label="Permission(s)"
          rules={[{ required: true, message: 'Permission(s) is required' }]}
        >
          <TreeSelect
            disabled={modalValue.type === 'VIEW'}
            treeData={permissionList}
            treeCheckable
            dropdownMatchSelectWidth
            placeholder={
              modalValue.type === 'VIEW' ? '' : 'Please select permission(s)'
            }
          />
        </Form.Item>
        {modalValue.type !== 'NEW' ? (
          <Form.Item name="userList" label="User List">
            <Select mode="multiple" disabled />
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  );

  useEffect(() => {
    if (currentSelectRoleDetail && modal.modalData) {
      const { type } = modal.modalData;
      const {
        roleId,
        roleName,
        roleDesc,
        roleType,
        permission,
        userlist,
      } = currentSelectRoleDetail;

      // 設置 Modal 內容與 form 內容 when dependencies: [modal] changed
      switch (type) {
        case 'NEW':
          setModalValue({
            type,
            title: 'New Role',
          });
          break;
        case 'VIEW':
          setModalValue({
            type,
            title: 'View Role',
          });

          form.setFieldsValue({
            name: roleName,
            description: roleDesc,
            userList: userlist?.map(
              user => `${user.userNameEn}(${user.userId})`,
            ),
            permission,
          });
          break;
        case 'EDIT':
          setModalValue({
            type,
            title: 'Edit Role',
          });

          form.setFieldsValue({
            name: roleName,
            description: roleDesc,
            userList: userlist?.map(
              user => `${user.userNameEn}(${user.userId})`,
            ),
            permission,
          });
          break;
        default:
          setModalValue(INITIAL_VALUE);
          break;
      }
    }
  }, [currentSelectRoleDetail, modal.modalData]);

  return <>{modal?.modalData?.type === 'DELETE' ? null : renderModal()}</>;
};

export default DataRoleActionModal;
