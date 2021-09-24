import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import CronModal from 'src/wisDOM/components/CronModal/CronModal';

describe('wisDOM App', () => {
  it('is valid', () => {
    const wrapper = mount(<CronModal />);
    expect(wrapper.find('.cronModal')).toExist();
  });
});
