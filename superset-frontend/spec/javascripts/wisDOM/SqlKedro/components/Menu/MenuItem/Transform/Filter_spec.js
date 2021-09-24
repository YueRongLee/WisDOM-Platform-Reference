import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import Filter from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/Filter';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('Filter', () => {
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
    const nodeParents = {
      id: 'test',
      type: 'Dataset',
    };
    const setSelectFinish = jest.fn();
    const setData = jest.fn();
    const setFocusNode = jest.fn();
    const schemaLoading = jest.fn();
    const setNodeChange = jest.fn();
    const wrapper = mount(
      <Filter
        nodeData={nodeData}
        nodeParents={nodeParents}
        setSelectFinish={setSelectFinish}
        data={data}
        setData={setData}
        setFocusNode={setFocusNode}
        schemaLoading={schemaLoading}
        setNodeChange={setNodeChange}
      />,
    ); // mount/render/shallow when applicable

    expect(wrapper.find('.formListBlock')).toExist();
  });
});
