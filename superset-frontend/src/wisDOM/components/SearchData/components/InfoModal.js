/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Modal, Table, Tooltip, Space, Button, DatePicker } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useQuery } from '~~hooks/';
import { TableApi } from '~~apis/';
import { DATE_TYPE, BLOCKCHAIN_STATUS } from '~~constants/index';
import AppConfig from '~~config/';
import ethereum from '../../../../../images/ethereum.svg';

const { RangePicker } = DatePicker;

const columns = () => [
  {
    title: 'Time',
    dataIndex: 'timestamp',
    width: 180,
    key: 'timestamp',
    render: timestamp => moment(timestamp).format(DATE_TYPE.DATE_TIME),
  },
  {
    title: 'Raw Data',
    align: 'center',
    render: (value, row) =>
      row &&
      row.status === BLOCKCHAIN_STATUS.VERIFY_OK && (
        <div className="blockchaincircle" key={row.uuid}>
          <a
            href={`${AppConfig.itmUrl}/binary/origin/${row.clearanceOrder}/${row.indexValue}`}
          >
            <DownloadOutlined />
          </a>
        </div>
      ),
  },
  {
    title: 'Status',
    align: 'center',
    render: (value, row) =>
      row && (
        <Tooltip placement="bottom" title={row.status}>
          <div
            className={`blockchainstatus ${
              row && row.status === BLOCKCHAIN_STATUS.VERIFY_OK
                ? 'verifyok'
                : ''
            }`}
          />
        </Tooltip>
      ),
  },
  {
    title: 'On-Chain',
    align: 'center',
    render: (value, row) =>
      row &&
      row.status === BLOCKCHAIN_STATUS.VERIFY_OK && (
        <div className="blockchaincircle">
          <a
            href={`${AppConfig.itmUrl}/etherscan/${row.clearanceOrder}`}
            target="_blank"
            rel="noreferrer"
          >
            <img src={ethereum} alt="" />
          </a>
        </div>
      ),
  },
  {
    title: 'Off-Chain',
    align: 'center',
    render: (value, row) =>
      row &&
      row.status === BLOCKCHAIN_STATUS.VERIFY_OK && (
        <div className="blockchaincircle">
          <a
            href={`${AppConfig.itmUrl}/verificationProof/${row.clearanceOrder}/${row.indexValue}`}
          >
            <DownloadOutlined />
          </a>
        </div>
      ),
  },
];

const InfoModal = ({ modal }) => {
  const [dates, setDates] = useState([]);
  const [infoList, setInfoList] = useState([]);

  const getTableOnChainStatusListQuery = useQuery(
    TableApi.getTableOnChainStatusList,
  );

  const handleBeforeLeave = () => {
    modal.closeModal();
  };

  const getTableOnChainStatusList = async page => {
    try {
      const result = await getTableOnChainStatusListQuery.execForList(page, {
        tableName: modal.modalData.name,
        startAt:
          dates.length !== 0
            ? dates[0].valueOf()
            : moment().add(-30, 'days').valueOf(),
        endAt: dates.length !== 0 ? dates[1].valueOf() : moment().valueOf(),
      });
      setInfoList(result);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (modal.visible && modal.modalData) {
      getTableOnChainStatusList();
    }
  }, [modal.visible, modal.modalData]);

  useEffect(() => {
    if (modal.visible && modal.modalData) {
      getTableOnChainStatusList();
    }
  }, [getTableOnChainStatusListQuery.pagination.page]);

  useEffect(() => {
    if (modal.visible && modal.modalData) {
      getTableOnChainStatusList();
    }
  }, [dates]);

  return (
    <Modal
      className="InfoModal"
      title={modal.modalData && modal.modalData.name}
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的70％就scroll
      onCancel={handleBeforeLeave}
      width={1100}
      footer={
        <Space align="end">
          <Button
            data-test="beforeLeave"
            type="primary"
            onClick={handleBeforeLeave}
          >
            Ok
          </Button>
        </Space>
      }
      closable={!getTableOnChainStatusListQuery.isLoading}
      maskClosable={!getTableOnChainStatusListQuery.isLoading}
    >
      <RangePicker
        defaultValue={[
          moment(moment().add(-30, 'days'), DATE_TYPE.DATE),
          moment(moment(), DATE_TYPE.DATE),
        ]}
        format={DATE_TYPE.DATE}
        style={{ marginBottom: '20px' }}
        onChange={value => {
          setDates(value.valueOf());
        }}
      />
      <Table
        {...getTableOnChainStatusListQuery.tableProps}
        columns={columns()}
        dataSource={getTableOnChainStatusListQuery.isLoading ? [] : infoList}
        rowkey="uuid"
        scroll={{ y: 500 }}
      />
    </Modal>
  );
};

InfoModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
};

InfoModal.defaultProps = {};

export default InfoModal;
