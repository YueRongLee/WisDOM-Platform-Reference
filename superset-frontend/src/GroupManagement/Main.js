/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Table, Space, Button, message } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import ReactGA from 'react-ga';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import ConfirmModal from 'src/wisDOM/components/ConfirmModal/ConfirmModal';
import { useModal, useQuery } from '~~hooks/';
import { UserApi } from '~~apis/';
import { PREVIEW_STATUS, GROUP_TYPE, ROLEPERMISSION } from '~~constants/index';
import { getConstObject } from '~~utils/common';
import { GroupModal, TableModal } from './components';
import setupApp from '../setup/setupApp';
import './MainStyle.less';

setupApp();

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));
const columns = ({ handleOpenModal, groupModal, tableModal }) => [
  {
    title: 'Group Name',
    dataIndex: 'groupName',
  },
  {
    title: 'Reason',
    dataIndex: 'reason',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    render: status => getConstObject(PREVIEW_STATUS, status).name,
  },
  {
    width: 112,
    title: () => (
      <div className="toolbar">
        <Button
          type="primary"
          shape="circle"
          icon={<PlusOutlined />}
          onClick={() => groupModal.openModal()}
          disabled={
            !ROLEPERMISSION.checkPermission(
              SYSTEMLIST,
              ROLEPERMISSION.setting.groupManagement.add.value,
            )
          }
        />
      </div>
    ),
    render: (value, row) => (
      <Space>
        <Button
          type="text"
          shape="circle"
          icon={<InfoCircleOutlined />}
          onClick={() => tableModal.openModal(row)}
          disabled={
            !ROLEPERMISSION.checkPermission(
              SYSTEMLIST,
              ROLEPERMISSION.setting.groupManagement.pageView.value,
            )
          }
        />
        <Button
          type="text"
          shape="circle"
          icon={<EditOutlined />}
          onClick={() => groupModal.openModal(row)}
          disabled={
            !ROLEPERMISSION.checkPermission(
              SYSTEMLIST,
              ROLEPERMISSION.setting.groupManagement.edit.value,
            )
          }
        />
        <Button
          type="text"
          shape="circle"
          icon={<DeleteOutlined />}
          onClick={() => handleOpenModal(row)}
          //   onClick={() => deleteConfirmModal.openModal(row)}
          disabled={
            row.owner.toLowerCase() !== bootstrap.user.emplId.toLowerCase() ||
            row.groupType === GROUP_TYPE.DEFAULT ||
            !ROLEPERMISSION.checkPermission(
              SYSTEMLIST,
              ROLEPERMISSION.setting.groupManagement.delete.value,
            )
          }
        />
      </Space>
    ),
  },
];

const Main = () => {
  const [deleteIsLoading, setDeleteIsLoading] = useState(false);

  const [groupList, setGroupList] = useState([]);
  const [totalPage, setTotalPage] = useState();
  const deleteConfirmModal = useModal();
  const groupModal = useModal();
  const tableModal = useModal();
  const { trackEvent } = useMatomo();
  const getGroupsQuery = useQuery(UserApi.getGroups);

  const getGroups = async () => {
    try {
      const result = await getGroupsQuery.execForList();
      setTotalPage(result.pageInfo.total);
      setGroupList(result.groupListData);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getGroups();
  }, []);

  useEffect(() => {
    getGroups();
  }, [getGroupsQuery.pagination.page]);

  const handleDelete = async () => {
    ReactGA.event({
      category: 'Group',
      action: 'Delete group',
    });
    trackEvent({
      category: 'Group',
      action: 'Delete group',
    });
    try {
      setDeleteIsLoading(true);
      await UserApi.deleteGroup(deleteConfirmModal.modalData.row.groupId);
      message.success('This group has been successfully deleted');
      getGroups();
      deleteConfirmModal.closeModal();
    } catch (e) {
      message.error(e.message);
    } finally {
      setDeleteIsLoading(false);
    }
  };

  const handleOpenModal = data => {
    deleteConfirmModal.openModal({
      row: data,
      showMsg: <p>Are you sure you want to delete {data.groupName}?</p>,
    });
  };

  return (
    <div className="group-management">
      <div className="ManaTitle">Group Management</div>
      <Table
        {...getGroupsQuery.tableProps}
        columns={columns({ handleOpenModal, groupModal, tableModal })}
        dataSource={groupList}
        scroll={{ x: 'max-content' }}
        pagination={{
          position: 'bottom',
          defaultPageSize: 10,
          total: totalPage,
          defaultCurrent: 1,
        }}
        rowKey="groupId"
      />
      {/* <Modal
        title="Confirm Deletion"
        visible={deleteConfirmModal.visible}
        onOk={handleDelete}
        onCancel={deleteConfirmModal.closeModal}
        maskClosable={!deleteIsLoading}
        confirmLoading={deleteIsLoading}
        closable={!deleteIsLoading}
        cancelButtonProps={{ disabled: deleteIsLoading }}
      >
        <p>
          Are you sure you want to delete{' '}
          {deleteConfirmModal.modalData &&
            deleteConfirmModal.modalData.groupName}
          ?
        </p>
      </Modal> */}
      <ConfirmModal
        modal={deleteConfirmModal}
        handleOK={handleDelete}
        loading={deleteIsLoading}
      />
      <GroupModal
        modal={groupModal}
        refresh={getGroups}
        userInfo={bootstrap.user}
        disabled={
          groupModal.modalData &&
          (groupModal.modalData.status !== PREVIEW_STATUS.ALLOWED.value ||
            groupModal.modalData.owner.toLowerCase() !==
              bootstrap.user.emplId.toLowerCase())
        }
      />
      <TableModal modal={tableModal} />
    </div>
  );
};

Main.propTypes = {};

Main.defaultProps = {};

export default Main;
