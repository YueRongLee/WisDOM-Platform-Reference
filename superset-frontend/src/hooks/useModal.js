import { useState } from 'react';

const useModal = initData => {
  const [visible, setVisible] = useState(false);
  const [modalData, setModalData] = useState(initData);

  function openModal(data) {
    setVisible(true);
    setModalData(data);
  }

  function closeModal() {
    setVisible(false);
    setModalData(initData);
  }

  return {
    visible,
    modalData,
    openModal,
    closeModal,
  };
};

export default useModal;
