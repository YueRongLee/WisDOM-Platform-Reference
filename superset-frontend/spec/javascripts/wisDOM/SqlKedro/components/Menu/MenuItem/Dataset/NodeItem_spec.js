import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import NodeItem from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Dataset/NodeItem';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('DatasetNodeItem NodeItem', () => {
  it('is valid', () => {
    const defaultTable = {
      nodes: [
        {
          id: 'test',
          args: {
            classification: 'test',
          },
        },
      ],
    };
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
    const setSchema = jest.fn();
    const setSelectPage = jest.fn();
    const setInputClick = jest.fn();
    const handleValidate = jest.fn();
    const handleSelectNodeType = jest.fn();
    const wrapper = mount(
      <NodeItem
        nodeData={nodeData}
        data={data}
        defaultTable={defaultTable}
        setSchema={setSchema}
        setSelectPage={setSelectPage}
        onFocus={setInputClick}
        onBlur={handleValidate}
        onChange={handleSelectNodeType}
      />,
    ); // mount/render/shallow when applicable
    wrapper.find('[data-test="name"]').first().props().onFocus();
    wrapper.find('[data-test="name"]').first().props().onBlur();
    wrapper.find('[data-test="nodetype"]').first().props().onChange('dataset');
    expect(wrapper.find('.node-wrapper')).toExist();
  });

  it('is handleSelectDataSet valid', () => {
    const defaultTable = {
      nodes: [
        {
          id: 'test',
          args: {
            classification: 'test',
          },
        },
      ],
    };
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
    const setSchema = jest.fn();
    const setSelectPage = jest.fn();
    const setInputClick = jest.fn();
    const handleValidate = jest.fn();
    const handleSelectDataSet = jest.fn();
    const wrapper = mount(
      <NodeItem
        nodeData={nodeData}
        data={data}
        defaultTable={defaultTable}
        setSchema={setSchema}
        setSelectPage={setSelectPage}
        onFocus={setInputClick}
        onBlur={handleValidate}
        onChange={handleSelectDataSet}
      />,
    ); // mount/render/shallow when applicable

    wrapper
      .find('[data-test="datasetOption"]')
      .first()
      .props()
      .onChange('dataset');
    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
