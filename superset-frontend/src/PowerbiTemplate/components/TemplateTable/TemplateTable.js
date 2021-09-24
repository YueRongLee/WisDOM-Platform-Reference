/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, Tooltip } from 'antd';
import moment from 'moment';
import { ROLEPERMISSION } from '~~constants/index';
import { PowerBiTemplateApi } from '~~apis/';
import EditTemplateModal from '../EditTemplateModal/EditTemplateModal';
import ImportModal from '../ImportModal/ImportModal';
import InfoTemplateModal from '../InfoTemplateModal/InfoTemplateModal';
import { useModal } from '~~hooks/';
import * as Style from './style';

const { Search } = Input;

const { confirm } = Modal;

const defaultPagination = {
  current: 1,
  pageSize: 10,
  total: 0,
};

const TemplateTable = () => {
  const [tableList, setTableList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState(defaultPagination);
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));
  const editModal = useModal();
  const importModal = useModal();
  const infoTemplateModal = useModal();

  const isItemClick = ROLEPERMISSION.checkPermission(
    SYSTEMLIST,
    ROLEPERMISSION.dataApplicationTools.powerBITemplate.itemClick.value,
  );

  const onChangeInput = e => {
    setKeyword(e.target.value);
  };

  const columns = (editModal, showConfirm) => [
    {
      title: 'Name',
      dataIndex: 'templateName',
      width: '15%',
      render: (value, record) => (
        <div
          onClick={
            isItemClick ? () => infoTemplateModal.openModal(record) : () => {}
          }
          style={{ cursor: 'pointer' }}
        >
          {value}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'templateDescription',
      width: '15%',
      render: (value, record) => (
        <div
          onClick={
            isItemClick ? () => infoTemplateModal.openModal(record) : () => {}
          }
          style={{ cursor: 'pointer' }}
        >
          {value}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'public',
      width: '10%',
      render: (value, record) => (
        <div
          onClick={
            isItemClick ? () => infoTemplateModal.openModal(record) : () => {}
          }
          style={{ cursor: 'pointer' }}
        >
          {value ? (
            <span style={{ color: '#20a7c9' }}>Public</span>
          ) : (
            <span style={{ color: '#CB1B45' }}>Private</span>
          )}
        </div>
      ),
    },
    {
      title: 'Modified',
      dataIndex: 'lastUpdate',
      width: '15%',
      render: (value, record) => (
        <div
          onClick={
            isItemClick ? () => infoTemplateModal.openModal(record) : () => {}
          }
          style={{ cursor: 'pointer' }}
        >
          {moment(value).format('MM DD, YYYY, hh:mm:ss A')}
        </div>
      ),
    },
    {
      title: 'Created by',
      dataIndex: 'templateCreator',
      width: '20%',
      render: (value, record) => (
        <div
          onClick={
            isItemClick ? () => infoTemplateModal.openModal(record) : () => {}
          }
          style={{ cursor: 'pointer' }}
        >
          {value}
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: '15%',
      render: (value, record) => (
        <div>
          {record.owned ? (
            <>
              {ROLEPERMISSION.checkPermission(
                SYSTEMLIST,
                ROLEPERMISSION.dataApplicationTools.powerBITemplate.edit.value,
              ) ? (
                <Tooltip placement="top" title="Edit">
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<EditOutlined />}
                    onClick={() => editModal.openModal(record)}
                  />
                </Tooltip>
              ) : null}
              {ROLEPERMISSION.checkPermission(
                SYSTEMLIST,
                ROLEPERMISSION.dataApplicationTools.powerBITemplate.delete
                  .value,
              ) ? (
                <Tooltip placement="top" title="Delete">
                  <Button
                    style={{
                      color: '#fff',
                      background: 'tomato',
                      marginLeft: '10px',
                      border: '0px',
                    }}
                    shape="circle"
                    icon={<DeleteOutlined />}
                    onClick={() => showConfirm(record)}
                    disabled={record.isUsed}
                  />
                </Tooltip>
              ) : null}
            </>
          ) : null}
        </div>
      ),
    },
  ];

  const getTemplateList = async page => {
    try {
      setLoading(true);
      const payload = {
        page,
        pageSize: pagination.pageSize,
        searchKey: keyword,
      };
      const result = await PowerBiTemplateApi.getPowerBiTemplate(payload);
      setTableList(result.templateList);
      setPagination({
        ...pagination,
        total: result.pageInfo.total,
        current: page || pagination.current,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    getTemplateList(1);
  };

  const onSearch = () => {
    getTemplateList(1);
  };

  const onChangePage = page => {
    setPagination({
      ...pagination,
      current: page,
    });
    getTemplateList(page);
  };
  const showConfirm = record => {
    confirm({
      title: `Are you sure you want to delete ${record.templateName}?`,
      icon: <ExclamationCircleOutlined />,
      // content: 'Some descriptions',
      onOk: async () => {
        const payload = {
          templateId: record.templateId,
        };
        await PowerBiTemplateApi.deletePowerBiTemplate(payload);
        getTemplateList(1);
      },
      onCancel() {},
    });
  };
  useEffect(() => {
    // getUserList();
    getTemplateList(1);
  }, []);

  return (
    <Style.Container>
      <div
        className="DataSetTable"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
        <>
          {ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.dataApplicationTools.powerBITemplate.create.value,
          ) ? (
            <Button
              id="test-button"
              icon={<PlusCircleOutlined />}
              style={{
                width: 200,
              }}
              onClick={() => importModal.openModal()}
              type="primary"
            >
              Power BI Template
            </Button>
          ) : null}
        </>
      </div>
      <div style={{ height: '68vh', overflowY: 'scroll' }}>
        <Style.DataSetTable
          columns={columns(editModal, showConfirm)}
          dataSource={loading ? [] : tableList}
          pagination={{
            current: pagination.current,
            total: pagination.total,
            pageSize: 10,
            onChange: onChangePage,
          }}
          showSizeChanger={false}
          // scroll={{ y: '60vh' }}
          rowKey="guid"
          loading={loading}
          // onRow={(record, idx) => ({
          //   onClick: () => infoTemplateModal.openModal(record, idx), // click row
          //   style: { cursor: 'pointer' },
          // })}
        />
      </div>
      <InfoTemplateModal modal={infoTemplateModal} />
      <ImportModal modal={importModal} refresh={refresh} />
      <EditTemplateModal modal={editModal} refresh={refresh} />
    </Style.Container>
  );
};

TemplateTable.propTypes = {};

TemplateTable.defaultProps = {};

export default TemplateTable;
