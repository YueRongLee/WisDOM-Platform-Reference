import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import TransformNodeItem from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/NodeItem';
// import { DATAFLOW_TYPE } from '~~constants/index';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('TransformNodeItem', () => {
  it('is valid', () => {
    const nodeData = {
      name: 'test',
      type: 'transform',
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
          full_name: 'custom_transform',
          name: 'custom_transform',
          type: 'transform',
          check: undefined,
          schema: [
            {
              name: 'firstname',
              type: 'string',
            },
            {
              name: 'secondname',
              type: 'string',
            },
          ],
          args: {
            classification: 'innerjoin',
            mapping: [
              {
                from_node: 'datasource1',
                from_column: 'column1',
                to_node: 'datasource2',
                to_column: 'columnA',
              },
              {
                from_node: 'datasource1',
                from_column: 'column2',
                to_node: 'datasource2',
                to_column: 'columnB',
              },
            ],
            filters: [
              {
                columnName: 'scode',
                operation: '==',
                value: '456',
                columnType: 'string',
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
    const changeTransform = { transform: 'Join' };
    const changeTransform2 = { transform: 'Filter' };
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
      <TransformNodeItem
        // DATAFLOW_TYPE={DATAFLOW_TYPE} //沒吃到
        nodeData={nodeData}
        nodeParents={nodeParents}
        data={data}
        setData={setData}
        setNodeChange={setNodeChange}
        setEdgeChange={setEdgeChange}
        setSelectFinish={setSelectFinish}
        setFocusNode={setFocusNode}
        optionPage={optionPage}
        setOptionPage={setOptionPage}
        selectPage={selectPage}
        setSelectPage={setSelectPage}
        onBlur={handleValidate}
        onValuesChange={hangeValueChange}
      />,
    ); // mount/render/shallow when applicable
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
      .onValuesChange(changeTransform);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeTransform2);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeParents);
    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
