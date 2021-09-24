import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import Join from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/Join';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('Join', () => {
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
    const nodeParents = [
      {
        name: 'test',
      },
    ];
    const wrapper = mount(
      <Join nodeData={nodeData} data={data} nodeParents={nodeParents} />,
    ); // mount/render/shallow when applicable

    expect(wrapper.find('.Join')).toExist();
  });
});
