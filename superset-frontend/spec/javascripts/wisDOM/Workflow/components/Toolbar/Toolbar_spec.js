import React from 'react';
import { mount } from 'enzyme';
import Toolbar from 'src/wisDOM/components/WorkflowKedro/components/Toolbar/Toolbar';

describe('wisDOM App', () => {
  it('is valid', () => {
    expect(React.isValidElement(<Toolbar />)).toBe(true);
    const wrapper = mount(<Toolbar />);
    expect(wrapper.find('.bar-btn')).toExist();
    expect(wrapper.find('.bar-btn-add')).toExist();
    expect(wrapper.find('.bar-btn-delete')).toExist();
  });
});

describe('resumeConfirmModal', () => {
  let size;
  let onSize;

  beforeEach(() => {
    onSize = jest.fn();
    size = mount(<Toolbar setZoomSize={onSize} setSelectFinish={false} />);
  });

  it('Add requires setZoomSize', () => {
    expect(size).toBeDefined();
  });
});
