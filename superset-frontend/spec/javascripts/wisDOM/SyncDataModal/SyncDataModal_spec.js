import React from 'react';
import { mount } from 'enzyme';
import SyncDataModal from 'src/wisDOM/components/SyncDataModal/SyncDataModal';

describe('wisDOM App', () => {
  it('is valid beforeLeave', () => {
    const modal = {
      visible: true,
    };
    const handleBeforeLeave = jest.fn();
    const wrapper = mount(
      <SyncDataModal modal={modal} onClick={handleBeforeLeave} />,
    );
    wrapper.find('[data-test="beforeLeave"]').first().props().onClick();
    wrapper.find('[data-test="submit"]').first().props().onClick();
    expect(wrapper.find('.linkbutton')).toExist();
  });

  it('is valid table', () => {
    const modal = {
      visible: true,
    };
    const handleSelect = jest.fn();
    const wrapper = mount(
      <SyncDataModal modal={modal} onChange={handleSelect} />,
    );
    wrapper.find('[data-test="table"]').first().props().handleSelect('test');
    expect(wrapper.find('.linkbutton')).toExist();
  });

  it('is valid createNew', () => {
    const modal = {
      visible: true,
    };
    const handleCreateNew = jest.fn();
    const wrapper = mount(
      <SyncDataModal modal={modal} onClick={handleCreateNew} />,
    );
    wrapper.find('[data-test="createNew"]').first().props().onClick();
    expect(wrapper.find('.linkbutton')).toExist();
  });
});
