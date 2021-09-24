import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import HealthDataModal from 'src/wisDOM/components/SearchData/components/HealthDataModal';

describe('wisDOM App', () => {
  it('is valid', () => {
    const modal = {
      visible: true,
    };
    const appStore = {
      userInfo: {
        roles: 'MASTER',
      },
    };
    const handleBeforeLeave = jest.fn();
    const showCatory = jest.fn();

    const wrapper = mount(
      <HealthDataModal
        modal={modal}
        handleBeforeLeave={handleBeforeLeave}
        appStore={appStore}
        showCatory={showCatory}
      />,
    );
    expect(wrapper.find('.HealthDataModal')).toExist();
    wrapper.find('[data-test="leave"]').first().props().onClick();
  });
  it('is handleSaveTag', () => {
    const modal = {
      visible: true,
    };
    const appStore = {
      userInfo: {
        roles: 'MASTER',
      },
    };
    const showCatory = jest.fn();
    const handleSaveTag = jest.fn();
    const wrapper = mount(
      <HealthDataModal
        modal={modal}
        handleSaveTag={handleSaveTag}
        appStore={appStore}
        showCatory={showCatory}
      />,
    );
    wrapper.find('[data-test="saveTag"]').first().props().onClick();
  });
});
