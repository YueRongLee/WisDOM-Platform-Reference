/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Space, List, Divider, Result } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { PowerBiTemplateApi } from '~~apis/';
import './InfoTemplateModal.less';

const InfoTemplateModal = ({ modal }) => {
  const [loading, setLoading] = useState(false);
  const [templateInfo, setTemplateInfo] = useState([]);

  const handleBeforeLeave = () => {
    setLoading(false);
    setTemplateInfo([]);
    modal.closeModal();
  };

  const getPowerBiInfo = async templateId => {
    setLoading(true);
    try {
      const result = await PowerBiTemplateApi.getPowerBiTemplateInfo(
        templateId,
      ); // check editing
      setTemplateInfo(result);
    } catch (e) {
      setTemplateInfo([]);
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modal.visible && modal.modalData) {
      getPowerBiInfo(modal.modalData.templateId);
    }
  }, [modal.visible]);

  return (
    <Modal
      className="editModal"
      title={`Power BI Template preview - ${
        modal.modalData && modal.modalData.templateName
      }`}
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '75vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的75％就scroll
      onCancel={handleBeforeLeave}
      footer={
        <Space align="end">
          <Button disabled={loading} onClick={handleBeforeLeave}>
            OK
          </Button>
        </Space>
      }
      width={1000}
      destroyOnClose
      closable={!loading}
      maskClosable={!loading}
    >
      <div>
        Description: {modal.modalData && modal.modalData.templateDescription}
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '38%', margin: '10px' }}>
          <Divider>Columns</Divider>
          <List
            style={{ height: '50vh', overflowY: 'scroll' }}
            bordered
            dataSource={templateInfo && templateInfo.templateColumnInfo}
            renderItem={item => (
              <List.Item>
                <div>
                  <div>
                    Column Name:{' '}
                    <span style={{ color: '#979797' }}>{item.column}</span>
                  </div>
                  <div>
                    Column Type:{' '}
                    <span style={{ color: '#979797' }}>{item.type}</span>
                  </div>
                  <div>
                    Column Description:{' '}
                    <span style={{ color: '#979797' }}>{item.description}</span>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>
        <div style={{ width: '60%', margin: '10px' }}>
          <Divider>Report</Divider>
          {templateInfo && templateInfo.templateUrl ? (
            <iframe
              style={{ height: '88%' }}
              title="Power bi"
              src={templateInfo.templateUrl}
              id="ifr1"
              name="ifr1"
              scrolling="yes"
            />
          ) : (
            <Result
              // style={{ flex: 1, paddingTop: 80 }}
              icon={<InfoCircleOutlined />}
              title="No Data"
              subTitle="Please check your powerBi report."
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

InfoTemplateModal.propTypes = {
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

InfoTemplateModal.defaultProps = {
  onUploadExist: () => null,
};

export default InfoTemplateModal;
