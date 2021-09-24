import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import CustomCronModal from 'src/wisDOM/components/CronModal/CustomCronModal';

describe('wisDOM App', () => {
  it('is valid', () => {
    const modal = {
      visible: true,
    };
    const setCronValue = jest.fn();
    const wrapper = mount(
      <CustomCronModal modal={modal} setCronValue={setCronValue} />,
    );
    expect(wrapper.find('#wisdom-customCronModal-modal')).toExist();
  });
});
