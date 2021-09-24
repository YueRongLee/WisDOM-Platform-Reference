/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-restricted-imports
import { Modal, Button, Alert } from 'antd';
// import CustomKedro from '../../../KedroViz/CustomKedro';
// import SqlKedro from 'src/wisDOM/components/SqlKedro/SqlKedro';
import { TableApi } from '~~apis/';
import * as Style from './style';

const PreviewModal = ({ modal, close }) => {
  const [ChartLoading, setChartLoading] = useState(false);
  const [kedroData, setKedroData] = useState([]);
  const [seqId, setSeqId] = useState();
  const [resetShowData, setResetShowData] = useState(false);
  const [deserialize, setDeserialize] = useState('');

  const handleBeforeLeave = () => {
    setChartLoading(false);
    setKedroData([]);
    close();
    modal.closeModal();
  };

  useEffect(() => {
    if (modal.visible && modal.modalData) {
      setKedroData(modal.modalData.diagram);
      setSeqId(modal.modalData.seqId);
    }
  }, [modal.visible, modal.modalData]);

  return (
    <Modal
      title="Preview Dataflow"
      visible={modal.visible}
      className="reference-chart"
      bodyStyle={{
        height: '70vh',
        overflow: 'auto',
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
      {seqId && kedroData.length !== 0 ? (
        // <CustomKedro kedroData={kedroData} />
        <Style.ModalKedro
          oEntity={kedroData}
          edit={false}
          setDiagram={setDeserialize}
          sqlID={seqId}
          resetShowData={resetShowData}
          setResetShowData={setResetShowData}
          changeGroupStatus={false}
          historyMode
        />
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

PreviewModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      columns: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
};

PreviewModal.defaultProps = {};

export default PreviewModal;
