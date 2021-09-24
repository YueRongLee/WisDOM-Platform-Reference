import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import MissingValue from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Cleansing/MissingValue';

Enzyme.configure({ adapter: new Adapter() });

describe('CleansingNodeItem', () => {
  it('is valid', () => {
    const tables = [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'age',
        type: 'int',
      },
      {
        name: 'born',
        type: 'date',
      },
    ];

    const nodeData = {
      name: 'test',
      type: 'cleansing',
      id: 'test',
      edit: true,
    };
    const nodeParents = [
      {
        key: '123',
      },
    ];

    const data = {
      nodes: [
        {
          id: 'test',
          full_name: 'new_node',
          name: 'new_node',
          type: 'cleansing',
          check: undefined,
          args: {
            name: 'new_node',
            type: 'transform',
            classification: 'MissingValues',
            missingValue: [
              {
                sourceColumn: 'name',
                missingAction: 'fillComputedValue',
                targetValue: 'previousValue',
                groupBy: ['age'],
                timeline: 'born',
              },
            ],
          },
        },
      ],
      edges: [],
    };

    const changeSourceColumn = { payload: { sourceColumn: 'name' } };
    const changeAction = { payload: { missingAction: 'deleteRows' } };
    const changeAction2 = { payload: { missingAction: 'fillString' } };
    const changeTarget = { payload: { targetValue: 'test123' } };
    const changeGroupBy = { payload: { groupBy: 'age' } };
    const changeTime = { payload: { timeline: 'age' } };

    const hangeValueChange = jest.fn();
    const setNodeChange = jest.fn();

    const wrapper = mount(
      <MissingValue
        tables={tables}
        data={data}
        nodeData={nodeData}
        nodeParents={nodeParents}
        schemaLoading={false}
        setNodeChange={setNodeChange}
        onValuesChange={hangeValueChange}
      />,
    );

    wrapper
      .find('[data-test="missingPayload"]')
      .first()
      .props()
      .onValuesChange(changeSourceColumn);

    wrapper
      .find('[data-test="missingPayload"]')
      .first()
      .props()
      .onValuesChange(changeAction);

    wrapper
      .find('[data-test="missingPayload"]')
      .first()
      .props()
      .onValuesChange(changeAction2);

    wrapper
      .find('[data-test="missingPayload"]')
      .first()
      .props()
      .onValuesChange(changeTarget);

    wrapper
      .find('[data-test="missingPayload"]')
      .first()
      .props()
      .onValuesChange(changeGroupBy);
    wrapper
      .find('[data-test="missingPayload"]')
      .first()
      .props()
      .onValuesChange(changeTime);

    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
