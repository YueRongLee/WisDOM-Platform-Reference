/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-restricted-imports
import { Modal, Button, Space, Timeline } from 'antd';
import './WorkflowRunDetailModalStyle.less';

const WorkflowRunDetailModal = ({ modal }) => {
  const showWorkFlowRunInfo = () => {
    if (modal.modalData && Array.isArray(modal.modalData)) {
      if (modal.modalData.length !== 0) {
        const getCircleColor = status => {
          let circleColor;
          switch (status) {
            case 'SUCCESS':
              circleColor = 'green';
              return circleColor;
            case 'FAIL':
              circleColor = 'red';
              return circleColor;
            case 'SKIP':
              circleColor = 'blue';
              return circleColor;
            case 'RUNNING':
              circleColor = 'gray';
              return circleColor;
            default:
              circleColor = 'gray';
              return circleColor;
          }
        };
        return (
          <Timeline>
            {modal.modalData.map(node => (
              <Timeline.Item color={getCircleColor(node.status)}>
                <p
                  style={{
                    color: getCircleColor(node.status),
                    fontWeight: 'bold',
                  }}
                >
                  {node.status}
                </p>
                <p>
                  <span style={{ color: 'rgb(144 144 144 / 90%)' }}>
                    Node Name:{' '}
                  </span>
                  {node.nodeName}
                </p>
                <p>
                  <span style={{ color: 'rgb(144 144 144 / 90%)' }}>
                    Node Type:{' '}
                  </span>
                  {node.nodeType}
                </p>
                <p>
                  <span style={{ color: 'rgb(144 144 144 / 90%)' }}>
                    Node Action:{' '}
                  </span>{' '}
                  {node.nodeAction}
                </p>
              </Timeline.Item>
            ))}
          </Timeline>
        );
      }
      return <div>No Node Data of this run</div>;
    }
    return null;
  };

  return (
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
      maskClosable={false}
    >
      {showWorkFlowRunInfo()}
    </Modal>
  );
};

WorkflowRunDetailModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({}),
  }).isRequired,
};

WorkflowRunDetailModal.defaultProps = {};

export default WorkflowRunDetailModal;
