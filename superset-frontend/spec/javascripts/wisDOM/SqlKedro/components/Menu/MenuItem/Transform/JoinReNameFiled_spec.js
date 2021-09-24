import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import JoinReNameFiled from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/JoinReNameFiled';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('JoinReNameFiled', () => {
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
      edges: [],
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
    const onClickResolve = jest.fn();
    const wrapper = mount(
      <JoinReNameFiled
        nodeData={nodeData}
        nodeParents={nodeParents}
        setSelectFinish={setSelectFinish}
        data={data}
        setData={setData}
        setFocusNode={setFocusNode}
        schemaLoading={schemaLoading}
        setNodeChange={setNodeChange}
        onClick={onClickResolve}
      />,
    ); // mount/render/shallow when applicable
    wrapper.find('[data-test="resolve"]').first().props().onClick();
    expect(wrapper.find('.JoinReNameFiled')).toExist();
  });
  it('is onBlur onChange', () => {
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
      edges: [],
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
    const onChangeInput = jest.fn();
    const onBlurInput = jest.fn();
    const wrapper = mount(
      <JoinReNameFiled
        nodeData={nodeData}
        nodeParents={nodeParents}
        setSelectFinish={setSelectFinish}
        data={data}
        setData={setData}
        setFocusNode={setFocusNode}
        schemaLoading={schemaLoading}
        setNodeChange={setNodeChange}
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
    expect(wrapper.find('.JoinReNameFiled')).toExist();
  });
});
