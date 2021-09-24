import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import TargetNodeItem from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Target/NodeItem';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('TargetNodeItem NodeItem', () => {
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
    const setNodePublish = jest.fn();
    const setSelectPage = jest.fn();
    const wrapper = mount(
      <TargetNodeItem
        nodeData={nodeData}
        data={data}
        setNodePublish={setNodePublish}
        setSelectPage={setSelectPage}
      />,
    ); // mount/render/shallow when applicable

    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
