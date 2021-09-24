import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import renderer from 'react-test-renderer';
import {
  tableDataformat,
  tableSchema,
} from 'src/wisDOM/components/SqlKedro/actions/KedroData';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

// Enzyme.configure({ adapter: new Adapter() });

describe('tableDataformat function', () => {
  it('is valid', () => {
    const data = [
      { name: '1', columns: [{ name: '1', type: 't' }] },
      { name: '2', columns: [{ name: '1', type: 't' }] },
      { name: '3', columns: [{ name: '1', type: 't' }] },
    ];
    const nodesLength = tableDataformat(data).nodes.length;

    expect(nodesLength).toBe(3);
  });
});

describe('tableSchema function', () => {
  it('is valid', () => {
    const data = {
      nodes: [
        {
          full_name: 'dataset',
          tableInfo: { columns: [{ name: '1', type: 't' }] },
        },
      ],
    };
    const dataset = 'dataset';
    const nodesLength = tableSchema(data, dataset).length;

    expect(nodesLength).toBe(1);
  });
});
