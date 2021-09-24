import React from 'react';
import { mount } from 'enzyme';
import PowerBiPoperties from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/PowerBi/Poperties';
import { act } from 'react-dom/test-utils';
import { DataFlowApi, WorkFlowApi } from '~~apis/';

jest.mock(
  'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/Customize',
  () => jest.fn(() => <div />),
);

describe('wisDOM App', () => {
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
    const dataflowList = [
      {
        key: '123',
        value: '123',
      },
      {
        key: '456',
        value: '456',
      },
    ];

    const tempList = [
      {
        key: '123',
        value: '123',
      },
      {
        key: '456',
        value: '456',
      },
    ];
    const thisNode = {
      id: 'test',
      args: {
        classification: 'test',
        dataflowId: '123',
        templateId: '123',
        templateMapping: [],
      },
    };
    const setData = jest.fn(() => []);
    const setFocusNode = jest.fn();
    const setSelectFinish = jest.fn();
    const openModal = jest.fn();
    const closeModal = jest.fn();
    const setTemplateList = jest.fn(() => tempList);
    const FUNCTIONS = { GET_NODE_DETAIL: jest.fn(() => thisNode) };
    const handleSetDataArg = jest.fn();
    const setNewArg = {
      classification: 'test',
      dataflowId: '123',
      templateId: '123',
      templateMapping: [],
    };
    const wrapper = mount(
      <PowerBiPoperties
        nodeData={nodeData}
        data={data}
        setData={setData}
        setFocusNode={setFocusNode}
        setSelectFinish={setSelectFinish}
        dataflowList={dataflowList}
        dataflowLoading={false}
        closeModal={openModal}
        openModal={closeModal}
        setTemplateList={setTemplateList}
        tempList={tempList}
        FUNCTIONS={FUNCTIONS}
        findNode={[thisNode]}
        flowId="123"
        changeKey="dataflow"
        handleSetDataArg={handleSetDataArg(setNewArg)}
      />,
    );
    expect(wrapper).toExist();
    expect(setFocusNode).toHaveBeenCalledTimes(0);
    expect(setSelectFinish).toHaveBeenCalledTimes(0);

    const mockgetPowerBiTableList = Promise.resolve([
      {
        dataset: 'target1',
        column: 'age',
        description: '132456',
      },
    ]);
    const mockgetTargetNode = Promise.resolve([
      {
        id: '123',
        full_name: '123',
        schema: [{ key: '123', type: 'string' }],
      },
    ]);
  });

  const mockgetPowerBiTableList = Promise.resolve([
    {
      dataset: 'target1',
      column: 'age',
      description: '132456',
    },
  ]);
  const mockgetTargetNode = Promise.resolve([
    {
      id: '123',
      full_name: '123',
      schema: [{ key: '123', type: 'string' }],
    },
  ]);
  it('should call getPowerBiTableList api', async () => {
    expect(WorkFlowApi.getPowerBiTableList).toHaveBeenCalledTimes(1);
    await act(() => mockgetPowerBiTableList);
  });

  it('should call getTargetNode api', async () => {
    expect(DataFlowApi.getTargetNode).toHaveBeenCalledTimes(1);
    await act(() => mockgetTargetNode);
  });
});
