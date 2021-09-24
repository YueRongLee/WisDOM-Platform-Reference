import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import MergeColumn from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/MergeColumn';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';
Enzyme.configure({ adapter: new Adapter() });

describe('MergeColumn', () => {
  it('is valid', () => {
    const nodeData = {
      name: 'test',
      type: 'test',
      id: 'test',
      edit: true,
    };
    const nodeParents = {
      id: 'test',
      type: 'Dataset',
    };
    const data = {
      nodes: [
        {
          id: 'test',
          args: {
            classification: 'test',
          },
          schema: 'schema',
        },
      ],
      edges: [],
    };
    const setData = jest.fn();
    const setSelectFinish = jest.fn();
    const setFocusNode = jest.fn();
    const setNodeChange = jest.fn();

    const tableInfo = {
      tableName: 'tableName',
      columns: [
        {
          name: '123',
          type: 'string',
        },
        {
          name: '456',
          type: 'string',
        },
      ],
      lastUpdateTime: 123456,
    };

    const wrapper = mount(
      <MergeColumn
        nodeData={nodeData}
        nodeParents={nodeParents}
        data={data}
        setData={setData}
        setSelectFinish={setSelectFinish}
        setFocusNode={setFocusNode}
        setNodeChange={setNodeChange}
        tableInfo={tableInfo}
      />,
    ); // mount/render/shallow when applicable

    expect(wrapper.find('.MergeColumn')).toExist();
  });
});
