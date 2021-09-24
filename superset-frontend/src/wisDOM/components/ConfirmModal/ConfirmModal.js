/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';

const ConfirmModal = ({ modal, handleOK, nowloading }) => {
  const [loading, setLoading] = useState(false);

  const handleBeforeLeave = () => {
    setLoading(false);
    modal.closeModal();
  };

  useEffect(() => {
    if (modal.visible && modal.modalData) {
      setLoading(nowloading);
    }
  }, [modal.visible, modal.modalData]);

  return (
    <Modal
      data-test="modalConfirm"
      title={
        modal.modalData && modal.modalData.title
          ? modal.modalData.title
          : 'Confirm Deletion'
      }
      visible={modal.visible}
      onOk={handleOK}
      onCancel={handleBeforeLeave}
      maskClosable={!loading}
      confirmLoading={loading}
      closable={!loading}
      cancelButtonProps={{ disabled: loading }}
      destroyOnClose
    >
      {modal.modalData && modal.modalData.showMsg ? (
        modal.modalData.showMsg
      ) : (
        <p>Are you sure you want to delete ?</p>
      )}
    </Modal>
  );
};

ConfirmModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      columns: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
};

ConfirmModal.defaultProps = {};

export default ConfirmModal;
