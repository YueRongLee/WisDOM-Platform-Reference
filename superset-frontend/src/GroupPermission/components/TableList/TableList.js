/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect } from 'react';
import moment from 'moment';
import { Divider, Table } from 'antd';
import { useQuery, useModal } from '~~hooks/';
import { UserApi } from '~~apis/';
import { DATE_TYPE, PREVIEW_STATUS } from '~~constants/index';
import DetailModal from '../MasterTableList/DetailModal';
import { getConstObject } from '../../../utils/common';

const columns = [
  {
    title: 'Group Name',
    dataIndex: 'groupName',
  },
  {
    title: 'User Name',
    dataIndex: 'owner',
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
    title: 'Update Time',
    dataIndex: 'createdAt',
    render: updateTime => moment(updateTime).format(DATE_TYPE.DATE_TIME),
  },
];

const TableList = ({ showDetail = true, hideData = [] }) => {
  const detailModal = useModal();
  const getNormalUserGroupsQuery = useQuery(UserApi.getNormalUserGroups);

  const getNormalUserGroups = async page => {
    try {
      await getNormalUserGroupsQuery.execForList(page);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getNormalUserGroups();
  }, []);

  useEffect(() => {
    getNormalUserGroups();
  }, [getNormalUserGroupsQuery.pagination.page]);

  return (
    <>
      <Divider orientation="left">Preview</Divider>
      {getNormalUserGroupsQuery.data.groupListData && (
        <Table
          {...getNormalUserGroups.tableProps}
          columns={columns.filter(item => !hideData.includes(item.dataIndex))}
          scroll={{ x: 'max-content' }}
          // pagination={false}
          rowKey="groupId"
          dataSource={getNormalUserGroupsQuery.data.groupListData}
          loading={getNormalUserGroupsQuery.loading}
          onRow={record => ({
            onClick: () => (showDetail ? detailModal.openModal(record) : null),
            style: { cursor: showDetail ? 'pointer' : 'auto' },
          })}
        />
      )}
      <DetailModal modal={detailModal} onFinish={getNormalUserGroups} />
    </>
  );
};

export default TableList;
