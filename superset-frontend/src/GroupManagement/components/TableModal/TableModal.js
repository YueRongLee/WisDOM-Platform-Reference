/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Table, Tooltip, Input } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import ConfirmModal from 'src/wisDOM/components/ConfirmModal/ConfirmModal';
import { useQuery, useModal } from '~~hooks/';
import { UserApi } from '~~apis/';
import { SYSTEM_TYPE } from '~~constants/index';

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
const { Search } = Input;

// const columns = (owner, deleteTable) => [
const columns = (owner, handleOpenModal) => [
  {
    title: 'Table Name',
    dataIndex: 'name',
  },
  {
    title: 'Type',
    dataIndex: 'type',
    render: type => (SYSTEM_TYPE.props[type] || {}).name || type,
  },
  {
    width: 112,
    render: row => (
      <>
        {String(owner).toLowerCase() ===
        String(bootstrap.user.emplId).toLowerCase() ? (
          <Tooltip
            placement="top"
            title={row.referenced ? 'referenced' : 'delete'}
          >
            <Button
              type="text"
              shape="circle"
              icon={<DeleteOutlined />}
              //   onClick={() => deleteTable(row)}
              onClick={() => handleOpenModal(row)}
              disabled={row.referenced}
            />
          </Tooltip>
        ) : null}
      </>
    ),
  },
];

const TableModal = ({ modal }) => {
  const [tableList, setTableList] = useState([]);
  const [totalPage, setTotalPage] = useState();
  const [groupId, setGroupId] = useState();
  const [owner, setOwner] = useState('');
  const [currentPage, setCurrent] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const getGroupTableQuery = useQuery(UserApi.getGroupTable);
  const deleteConfirmModal = useModal();

  const getGroupTable = async page => {
    try {
      const result = await getGroupTableQuery.execForList(page, {
        groupId: modal.modalData.groupId,
        keyword,
      });
      setCurrent(page);
      setTotalPage(result.pageInfo.total);
      setTableList(result.groupTablesInfo);
      setGroupId(modal.modalData.groupId);
      setOwner(modal.modalData.owner);
    } catch (e) {
      console.log(e);
    }
  };

  const onSearch = () => {
    getGroupTable(1);
  };

  const onChangeInput = e => {
    setKeyword(e.target.value);
  };

  const deleteTable = async row => {
    setLoading(true);
    try {
      const body = {
        groupId,
        tableName: row.name,
        type: row.type,
      };
      const result = await UserApi.deleteGroupTable(body);
      if (result === 1) {
        getGroupTable(1);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      modal.visible &&
      modal.modalData &&
      modal.modalData.groupId &&
      modal.modalData.owner
    ) {
      getGroupTable(getGroupTableQuery.pagination.page, '');
    }
  }, [modal.visible, modal.modalData, getGroupTableQuery.pagination.page]);

  useEffect(() => {
    if (groupId) {
      getGroupTable(1, '');
    }
  }, [groupId]);

  const handleBeforeLeave = () => {
    setTableList([]);
    modal.closeModal();
  };

  const handleDelete = () => {
    deleteTable(deleteConfirmModal.modalData.row);
    deleteConfirmModal.closeModal();
  };

  const handleOpenModal = data => {
    deleteConfirmModal.openModal({
      row: data,
    });
  };

  return (
    <>
      {/* <Modal
        title="Confirm Deletion"
        visible={deleteConfirmModal.visible}
        onOk={handleDelete}
        onCancel={deleteConfirmModal.closeModal}
        maskClosable={!loading}
        confirmLoading={loading}
        closable={!loading}
        cancelButtonProps={{ disabled: loading }}
        destroyOnClose
      >
        <p>Are you sure you want to delete ?</p>
      </Modal> */}
      <ConfirmModal
        modal={deleteConfirmModal}
        handleOK={handleDelete}
        loading={loading}
      />
      <Modal
        title={`Table List(${modal.modalData && modal.modalData.groupName})`}
        // visible={modal.visible && !deleteConfirmModal.visible}
        visible={modal.visible}
        bodyStyle={{
          maxHeight: '70vh',
          overflow: 'auto',
        }} // 高度自動,超過螢幕的70％就scroll
        onCancel={handleBeforeLeave}
        footer={
          <Button
            type="primary"
            onClick={handleBeforeLeave}
            disabled={getGroupTableQuery.isLoading}
          >
            Ok
          </Button>
        }
        width={900}
        destroyOnClose
        closable={!getGroupTableQuery.isLoading}
        maskClosable={!getGroupTableQuery.isLoading}
      >
        <>
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
              style={{ width: 200 }}
              onChange={onChangeInput}
            />
          </div>
          <Table
            {...getGroupTableQuery.tableProps}
            //   columns={columns(owner, deleteTable)}
            columns={columns(owner, handleOpenModal)}
            dataSource={getGroupTableQuery.isLoading ? [] : tableList}
            pagination={{ current: currentPage, total: totalPage }}
            scroll={{ y: 500 }}
            rowKey="guid"
            loading={getGroupTableQuery.isLoading}
          />
        </>
      </Modal>
    </>
  );
};

TableModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      columns: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
};

TableModal.defaultProps = {};

export default TableModal;
