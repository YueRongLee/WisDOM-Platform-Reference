/* eslint-disable no-restricted-imports */
import React from 'react';
import { Table } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useModal } from '~~hooks/';
import GroupActionModal from './GroupActionModal';
import * as Style from './style';

// fake data
const roles = [
  {
    key: 1,
    name: 'Group Owner',
    description: 'Group Owner',
  },
  {
    key: 2,
    name: 'Group Member',
    description: 'Group Member',
  },
];

const DataRoleTable = () => {
  const actionModal = useModal();

  const columns = actionModal => [
    {
      title: 'Role Name',
      dataIndex: 'name',
      width: '35%',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: '35%',
    },
    {
      title: '',
      dataIndex: '',
      width: '30%',
      render: (value, record) => (
        <div style={{ float: 'right' }}>
          <Style.RenderActionButton
            type="text"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() =>
              actionModal.openModal({
                data: record,
                type: 'view',
              })
            }
          />
          <Style.RenderActionButton
            type="text"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() =>
              actionModal.openModal({
                data: record,
                type: 'edit',
              })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        dataSource={roles}
        columns={columns(actionModal)}
        rowKey="name"
        pagination={{
          position: 'bottom',
          defaultPageSize: 10,
        }}
        scroll={{ y: '40vh' }}
      />
      <GroupActionModal modal={actionModal} />
    </>
  );
};

export default DataRoleTable;
