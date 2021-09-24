/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Alert } from 'antd';
import { TableApi } from '~~apis/';
import CustomKedro from '../../KedroViz/CustomKedro';
import './ReferencechartModal.less';

const ReferenceChartModal = ({ modal }) => {
  const [ChartLoading, setChartLoading] = useState(false);
  const [kedroData, setKedroData] = useState([]);

  const handleBeforeLeave = () => {
    setChartLoading(false);
    modal.closeModal();
  };

  const getKedroData = async id => {
    setChartLoading(true);
    try {
      const result = await TableApi.getTableLineage(id);
      setKedroData(result);
    } catch (e) {
      console.log(e);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    if (modal.visible && modal.modalData && modal.modalData.guid) {
      getKedroData(modal.modalData.guid);
    }
  }, [modal.visible, modal.modalData]);

  return (
    <Modal
      title="Reference Chart"
      visible={modal.visible}
      className="reference-chart"
      bodyStyle={{
        height: '70vh',
        overflow: 'hidden auto',
      }} // 高度自動,超過螢幕的70％就scroll
      onCancel={handleBeforeLeave}
      footer={
        <Button
          type="primary"
          onClick={handleBeforeLeave}
          disabled={ChartLoading}
        >
          Ok
        </Button>
      }
      width={900}
      destroyOnClose
      closable={!ChartLoading}
      maskClosable={!ChartLoading}
    >
      {kedroData.length !== 0 ? (
        <CustomKedro kedroData={kedroData} />
      ) : (
        ChartLoading === false && (
          <div style={{ marginBottom: 24 }}>
            <Alert message="No Data" type="error" showIcon />
          </div>
        )
      )}
    </Modal>
  );
};

ReferenceChartModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      columns: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
};

ReferenceChartModal.defaultProps = {};

export default ReferenceChartModal;
