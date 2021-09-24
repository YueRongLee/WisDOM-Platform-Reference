import React from 'react';
import { mount } from 'enzyme';
import CustomKedro from 'src/wisDOM/components/KedroViz/CustomKedro';

describe('wisDOM App', () => {
  it('is valid', () => {
    const data = {
      nodes: [
        {
          id: 'test',
          args: {
            classification: 'test',
          },
        },
      ],
      edges: [],
    };
    const wrapper = mount(<CustomKedro kedroData={data} />);
    expect(wrapper.find('#kedroChart')).toExist();
  });
});
