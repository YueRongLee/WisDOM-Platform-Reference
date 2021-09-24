/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
  Modal,
  Table,
  Upload,
  Button,
  Space,
  Progress,
  Tooltip,
  message,
} from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import ReactGA from 'react-ga';
import { useQuery } from '~~hooks/';
import { UserApi, EvidenceApi } from '~~apis/';
import { DATE_TYPE, ACTION_TYPE, BLOCKCHAIN_STATUS } from '~~constants/index';
import AppConfig from '~~config/';
import ethereum from '../../../../images/ethereum.svg';

const FILE_SIZE = 10; // MB

const INIT_LOADING_ROW = { uuid: undefined, percent: 0 };

const HistoryModal = ({ modal }) => {
  const [historyList, setHistoryList] = useState([]);
  const [uploadingRow, setUploadingRow] = useState({ ...INIT_LOADING_ROW });
  const getUploadHistoryQuery = useQuery(UserApi.getUploadHistory);
  const { trackEvent } = useMatomo();

  const handleDownloadRecord = item => {
    ReactGA.event({
      category: 'History',
      action: `blockchain ${item} download`,
    });
    trackEvent({
      category: 'History',
      action: `blockchain ${item} download`,
    });
  };

  const handleUploadRecord = () => {
    ReactGA.event({
      category: 'History',
      action: 'blockchain check upload',
    });
    trackEvent({
      category: 'History',
      action: 'blockchain check upload',
    });
  };

  const columns = ({
    handleBeforeUpload,
    handleListChange,
    handleChange,
    uploadingRow,
    setUploadingRow,
  }) => [
    {
      title: 'Time',
      dataIndex: 'uploadTime',
      width: 180,
      render: uploadTime => moment(uploadTime).format(DATE_TYPE.DATE_TIME),
    },
    {
      title: 'File',
      dataIndex: 'originalName',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 110,
      render: action => action && ACTION_TYPE[action].name,
    },
    {
      title: 'Status',
      align: 'center',
      render: (value, row) =>
        row.blockchainInfo && (
          <Tooltip placement="bottom" title={row.blockchainInfo.status}>
            <div
              className={`blockchainstatus ${
                row.blockchainInfo &&
                row.blockchainInfo.status === BLOCKCHAIN_STATUS.VERIFY_OK
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
        row.blockchainInfo &&
        row.blockchainInfo.status === BLOCKCHAIN_STATUS.VERIFY_OK && (
          <div className="blockchaincircle">
            <a
              href={`${AppConfig.itmUrl}/etherscan/${row.blockchainInfo.clearanceOrder}`}
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
        row.blockchainInfo &&
        row.blockchainInfo.status === BLOCKCHAIN_STATUS.VERIFY_OK && (
          <div className="blockchaincircle">
            <a
              href={`${AppConfig.itmUrl}/verificationProof/${row.blockchainInfo.clearanceOrder}/${row.blockchainInfo.indexValue}`}
            >
              <DownloadOutlined
                data-test="Off-Chain"
                onClick={() => handleDownloadRecord('Off-Chain')}
              />
            </a>
          </div>
        ),
    },
    {
      title: 'Check',
      align: 'center',
      render: (value, row) =>
        row.blockchainInfo &&
        row.blockchainInfo.status === BLOCKCHAIN_STATUS.VERIFY_OK && (
          <Upload
            name="file"
            beforeUpload={handleBeforeUpload}
            onChange={handleChange}
            multiple={false}
            showUploadList={false}
            customRequest={({ file, onSuccess, onError }) => {
              handleListChange(row.uuid, 'verifyStatus', undefined);
              const config = {
                onUploadProgress: progressEvent => {
                  const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total,
                  );
                  setUploadingRow({
                    uuid: row.uuid,
                    percent: percentCompleted,
                  });
                },
              };
              const proofUrl = `${AppConfig.itmUrl}/verificationProof/${row.blockchainInfo.clearanceOrder}/${row.blockchainInfo.indexValue}`;
              EvidenceApi.verify(file, proofUrl, config).then(
                result => {
                  onSuccess({ row, result }, file);
                },
                () => {
                  handleListChange(row.uuid, 'verifyStatus', false);
                  onError();
                },
              );
            }}
            accept=".json, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          >
            <div className="blockchaincircle">
              <a href="#">
                <UploadOutlined
                  data-test="uploadOutlined"
                  onClick={() => handleUploadRecord()}
                />
              </a>
            </div>
          </Upload>
        ),
    },
    {
      title: 'Raw Data',
      align: 'center',
      render: (value, row) =>
        row.blockchainInfo &&
        row.blockchainInfo.status === BLOCKCHAIN_STATUS.VERIFY_OK && (
          <div className="blockchaincircle">
            <a
              href={`${AppConfig.itmUrl}/binary/origin/${row.blockchainInfo.clearanceOrder}/${row.blockchainInfo.indexValue}`}
            >
              <DownloadOutlined
                data-test="downloadRecord"
                onClick={() => handleDownloadRecord('Raw Data')}
              />
            </a>
          </div>
        ),
    },
    {
      title: 'verify',
      dataIndex: 'verifyStatus',
      align: 'center',
      render: (verifyStatus, row) =>
        (verifyStatus !== undefined || uploadingRow.uuid === row.uuid) && (
          <Progress
            type="circle"
            width={40}
            percent={verifyStatus === undefined ? uploadingRow.percent : 100}
            status={
              verifyStatus === undefined
                ? 'active'
                : verifyStatus
                ? 'success'
                : 'exception'
            }
          />
        ),
    },
  ];

  const getUploadHistory = async page => {
    try {
      const result = await getUploadHistoryQuery.execForList(page, {
        tableName: modal.modalData,
      });
      setHistoryList(result.histories);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (modal.visible && modal.modalData) {
      ReactGA.event({
        category: 'History',
        action: 'View table upload data history',
      });
      trackEvent({
        category: 'History',
        action: 'View table upload data history',
      });
      getUploadHistory();
    }
  }, [modal.visible, modal.modalData]);

  useEffect(() => {
    if (modal.visible && modal.modalData) {
      getUploadHistory();
    }
  }, [getUploadHistoryQuery.pagination.page]);

  const handleBeforeLeave = () => {
    modal.closeModal();
  };

  const handleBeforeUpload = file => {
    // 限制大小為10MB
    const isLimit = file.size / 1024 / 1024 < FILE_SIZE;
    if (!isLimit) {
      message.error(`The file size upload limit is ${FILE_SIZE} MB`);
    }
    // eslint-disable-next-line no-param-reassign
    file.isLimit = isLimit;
    return isLimit;
  };

  const handleListChange = (uuid, prop, value) => {
    const nextList = [].concat(historyList);
    const idx = nextList.findIndex(item => item.uuid === uuid);
    if (idx !== -1) {
      nextList[idx][prop] = value;
      setHistoryList(nextList);
    }
  };

  const handleChange = info => {
    if (info.file.status === 'done') {
      handleListChange(
        info.file.response.row.uuid,
        'verifyStatus',
        info.file.response.result,
      );
      setUploadingRow({ ...INIT_LOADING_ROW });
    } else if (info.file.status === 'error') {
      setUploadingRow({ ...INIT_LOADING_ROW });
    }
  };

  return (
    <Modal
      className="historyModal"
      title={`Upload History(${modal.modalData})`}
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的70％就scroll
      onCancel={handleBeforeLeave}
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
      width={1100}
      destroyOnClose
      closable={!getUploadHistoryQuery.isLoading}
      maskClosable={!getUploadHistoryQuery.isLoading}
    >
      <Table
        {...getUploadHistoryQuery.tableProps}
        columns={columns({
          handleBeforeUpload,
          handleListChange,
          handleChange,
          uploadingRow,
          setUploadingRow,
        })}
        dataSource={getUploadHistoryQuery.isLoading ? [] : historyList}
        rowKey="uuid"
        scroll={{ y: 500 }}
      />
    </Modal>
  );
};

HistoryModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.string,
  }).isRequired,
};

HistoryModal.defaultProps = {};

export default HistoryModal;
