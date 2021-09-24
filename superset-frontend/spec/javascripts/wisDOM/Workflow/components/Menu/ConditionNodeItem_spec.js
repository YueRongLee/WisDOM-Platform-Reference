import React from 'react';
import { mount } from 'enzyme';
import ConditionNodeItem from 'src/wisDOM/components/WorkflowKedro/components/Menu/ConditionNodeItem';

describe('wisDOM App', () => {
  it('is valid', () => {
    const nodeData = {
      name: 'test',
      type: 'test',
      id: 'test',
    };
    const data = {
      nodes: [
        {
          id: 'test',
          args: {
            classification: 'test',
          },
        },
      ],
    };
    const wrapper = mount(
      <ConditionNodeItem nodeData={nodeData} data={data} />,
    );
    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
