import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import RemoveDuplicate from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/RemoveDuplicate';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';
Enzyme.configure({ adapter: new Adapter() });

describe('RemoveDuplicate', () => {
  it('is valid', () => {
    const nodeData = {
      name: 'test',
      type: 'test',
      id: 'test',
      edit: true,
    };
    const nodeParents = {
      type: 'Dataset',
      args: {
        table_name: 'test',
      },
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
      edges: [],
    };
    const setData = jest.fn();
    const setSelectFinish = jest.fn();
    const setFocusNode = jest.fn();
    const setNodeChange = jest.fn();
    const schemaLoading = jest.fn();
    const setTableInfo = jest.fn();
    const wrapper = mount(
      <RemoveDuplicate
        nodeData={nodeData}
        nodeParents={nodeParents}
        data={data}
        setData={setData}
        setSelectFinish={setSelectFinish}
        setFocusNode={setFocusNode}
        setNodeChange={setNodeChange}
        schemaLoading={schemaLoading}
        setTableInfo={setTableInfo}
      />,
    ); // mount/render/shallow when applicable

    expect(wrapper.find('.RemoveDuplicate')).toExist();
  });
});
