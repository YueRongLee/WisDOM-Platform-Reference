import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import CleansingNodeItem from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Cleansing/NodeItem';
// import { DATAFLOW_TYPE } from '~~constants/index';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('CleansingNodeItem', () => {
  it('is valid', () => {
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

    const changeName = { name: 'test' };
    const changeNodetype = { nodetype: 'Dataset' };
    const changeNodetype2 = { nodetype: 'Transform' };
    const changeNodetype3 = { nodetype: 'Cleansing' };

    const changeCleansing = { transform: 'MissingValues' };
    const changeCleansing2 = { transform: 'CustomValues' };
    const changeParents = { parents: ['test'] };

    const setOptionPage = jest.fn();
    const setSelectPage = jest.fn();
    const handleValidate = jest.fn();
    const hangeValueChange = jest.fn();
    const setData = jest.fn();
    const setNodeChange = jest.fn();
    const setEdgeChange = jest.fn();
    const setSelectFinish = jest.fn();
    const setFocusNode = jest.fn();
    const selectPage = 'Dataset';
    const optionPage = 'selectfields';

    const wrapper = mount(
      <CleansingNodeItem
        data={data}
        setData={setData}
        selectPage={selectPage}
        setSelectPage={setSelectPage}
        optionPage={optionPage}
        setOptionPage={setOptionPage}
        setNodeChange={setNodeChange}
        nodeData={nodeData}
        nodeParents={nodeParents}
        setEdgeChange={setEdgeChange}
        setSelectFinish={setSelectFinish}
        setFocusNode={setFocusNode}
        onBlur={handleValidate}
        onValuesChange={hangeValueChange}
      />,
    );
    wrapper.find('[data-test="nodeNameInput"]').first().props().onBlur();
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeName);

    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeNodetype);

    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeNodetype2);

    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeNodetype3);

    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeCleansing);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeCleansing2);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeParents);
    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
