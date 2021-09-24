import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import WorkflowKedro from 'src/wisDOM/components/WorkflowKedro/WorkflowKedro';
import { WorkFlowApi } from '~~apis/';

const setCreateNewWork = jest.fn();
const setDiagram = jest.fn();
const setResetShowData = jest.fn();
const mountMain = () =>
  mount(
    <WorkflowKedro
      resetShowData
      sqlID="123"
      setCreateNewWork={setCreateNewWork}
      setDiagram={setDiagram}
      setResetShowData={setResetShowData}
    />,
  );
const mockgetWorkFlowDetail = Promise.resolve([{ diagram: [] }]);

jest.mock('~~apis/WorkFlowApi', () => ({
  getWorkFlowDetail: jest.fn(() => mockgetWorkFlowDetail),
}));

test('should call getOriginalWorkFlowData api', async () => {
  mountMain();
  expect(WorkFlowApi.getWorkFlowDetail).toHaveBeenCalledTimes(1);
  await act(() => mockgetWorkFlowDetail);
});

jest.mock(
  'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/Customize',
  () => jest.fn(() => <div />),
);

jest.mock('@wisdom_dataplatform/wisdom-kedro-viz', () =>
  jest.fn(() => <div />),
);

describe('wisDOM workflowKedro', () => {
  it('is valid', () => {
    expect(
      React.isValidElement(
        <WorkflowKedro resetShowData sqlID="123" edit historyMode />,
      ),
    ).toBe(true);
  });
});

describe('WorkflowKedro mockUseEffect', () => {
  it('should call useEffect', () => {
    let useEffect;
    const mockUseEffect = () => {
      useEffect.mockImplementationOnce(f => f());
    };

    beforeEach(() => {
      useEffect = jest.spyOn(React, 'useEffect');
      mockUseEffect();
    });

    expect(mockUseEffect).toHaveBeenCalled();
  });
});

describe('WorkflowKedro shallow mount', () => {
  it('should call setSave when mount rendered', () => {
    const setSave = jest.fn(() => false);
    const setCreateNewWork = jest.fn(() => false);
    const setMenuLoading = jest.fn(() => false);
    const setDiagram = jest.fn(() => []);
    const setFocusNode = jest.fn();
    const setNodeClickStatus = jest.fn();
    const setResetShowData = jest.fn();
    const setFinishDraw = jest.fn();
    const setSelectNodeId = jest.fn();
    const setNodeData = jest.fn();
    const setSelectFinish = jest.fn();
    const focusNode = {
      id: '123',
      name: '123',
      type: 'transform',
      edit: true,
      args: { frontend: { showPwd: '' }, dbInfo: '123' },
    };
    const showData = { nodes: [focusNode], edges: [] };
    const getNode = { click: true };
    const wrapper = mount(
      <WorkflowKedro
        save
        getNode={getNode}
        setNodeData={setNodeData}
        oEntity={showData}
        showData={showData}
        setSave={setSave}
        setSelectFinish={setSelectFinish}
        setSelectNodeId={setSelectNodeId}
        setCreateNewWork={setCreateNewWork}
        setMenuLoading={setMenuLoading}
        setDiagram={setDiagram}
        setFocusNode={setFocusNode}
        focusNode={focusNode}
        setNodeClickStatus={setNodeClickStatus}
        setFinishDraw={setFinishDraw}
        resetShowData
        setResetShowData={setResetShowData}
        sqlID="123"
        selectNodeId="123"
        edit={false}
        historyMode
      />,
    );
    expect(setSave).toHaveBeenCalled();
    expect(setCreateNewWork).toHaveBeenCalled();
    expect(setMenuLoading).toHaveBeenCalled();
    expect(setDiagram).toHaveBeenCalled();
    expect(setResetShowData).toHaveBeenCalled();
    expect(setFocusNode).toHaveBeenCalled();
    expect(setNodeData).toHaveBeenCalled();
    expect(setSelectFinish).toHaveBeenCalled();
    expect(setSelectNodeId).toHaveBeenCalled();
    expect(setNodeClickStatus).toHaveBeenCalled();
    expect(setFinishDraw).toHaveBeenCalled();
    expect(wrapper.find('.workflow-kedro-wrapper')).toExist();
  });
});
