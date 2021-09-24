import React from 'react';
import { mount, shallow } from 'enzyme';
import CreateSyncData from 'src/wisDOM/components/SyncDataModal/CreateSyncData';

describe('wisDOM App', () => {
  it('is valid beforeLeave', () => {
    const modal = {
      visible: true,
    };
    const setTestLoading = jest.fn();
    const setSyncData = jest.fn();
    const handleBeforeLeave = jest.fn();
    const wrapper = mount(
      <CreateSyncData
        modal={modal}
        setTestLoading={setTestLoading}
        setSyncData={setSyncData}
        onClick={handleBeforeLeave}
      />,
    );

    wrapper.find('[data-test="beforeLeave"]').first().props().onClick();
    expect(wrapper.find('.columnRow')).toExist();
    expect(wrapper.find('.linkbutton')).toExist();
  });

  it('is valid linkbutton', () => {
    const modal = {
      visible: true,
    };
    const setTestLoading = jest.fn();
    const setSyncData = jest.fn();
    const handleCreateExist = jest.fn();
    const wrapper = mount(
      <CreateSyncData
        modal={modal}
        setTestLoading={setTestLoading}
        setSyncData={setSyncData}
        onClick={handleCreateExist}
      />,
    );

    wrapper.find('[data-test="linkbutton"]').first().props().onClick();

    expect(wrapper.find('.columnRow')).toExist();
    expect(wrapper.find('.linkbutton')).toExist();
  });

  it('is valid handleEdit', () => {
    const modal = {
      visible: true,
    };
    const setTestLoading = jest.fn();
    const setSyncData = jest.fn();
    const handleEdit = jest.fn();
    const wrapper = mount(
      <CreateSyncData
        modal={modal}
        setTestLoading={setTestLoading}
        setSyncData={setSyncData}
        onClick={handleEdit}
      />,
    );

    wrapper.find('[data-test="editClick"]').first().props().onClick();

    expect(wrapper.find('.columnRow')).toExist();
    expect(wrapper.find('.linkbutton')).toExist();
  });

  it('is valid handleTest', () => {
    const modal = {
      visible: true,
    };
    const setTestLoading = jest.fn();
    const setSyncData = jest.fn();
    const handleTest = jest.fn();
    const wrapper = mount(
      <CreateSyncData
        modal={modal}
        setTestLoading={setTestLoading}
        setSyncData={setSyncData}
        onClick={handleTest}
      />,
    );

    wrapper.find('[data-test="testConnClick"]').first().props().onClick();

    expect(wrapper.find('.columnRow')).toExist();
    expect(wrapper.find('.linkbutton')).toExist();
  });
});
