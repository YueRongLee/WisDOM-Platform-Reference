/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Space, Table } from 'antd';

const columns = [
  {
    title: 'Metrics',
    dataIndex: 'metricName',
    key: 'metricName',
    width: '40%',
  },
  {
    title: 'Validation',
    dataIndex: 'validation',
    key: 'validation',
    width: '30%',
    sorter: {
      compare: (a, b) => a.validation - b.validation,
      multiple: 2,
    },
  },
  {
    title: 'Cross Validation',
    dataIndex: 'crossValidation',
    key: 'crossValidation',
    width: '30%',
    sorter: {
      compare: (a, b) => a.crossValidation - b.crossValidation,
      multiple: 1,
    },
  },
];

const DataRobotDetailModal = ({ modal }) => {
  const [loading, setLoading] = useState(false);
  // const [form] = Form.useForm();

  const handleBeforeLeave = () => {
    // form.resetFields();
    modal.closeModal();
  };

  useEffect(() => {
    if (modal.visible && modal.modalData) {
      setLoading(false);
    }
  }, [modal.visible, modal.modalData]);

  const formateData = data => {
    const showArray = [];
    const { length } = Object.keys(data);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < length; i++) {
      const obj = {
        validation:
          Object.values(modal.modalData.metrics)[i].validation &&
          Object.values(modal.modalData.metrics)[i].validation.toFixed(4),
        crossValidation:
          Object.values(modal.modalData.metrics)[i].crossValidation &&
          Object.values(modal.modalData.metrics)[i].crossValidation.toFixed(4),
        metricName: Object.keys(modal.modalData.metrics)[i],
      };
      showArray.push(obj);
    }
    return showArray;
  };

  return (
    <Modal
      title={
        modal.modalData &&
        `(${modal.modalData.modelNumber})${modal.modalData.modelType}`
      }
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '65vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的65％就scroll
      onCancel={handleBeforeLeave}
      footer={
        <Space align="end">
          <Button onClick={handleBeforeLeave}>Close</Button>
        </Space>
      }
      width={1000}
      destroyOnClose
      closable={!loading}
      maskClosable={!loading}
    >
      <Table
        columns={columns}
        dataSource={
          modal.modalData &&
          modal.modalData.metrics &&
          formateData(modal.modalData.metrics)
        }
      />
    </Modal>
  );
};

DataRobotDetailModal.propTypes = {
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

DataRobotDetailModal.defaultProps = {
  onUploadExist: () => null,
};

export default DataRobotDetailModal;
