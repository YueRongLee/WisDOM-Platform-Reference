/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Space } from 'antd';
import CustomCron from './CustomCron';

const CustomCronModal = ({
  modal,
  setCronValue,
  getUIValue,
  setGetUIValue,
  handleOK, // call api可能不同
  loading,
  // healthyAssessment,
  // setHealthyAssessment,
}) => {
  const [okIsLoading, setOkIsLoading] = useState(false); // modal ok click
  const [submitIsLoading, setSubmitIsLoading] = useState(false); // cronjob form submit
  // const [defaultHealthyAssessment, setDefaultHealthyAssessment] = useState(
  //   false,
  // );

  const handleBeforeLeave = () => {
    // // 當使用者點擊右上角取消，狀態回到最初預設值
    // if (healthyAssessment !== undefined) {
    //   setHealthyAssessment(defaultHealthyAssessment);
    // }
    modal.closeModal();
  };

  const handleOkClick = () => {
    setOkIsLoading(true);
    // 使用者點擊ok後更新預設值
    // setDefaultHealthyAssessment(healthyAssessment);
  };

  // // mounted時設置預設值
  // useEffect(() => {
  //   setDefaultHealthyAssessment(healthyAssessment);
  // }, []);

  useEffect(() => {
    if (submitIsLoading === true) {
      handleOK();
      setOkIsLoading(false);
      setSubmitIsLoading(false);
    }
  }, [submitIsLoading]);

  return modal.visible ? (
    <Modal
      id="wisdom-customCronModal-modal"
      title="Update Frequency Setting"
      visible={modal.visible}
      le={{
        maxHeight: '50vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的50％就scroll
      onCancel={handleBeforeLeave}
      footer={
        <Space align="end">
          <Button
            type="primary"
            onClick={() => handleOkClick()}
            loading={loading}
          >
            Ok
          </Button>
        </Space>
      }
      width={700}
      maskClosable={!loading}
      confirmLoading={loading}
      closable={!loading}
      cancelButtonProps={{ disabled: loading }}
    >
      <div>
        <CustomCron
          setUItoValue={setCronValue}
          getUIValue={getUIValue}
          setGetUIValue={setGetUIValue}
          okIsLoading={okIsLoading}
          setSubmitIsLoading={setSubmitIsLoading}
          setOkIsLoading={setOkIsLoading}
          // healthyAssessment={healthyAssessment}
          // setHealthyAssessment={setHealthyAssessment}
        />
      </div>
    </Modal>
  ) : null;
};

CustomCronModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({}),
  }).isRequired,
};

CustomCronModal.defaultProps = {};

export default CustomCronModal;
