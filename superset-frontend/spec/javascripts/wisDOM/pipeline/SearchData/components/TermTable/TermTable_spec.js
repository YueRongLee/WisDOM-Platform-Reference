import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import TermTable from 'src/wisDOM/components/SearchData/components/TermTable';

describe('wisDOM App', () => {
  it('is valid', () => {
    const modal = {
      visible: true,
    };
    const wrapper = mount(<TermTable modal={modal} />);
    expect(wrapper.find('.subblock')).toExist();
  });
});
