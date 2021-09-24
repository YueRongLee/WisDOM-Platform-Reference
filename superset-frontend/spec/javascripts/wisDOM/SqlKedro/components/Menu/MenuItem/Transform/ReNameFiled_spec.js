import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import { render } from '@testing-library/react';
import ReNameFiled from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/ReNameFiled';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('ReNameFiled', () => {
  it('is valid', () => {
    const nodeData = {
      name: 'test',
      type: 'test',
      id: 'test',
      edit: true,
    };
    const nodeParents = {
      type: 'Dataset',
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
    const addFilled = jest.fn();

    const wrapper = mount(
      <ReNameFiled
        nodeData={nodeData}
        nodeParents={nodeParents}
        data={data}
        setData={setData}
        setSelectFinish={setSelectFinish}
        setFocusNode={setFocusNode}
        setNodeChange={setNodeChange}
        schemaLoading={schemaLoading}
        onClick={addFilled}
      />,
    ); // mount/render/shallow when applicable

    wrapper.find('[data-test="addField"]').first().props().onClick();
    expect(addFilled).toHaveBeenCalledTimes(0);

    expect(wrapper.find('.ReNameFiled')).toExist();
  });

  it('is new name', () => {
    const nodeData = {
      name: 'test',
      type: 'test',
      id: 'test',
      edit: true,
    };
    const nodeParents = {
      type: 'Dataset',
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
    const onChangeInput = jest.fn();
    const onBlurInput = jest.fn();

    const wrapper = mount(
      <ReNameFiled
        nodeData={nodeData}
        nodeParents={nodeParents}
        data={data}
        setData={setData}
        setSelectFinish={setSelectFinish}
        setFocusNode={setFocusNode}
        setNodeChange={setNodeChange}
        schemaLoading={schemaLoading}
        onChange={onChangeInput}
        onBlur={onBlurInput}
      />,
    ); // mount/render/shallow when applicable
    const e = {
      target: {
        value: 123,
      },
    };
    wrapper.find('[data-test="newName"]').first().props().onChange(e, 1);
    wrapper.find('[data-test="newName"]').first().props().onBlur();
    expect(onChangeInput).toHaveBeenCalledTimes(0);

    expect(wrapper.find('.ReNameFiled')).toExist();
  });
});
