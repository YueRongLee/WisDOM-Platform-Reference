import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import SelectField from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/SelectFiled';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('SelectField', () => {
  it('is valid', () => {
    const nodeData = {
      name: 'test',
      type: 'test',
      id: 'test',
      edit: true,
    };
    const nodeParents = [
      {
        type: 'Dataset',
      },
    ];
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
    const setData = jest.fn();
    const setSelectFinish = jest.fn();
    const setFocusNode = jest.fn();
    const setNodeChange = jest.fn();
    const schemaLoading = jest.fn(() => false);
    const wrapper = mount(
      <SelectField
        nodeParents={nodeParents}
        data={data}
        nodeData={nodeData}
        setData={setData}
        setSelectFinish={setSelectFinish}
        setFocusNode={setFocusNode}
        setNodeChange={setNodeChange}
        schemaLoading={schemaLoading}
      />,
    ); // mount/render/shallow when applicable

    expect(wrapper.find('.SelectField')).toExist();
  });
});
