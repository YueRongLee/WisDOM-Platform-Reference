import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import ConfirmModal from 'src/wisDOM/components/ConfirmModal/ConfirmModal';

describe('wisDOM App', () => {
  it('is valid', () => {
    const modal = {
      visible: true,
    };
    const handleOK = jest.fn();

    const wrapper = mount(
      <ConfirmModal modal={modal} handleOK={handleOK} nowloading={false} />,
    );
    expect(wrapper.find('.importModal')).toExist();
  });

  it('cancel', () => {
    const modal = {
      visible: true,
      closeModal: jest.fn(),
      modalData: {
        title: 'test',
        showMsg: 'test',
      },
    };
    const handleBeforeLeave = jest.fn();
    const handleOK = jest.fn();

    const wrapper = mount(
      <ConfirmModal
        modal={modal}
        onCancel={handleBeforeLeave}
        onOK={handleOK}
      />,
    );

    wrapper.find('[data-test="modalConfirm"]').first().props().onCancel();
    wrapper.find('[data-test="modalConfirm"]').first().props().onOK();

    expect(handleBeforeLeave).toHaveBeenCalledTimes(0);
    expect(handleOK).toHaveBeenCalledTimes(0);
  });
});
