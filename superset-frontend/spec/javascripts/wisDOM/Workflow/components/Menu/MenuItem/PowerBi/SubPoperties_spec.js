import React from 'react';
import { mount } from 'enzyme';
import PowerBiPoperties from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/PowerBi/SubPoperties';

describe('wisDOM App', () => {
  it('is valid', () => {
    const nodeData = {
      name: 'test',
      type: 'test',
      id: 'test',
      edit: true,
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
    const wrapper = mount(<PowerBiPoperties nodeData={nodeData} data={data} />);
    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
