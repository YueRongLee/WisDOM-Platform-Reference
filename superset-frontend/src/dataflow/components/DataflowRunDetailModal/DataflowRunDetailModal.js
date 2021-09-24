/* eslint-disable react/no-danger */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-restricted-imports
import { Modal, Button, Space, Timeline } from 'antd';
import './DataflowRunDetailModalStyle.less';

const DataflowRunDetailModal = ({ modal }) => (
  <Modal
    title="Status Info"
    visible={modal.visible}
    onCancel={modal.closeModal}
    footer={[
      <Button key="back" onClick={modal.closeModal}>
        OK
      </Button>,
    ]}
    bodyStyle={{
      maxHeight: '70vh',
      overflow: 'auto',
    }} // 高度自動,超過螢幕的70％就scroll
    width={850}
    maskClosable={false}
  >
    <div dangerouslySetInnerHTML={{ __html: modal.modalData }} />
  </Modal>
);

DataflowRunDetailModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({}),
  }).isRequired,
};

DataflowRunDetailModal.defaultProps = {};

export default DataflowRunDetailModal;
