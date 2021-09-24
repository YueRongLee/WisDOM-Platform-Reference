/* eslint-disable no-restricted-imports */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, List, Space } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import * as Style from './style';

const WorkflowReferenceModal = ({ modal, handleOK }) => (
  <Modal
    title="Confirm Save Dataflow"
    visible={modal.visible}
    onCancel={modal.closeModal}
    bodyStyle={{
      maxHeight: '70vh',
      overflow: 'auto',
    }} // 高度自動,超過螢幕的70％就scroll
    maskClosable={false}
    footer={
      <Space align="end">
        <Button onClick={modal.closeModal}>Cancel</Button>
        <Button type="primary" onClick={() => handleOK()}>
          Save
        </Button>
      </Space>
    }
    width={700}
    destroyOnClose
    //   confirmLoading={loading}
    //   closable={!loading}
    //   cancelButtonProps={{ disabled: loading }}
  >
    {/* <Spin spinning={loading}> */}
    <div>
      <div
        style={{
          display: 'flex',
          alignContent: 'center',
          margin: '10px 10px 20px',
        }}
      >
        <div style={{ width: '15%', textAlign: 'center' }}>
          <WarningOutlined style={{ color: 'goldenrod', fontSize: '65px' }} />
        </div>
        <div style={{ width: '85%' }}>
          <div>
            The target node has been changed, which may cause errors in the
            Workflow.
          </div>
          <div>
            <b>
              After clicking "Save", please check the Workflows to which the
              Dataflow has been applied.
            </b>
            Or, ignore the changes as you click "Cancel".
          </div>
        </div>
      </div>

      <div style={{ fontSize: '14px' }}>Check List of Workflows</div>
    </div>
    {modal.modalData && (
      <Style.WorkflowRefList
        //   grid={{ gutter: 4, column: 1 }}
        size="large"
        dataSource={modal.modalData.list}
        pagination={false}
        renderItem={item => (
          <List.Item>
            <b style={{ fontSize: '14px', color: '#8d8d8d' }}>{item}</b>
          </List.Item>
        )}
      />
    )}
    {/* </Spin> */}
  </Modal>
);
WorkflowReferenceModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({}),
  }).isRequired,
};

WorkflowReferenceModal.defaultProps = {};

export default WorkflowReferenceModal;
