import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import BellMenu from 'src/components/Menu/BellMenu';

describe('wisDOM App', () => {
  it('is valid', () => {
    const wrapper = mount(<BellMenu />); // mount/render/shallow when applicable
    expect(wrapper.find('#user-menu-dropwn')).toExist();
    expect(wrapper.find('.bell-btn')).toExist();
    expect(wrapper.find('.mark-btn')).toExist();
    expect(wrapper.find('.bell-msg-date')).toExist();
    expect(wrapper.find('.bell-msg-title')).toExist();
    expect(wrapper.find('.read-circle-btn')).toExist();
    expect(wrapper.find('#menu-bell-listItem')).toExist();
  });

  //   it('bell click events', () => {
  //     const onButtonClick = sinon.spy();
  //     const wrapper = mount(<BellMenu onButtonClick={onButtonClick} />);
  //     wrapper.find('button').simulate('click');
  //     expect(onButtonClick).toHaveBeenCalledTimes(1);
  //   });
});
