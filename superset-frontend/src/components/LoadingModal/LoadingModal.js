import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import Timer from 'react-compound-timer';
import PropTypes from 'prop-types';
import { Modal, Button } from 'antd';
import RunIcon from '../../../images/running.svg';

const LoadingModal = ({ modal, onCancelLoadingModal }) => (
  <Modal
    title="Previewing"
    visible={modal.visible}
    onCancel={onCancelLoadingModal}
    footer={
      <Button type="primary" onClick={onCancelLoadingModal}>
        Cancel
      </Button>
    }
    width={450}
    destroyOnClose
    maskClosable={false}
  >
    <>
      <div
        style={{
          textAlign: 'center',
          color: '#7d7d7d',
          fontSize: '20px',
        }}
      >
        <Timer
          formatValue={value => `${value < 10 ? `0${value}` : value} units `}
        >
          <Timer.Hours formatValue={value => `${value} hours. `} />
          <Timer.Minutes formatValue={value => `${value} mins. `} />
          <Timer.Seconds formatValue={value => `${value} s. `} />
        </Timer>
      </div>
      <div style={{ textAlign: 'center', margin: '0px' }}>
        <img src={RunIcon} alt="" />
        <p
          style={{
            textAlign: 'center',
            color: '#7d7d7d',
            fontSize: '20px',
          }}
        >
          Prepare Data for Preview...
        </p>
      </div>
    </>
  </Modal>
);

LoadingModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      columns: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
};

LoadingModal.defaultProps = {};

export default LoadingModal;
