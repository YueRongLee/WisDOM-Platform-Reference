import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import ApplyModal from 'src/wisDOM/components/SearchData/components/Apply/ApplyModal';

describe('wisDOM App', () => {
  it('is valid', () => {
    const user = {
      lastName: 'test',
      emplId: '105123456',
      email: 'afds@wds.com',
    };
    const modal = {
      visible: true,
    };
    const form = {
      handleApply: jest.fn(),
    };
    const wrapper = mount(<ApplyModal modal={modal} user={user} form={form} />);
    expect(wrapper.find('.ApplySyncDataModal')).toExist();
  });

  it('cancel onFinish', () => {
    const modal = {
      visible: true,
      closeModal: jest.fn(),
    };
    const user = {
      lastName: 'test',
      emplId: '105123456',
      email: 'afds@wds.com',
    };
    const handleBeforeLeave = jest.fn();
    const handleApply = jest.fn();
    const wrapper = mount(
      <ApplyModal
        user={user}
        modal={modal}
        onClick={handleBeforeLeave}
        handleApply={handleApply}
      />,
    );
    wrapper.find('[data-test="cancel"]').first().props().onClick();
    wrapper.find('[data-test="auth"]').first().props().onFinish();
  });
  it('trialRun', () => {
    const modal = {
      visible: true,
      closeModal: jest.fn(),
    };
    const user = {
      lastName: 'test',
      emplId: '105123456',
      email: 'afds@wds.com',
    };
    const handleTrialRun = jest.fn();
    const wrapper = mount(
      <ApplyModal user={user} modal={modal} onClick={handleTrialRun} />,
    );
    wrapper.find('[data-test="trialRun"]').first().props().onClick();
  });
});
