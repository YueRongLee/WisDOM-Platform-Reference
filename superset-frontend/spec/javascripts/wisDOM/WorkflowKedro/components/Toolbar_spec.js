import React from 'react';
import { mount, shallow } from 'enzyme';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Toolbar from 'src/wisDOM/components/WorkflowKedro/components/Toolbar/Toolbar';

describe('wisDOM App', () => {
  it('is valid handleZoomIn', () => {
    const handleZoomIn = jest.fn();
    const setZoomSize = jest.fn();
    const selectNode = 'Trigger123';
    const focusNode = {
      id: 'Trigger123',
    };
    render(
      <Toolbar
        onClick={handleZoomIn}
        setZoomSize={setZoomSize}
        selectNode={selectNode}
        focusNode={focusNode}
      />,
    );
    fireEvent.click(screen.getByTitle('Zoom In'), { button: 1 });
    expect(handleZoomIn).toHaveBeenCalledTimes(0);

    const wrapper = mount(<Toolbar />);
    expect(wrapper.find('.bar-btn')).toExist();
  });

  it('is valid handleZoomOut', () => {
    const handleZoomOut = jest.fn();
    const setZoomSize = jest.fn();
    render(<Toolbar onClick={handleZoomOut} setZoomSize={setZoomSize} />);
    fireEvent.click(screen.getByTitle('Zoom Out'), { button: 1 });
    expect(handleZoomOut).toHaveBeenCalledTimes(0);

    const wrapper = mount(<Toolbar />);
    expect(wrapper.find('.bar-btn')).toExist();
  });

  it('is valid handleAdd', () => {
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
    const handleAdd = jest.fn();
    const setSelectFinish = jest.fn();
    const setData = jest.fn();
    const setFocusNode = jest.fn();

    const selectNode = '123456';

    const wrapper = shallow(
      <Toolbar
        nodeData={nodeData}
        data={data}
        onClick={handleAdd}
        setSelectFinish={setSelectFinish}
        setData={setData}
        setFocusNode={setFocusNode}
        selectNode={selectNode}
      />,
    );
    wrapper.find('[data-test="addNode"]').props().onClick();
    expect(handleAdd).toHaveBeenCalledTimes(0);
    expect(wrapper.find('.bar-btn')).toExist();
  });

  it('is valid handResume', () => {
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
    const handResume = jest.fn();
    const setSelectFinish = jest.fn();
    const setData = jest.fn();
    const setResetShowData = jest.fn();

    const wrapper = shallow(
      <Toolbar
        nodeData={nodeData}
        data={data}
        onClick={handResume}
        setSelectFinish={setSelectFinish}
        setData={setData}
        setResetShowData={setResetShowData}
      />,
    );

    wrapper.find('[data-test="resume"]').props().onClick();
    expect(handResume).toHaveBeenCalledTimes(0);
    expect(wrapper.find('.bar-btn')).toExist();
  });

  it('is valid Delete Node', () => {
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
            classification: 'condition',
          },
        },
      ],
      edges: [],
    };
    const setFocusNode = jest.fn();
    const handleDelete = jest.fn();
    const setSelectFinish = jest.fn();

    const setData = jest.fn();
    const selectNode = 'Trigger';
    const focusNode = {
      id: 'test',
      type: 'Action',
    };

    const wrapper = shallow(
      <Toolbar
        nodeData={nodeData}
        data={data}
        onClick={handleDelete}
        setSelectFinish={setSelectFinish}
        setData={setData}
        selectNode={selectNode}
        focusNode={focusNode}
        setFocusNode={setFocusNode}
      />,
    );
    wrapper.find('[data-test="deleteNode"]').props().onClick();
    expect(handleDelete).toHaveBeenCalledTimes(0);
    expect(wrapper.find('.bar-btn')).toExist();
  });

  it('is valid Delete Node focusNode', () => {
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
            classification: 'condition',
          },
        },
      ],
      edges: [],
    };
    const setFocusNode = jest.fn();
    const handleDelete = jest.fn();
    const setSelectFinish = jest.fn();
    const setData = jest.fn();
    const disableAddConditionNode = jest.fn();

    const selectNode = 'Trigger';
    const focusNode = {
      id: 'test',
      type: 'test',
    };

    const wrapper = shallow(
      <Toolbar
        nodeData={nodeData}
        data={data}
        onClick={handleDelete}
        setSelectFinish={setSelectFinish}
        setData={setData}
        selectNode={selectNode}
        focusNode={focusNode}
        setFocusNode={setFocusNode}
        disableAddConditionNode={disableAddConditionNode}
      />,
    );
    wrapper.find('[data-test="deleteNode"]').props().onClick();
    expect(handleDelete).toHaveBeenCalledTimes(0);
    expect(wrapper.find('.bar-btn')).toExist();
  });
});
