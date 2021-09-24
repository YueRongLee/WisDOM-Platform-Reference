/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Table, Input, Button } from 'antd';
import moment from 'moment';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import ExpandInformation from './ExpandInformation';
import { ROLEPERMISSION } from '~~constants/index';
import { TableApi } from '~~apis/';

// const { Search } = Input;

const defaultPagination = {
  current: 1,
  pageSize: 10,
  total: 0,
};

// const defaultSorter = {
//   field: 'userName',
//   order: 'descend',
// };

const ApprovalModal = ({ modal }) => {
  const [dataSource, setDataSource] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState(defaultPagination);
  // const [searchKey, setSearchKey] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    reason: '',
    uuid: '',
  });

  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));
  const onChangeReason = e => {
    setConfirmModal({ ...confirmModal, reason: e.target.value });
  };

  const renderTime = record => {
    const { startDate, endDate, peirod } = record;
    if (startDate && endDate && peirod) {
      return `${moment(startDate).format('YYYY/MM/DD')} ~ ${moment(
        endDate,
      ).format('YYYY/MM/DD')} (${peirod})`;
    }
    return `--`;
  };

  const columns = [
    {
      title: 'Group Name',
      dataIndex: 'groupName',
      key: 'groupName',
      width: '20%',
    },
    {
      title: 'Applicant',
      dataIndex: 'userName',
      key: 'userName',
      width: '15%',
    },
    {
      title: 'Project',
      dataIndex: 'project',
      key: 'project',
      width: '15%',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: '20%',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      width: '15%',
      render: (value, record) => <div>{renderTime(record)}</div>,
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      width: '15%',
      render: (value, record) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {record.canDisable &&
          ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.setting.datasetMangement.disable.value,
          ) ? (
            <Button
              style={{ background: '#20a7c9', color: '#ffff' }}
              onClick={() =>
                setConfirmModal({
                  visible: true,
                  reason: '',
                  uuid: record.uuid,
                })
              }
            >
              Disable
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  const getTableList = async (tableName, page) => {
    try {
      setIsLoading(true);
      const payload = {
        pageQueryInfo: {
          page,
          pageSize: pagination.pageSize,
          // searchKey,
          // sorter: defaultSorter,
        },
        tableName,
      };

      const result = await TableApi.getApplicationList(payload);
      setDataSource(result.userAllow);
      setPagination({
        ...pagination,
        total: result.pageInfo.total,
        current: page,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const disablePermission = async () => {
    try {
      const payload = {
        disableReason: confirmModal.reason,
        uuid: confirmModal.uuid,
      };
      await TableApi.disableAllowed(payload);
      setConfirmModal({ visible: false, reason: '', uuid: '' });
      getTableList(modal.modalData.tableName, pagination.current);
    } catch (e) {
      console.log(e);
    }
  };

  const onChangePage = page => {
    setPagination({
      ...pagination,
      current: page,
    });
    getTableList(modal.modalData.tableName, page);
  };

  useEffect(() => {
    if (modal.visible) {
      getTableList(modal.modalData.tableName, 1);
    }
  }, [modal.visible]);

  return (
    <Modal
      title="Application Record"
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的70％就scroll
      onCancel={() => modal.closeModal()}
      footer={false}
      width={1100}
    >
      <>
        <Table
          rowKey={record => record.uuid}
          columns={columns}
          dataSource={dataSource}
          // scroll={{ x: 'max-content' }}
          pagination={{
            current: pagination.current,
            total: pagination.total,
            pageSize: 10,
            onChange: onChangePage,
          }}
          expandable={{
            expandedRowRender: record => <ExpandInformation record={record} />,
            expandIcon: ({ expanded, onExpand, record }) =>
              expanded ? (
                <CaretUpOutlined onClick={e => onExpand(record, e)} />
              ) : (
                <CaretDownOutlined onClick={e => onExpand(record, e)} />
              ),
          }}
          size="middle"
          loading={isLoading}
        />
      </>
      <Modal
        title="Please confirm"
        visible={confirmModal.visible}
        onOk={disablePermission}
        onCancel={() =>
          setConfirmModal({ visible: false, reason: '', uuid: '' })
        }
        okText="Disable"
        okButtonProps={{
          disabled: confirmModal.reason === '',
        }}
      >
        <p>{`Are you sure you want to disable the access permission of ${
          modal.visible && modal.modalData.tableName
        }`}</p>
        <p>
          <span style={{ color: 'red', marginRight: 5 }}>*</span>
          <span style={{ color: 'gray' }}>
            Type the reason to disable the access permission
          </span>
        </p>
        <Input
          style={{ marginTop: 5 }}
          placeholder="Text your reason"
          value={confirmModal.reason}
          onChange={e => onChangeReason(e)}
          maxLength={1000}
        />
      </Modal>
    </Modal>
  );
};

ApprovalModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape(),
  }).isRequired,
};

ApprovalModal.defaultProps = {};

export default ApprovalModal;
