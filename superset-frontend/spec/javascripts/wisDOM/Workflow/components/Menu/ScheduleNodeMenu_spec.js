import React from 'react';
import { mount } from 'enzyme';
import ScheduleNodeMenu from 'src/wisDOM/components/WorkflowKedro/components/Menu/ScheduleNodeMenu';

describe('wisDOM App', () => {
  it('is valid', () => {
    const nodeData = {
      name: 'test',
      type: 'test',
      id: 'test',
    };
    expect(React.isValidElement(<ScheduleNodeMenu nodeData={nodeData} />)).toBe(
      true,
    );
    const wrapper = mount(<ScheduleNodeMenu nodeData={nodeData} />);
    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
