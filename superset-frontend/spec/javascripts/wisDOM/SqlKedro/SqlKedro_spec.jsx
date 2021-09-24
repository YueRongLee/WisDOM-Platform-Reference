import React from 'react';
import { mount } from 'enzyme';
import SqlKedro from 'src/wisDOM/components/SqlKedro/SqlKedro';
import { render, screen, fireEvent } from '@testing-library/react';
import Toolbar from 'src/wisDOM/components/SqlKedro/components/Toolbar/Toolbar';

// Enzyme.configure({ adapter: new Adapter() });
jest.mock(
  'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/Customize',
  () => jest.fn(() => <div />),
);

// describe('SqlKedro', () => {
//   it('is valid', () => {
//     const wrapper = mount(<SqlKedro />); // mount/render/shallow when applicable

//     expect(wrapper.find('.kedro-wrapper')).toExist();
//   });
// });

describe('WorkflowKedro shallow mount', () => {
  it('should call setSave when mount rendered', () => {
    const setMenuLoading = jest.fn(() => false);
    const setDiagram = jest.fn(() => []);
    const setFocusNode = jest.fn();
    const setNodeClickStatus = jest.fn();
    const setResetShowData = jest.fn();
    const setFinishDraw = jest.fn();
    const setSelectNodeId = jest.fn();
    const setNodeData = jest.fn();
    const setSelectFinish = jest.fn();
    const setChangeGroup = jest.fn();
    const handleResume = jest.fn();
    const focusNode = {
      id: '123',
      name: '123',
      type: 'transform',
      edit: true,
      args: { frontend: { showPwd: '' }, dbInfo: '123' },
    };
    const showData = { nodes: [focusNode], edges: [] };
    const getNode = { click: true, name: '123', id: '123' };

    const wrapper = mount(
      <SqlKedro
        dataFlowChangedGroupId="123"
        edit={false}
        setDiagram={setDiagram}
        sqlID="123"
        resetShowData
        setResetShowData={setResetShowData}
        changeGroupStatus
        setChangeGroup={setChangeGroup}
        historyMode
        projectName="123"
        diagram={showData}
        schedule="123456"
        handleResume={handleResume}
        // status參數
        getNode={getNode}
        setNodeData={setNodeData}
        oEntity={showData}
        showData={showData}
        setSelectFinish={setSelectFinish}
        setSelectNodeId={setSelectNodeId}
        setMenuLoading={setMenuLoading}
        setFocusNode={setFocusNode}
        focusNode={focusNode}
        setNodeClickStatus={setNodeClickStatus}
        setFinishDraw={setFinishDraw}
        selectNodeId="123"
      />,
    );

    expect(wrapper.find('.kedro-wrapper')).toExist();
    expect(setMenuLoading).toHaveBeenCalled();
    expect(setDiagram).toHaveBeenCalled();
    expect(setResetShowData).toHaveBeenCalled();
    expect(setFocusNode).toHaveBeenCalled();
    expect(setNodeData).toHaveBeenCalled();
    expect(setSelectFinish).toHaveBeenCalled();
    expect(setSelectNodeId).toHaveBeenCalled();
    expect(setNodeClickStatus).toHaveBeenCalled();
    expect(setFinishDraw).toHaveBeenCalled();

    expect(wrapper.find('.kedro-wrapper')).toExist();
  });
});

test('is valid handleAdd', () => {
  const handleAdd = jest.fn();
  const setSelectFinish = jest.fn();
  const setData = jest.fn();
  const setFocusNode = jest.fn();

  const selectNode = '123456';
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
  render(
    <Toolbar
      data={data}
      onClick={handleAdd}
      setSelectFinish={setSelectFinish}
      setData={setData}
      setFocusNode={setFocusNode}
      selectNode={selectNode}
    />,
  );
  fireEvent.click(screen.getByTitle('Add Node'), { button: 1 });
  expect(handleAdd).toHaveBeenCalledTimes(0);

  const wrapper = mount(<Toolbar />);
  expect(wrapper.find('.bar-btn')).toExist();
});
