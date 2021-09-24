import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import HelpMenu from 'src/components/Menu/HelpMenu';

describe('wisDOM App', () => {
  it('is valid', () => {
    const wrapper = mount(<HelpMenu />); // mount/render/shallow when applicable
    expect(wrapper.find('#user-menu-dropwn')).toExist();
    expect(wrapper.find('#menu-help-MenuItem')).toExist();
  });
});
