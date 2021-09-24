import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import ConsumeModal from 'src/wisDOM/components/SearchData/components/ConsumeModal';

describe('wisDOM App', () => {
  it('is valid', () => {
    const modal = {
      visible: true,
    };
    const wrapper = mount(<ConsumeModal modal={modal} />);
    expect(wrapper.find('.ConsumeModal')).toExist();
  });
  it('cancel onFinish', () => {
    const modal = {
      visible: true,
      closeModal: jest.fn(),
    };
    const handleBeforeLeave = jest.fn();
    const handleConsume = jest.fn();
    const getTagList = jest.fn();
    const wrapper = mount(
      <ConsumeModal
        modal={modal}
        onClick={handleBeforeLeave}
        handleConsume={handleConsume}
        getTagList={getTagList}
      />,
    );
    wrapper.find('[data-test="cancel"]').first().props().onClick();
    wrapper.find('[data-test="auth"]').first().props().onFinish();
  });
});
