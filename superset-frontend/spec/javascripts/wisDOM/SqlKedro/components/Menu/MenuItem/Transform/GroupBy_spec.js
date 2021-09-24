import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import GroupBy from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/GroupBy';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('GroupBy', () => {
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
    const onBlurInput = jest.fn();
    const changeInput = jest.fn();
    const hangeValueChange = jest.fn();
    const wrapper = mount(
      <GroupBy
        nodeData={nodeData}
        nodeParents={nodeParents}
        setSelectFinish={setSelectFinish}
        data={data}
        setData={setData}
        setFocusNode={setFocusNode}
        schemaLoading={schemaLoading}
        setNodeChange={setNodeChange}
        onValuesChange={hangeValueChange}
        onBlur={onBlurInput}
        onChange={changeInput}
      />,
    ); // mount/render/shallow when applicable

    const temp = {
      target: {
        value: 'test',
      },
    };
    const allValues = {
      payload: [
        {
          column: 'test',
          aggregate: 'test',
          newColumn: 'test',
        },
      ],
    };
    const changeDataflow = { column: 'test' };
    const changeAggregate = { aggregate: 'test' };
    const changeNewColumn = { newColumn: 'test' };
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeDataflow, allValues);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeAggregate, allValues);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeNewColumn, allValues);
    wrapper.find('[data-test="groupByInput"]').first().props().onChange(temp);
    wrapper.find('[data-test="groupByInput"]').first().props().onBlur();
    expect(wrapper.find('.GroupBy')).toExist();
  });
});
