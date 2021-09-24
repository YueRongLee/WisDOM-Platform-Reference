import React from 'react';
import { mount } from 'enzyme';
import HistoryModal from 'src/wisDOM/components/UploadModal/HistoryModal';

describe('wisDOM App', () => {
  it('is valid', () => {
    const modal = {
      visible: true,
      closeModal: jest.fn(),
      modalData: 'tableName',
    };
    const handleBeforeLeave = jest.fn();
    const wrapper = mount(
      <HistoryModal modal={modal} handleBeforeLeave={handleBeforeLeave} />,
    );
    wrapper.find('[data-test="beforeLeave"]').first().props().onClick();
    // wrapper.find('[data-test="Off-Chain"]').first().props().onClick();
    // wrapper.find('[data-test="uploadOutlined"]').first().props().onClick();
    // wrapper.find('[data-test="downloadRecord"]').first().props().onClick();
    // expect(wrapper.find('.blockchainstatus')).toExist();
    expect(wrapper.find('.historyModal')).toExist();
  });
  it('is uploadOutlined valid', () => {
    const modal = {
      visible: true,
      closeModal: jest.fn(),
      modalData: 'tableName',
    };
    const handleUploadRecord = jest.fn();
    const wrapper = mount(
      <HistoryModal modal={modal} handleUploadRecord={handleUploadRecord} />,
    );
    // wrapper.find('[data-test="beforeLeave"]').first().props().onClick();
    // wrapper.find('[data-test="Off-Chain"]').first().props().onClick();
    wrapper.find('[data-test="uploadOutlined"]').first().props().onClick();
    // wrapper.find('[data-test="downloadRecord"]').first().props().onClick();
    // expect(wrapper.find('.blockchainstatus')).toExist();
    expect(wrapper.find('.historyModal')).toExist();
  });
  it('is downloadRecord valid', () => {
    const modal = {
      visible: true,
      closeModal: jest.fn(),
      modalData: 'tableName',
    };
    const handleDownloadRecord = jest.fn();
    const wrapper = mount(
      <HistoryModal
        modal={modal}
        handleDownloadRecord={handleDownloadRecord}
      />,
    );
    // wrapper.find('[data-test="beforeLeave"]').first().props().onClick();
    // wrapper.find('[data-test="Off-Chain"]').first().props().onClick();
    // wrapper.find('[data-test="uploadOutlined"]').first().props().onClick();
    wrapper.find('[data-test="downloadRecord"]').first().props().onClick();
    // expect(wrapper.find('.blockchainstatus')).toExist();
    expect(wrapper.find('.historyModal')).toExist();
  });
});
