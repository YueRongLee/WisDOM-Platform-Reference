import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import ChangeFormat from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/ChangeFormat';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('ChangeFormat', () => {
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
    const add = jest.fn();
    const handleValueChange = jest.fn();

    const wrapper = mount(
      <ChangeFormat
        nodeData={nodeData}
        data={data}
        nodeParents={nodeParents}
        setSelectFinish={setSelectFinish}
        setData={setData}
        setFocusNode={setFocusNode}
        schemaLoading={schemaLoading}
        setNodeChange={setNodeChange}
        onClick={add}
        onValuesChange={handleValueChange}
      />,
    ); // mount/render/shallow when applicable
    wrapper.find('[data-test="add"]').first().props().onClick();
    wrapper.find('[data-test="wherepayload"]').first().props().onValuesChange();
    wrapper.find('[data-test="add"]').first().props().onClick();
    expect(wrapper.find('.formListBlock')).toExist();
  });
  it('is changeInput', () => {
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
    const handleValueChange = jest.fn();
    const removeItem = jest.fn();
    const changeInput = jest.fn();

    const wrapper = mount(
      <ChangeFormat
        nodeData={nodeData}
        data={data}
        nodeParents={nodeParents}
        setSelectFinish={setSelectFinish}
        setData={setData}
        setFocusNode={setFocusNode}
        schemaLoading={schemaLoading}
        setNodeChange={setNodeChange}
        onClick={removeItem}
        onValuesChange={handleValueChange}
        onBlur={changeInput}
      />,
    ); // mount/render/shallow when applicable
    wrapper.find('[data-test="delbutton"]').first().props().onClick();
    wrapper.find('[data-test="formatType"]').first().props().onBlur();
    expect(wrapper.find('.formListBlock')).toExist();
  });
});
