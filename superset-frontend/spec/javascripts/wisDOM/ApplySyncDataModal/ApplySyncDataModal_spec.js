import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import ApplySyncDataModal from 'src/wisDOM/components/ApplySyncDataModal/ApplySyncData';

describe('wisDOM App', () => {
  it('is valid', () => {
    const modal = {
      visible: true,
    };
    // test
    const wrapper = mount(<ApplySyncDataModal modal={modal} />);
    expect(wrapper.find('.ApplySyncDataModal')).toExist();
  });
});
