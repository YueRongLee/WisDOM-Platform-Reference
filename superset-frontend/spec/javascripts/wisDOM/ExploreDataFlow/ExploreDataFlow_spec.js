import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import Adapter from 'enzyme-adapter-react-16';
// import renderer from 'react-test-renderer';
import ExploreDataFlow from 'src/wisDOM/components/ExploreDataFlow/ExploreDataFlow';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';
// import { DataFlowApi, TableApi } from '~~apis/';
// Enzyme.configure({ adapter: new Adapter() });

// const mountMain = () => mount(<ExploreDataFlow resetShowData sqlID="123" />);
// const runDataFlowData = Promise.resolve(true);
// const getAllowedTableColumnsData = Promise.resolve({
//   lastUpdateTime: 10000012313,
// });

// jest.mock('~~apis/DataFlowApi', () => ({
//   runDataFlow: jest.fn(() => runDataFlowData),
// }));

// jest.mock('~~apis/TableApi', () => ({
//   getAllowedTableColumns: jest.fn(() => getAllowedTableColumnsData),
// }));

// test('should call runDataFlow api', async () => {
//   mountMain();
//   expect(DataFlowApi.runDataFlow).toHaveBeenCalledTimes(1);
//   await act(() => runDataFlowData);
// });

// test('should call getAllowedTableColumns api', async () => {
//   mountMain();
//   expect(TableApi.getAllowedTableColumns).toHaveBeenCalledTimes(1);
//   await act(() => getAllowedTableColumnsData);
// });

jest.mock(
  'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/Customize',
  () => jest.fn(() => <div />),
);

describe('ExploreDataFlow', () => {
  it('is valid', () => {
    const selectGroupObject = {
      groupId: '123',
    };
    const wrapper = shallow(
      <ExploreDataFlow selectGroupObject={selectGroupObject} />,
    ); // mount/render/shallow when applicable

    expect(wrapper.find('.dataflow-exploreContainer')).toExist();
  });
});

describe('WorkflowKedro mount', () => {
  it('should call setSave when mount rendered', () => {
    const selectGroupObject = {
      groupId: '123',
    };
    const selectedGroup = '123';
    const setFinishDraw = jest.fn();
    const setSelectedColumns = jest.fn();
    const selectedColumns = [
      {
        id: '123',
        name: '123',
        type: 'transform',
        edit: true,
      },
    ];
    const groupList = [{ groupId: '123' }];

    const setDiagram = jest.fn();
    const setSeqId = jest.fn();
    const setSaveOrRunLoading = jest.fn();
    const setDataFlowGroupId = jest.fn();
    const setCronLoading = jest.fn();
    const setCronValue = jest.fn();
    const setGetUIValue = jest.fn();
    const setResetShowData = jest.fn();
    const setChangeGroup = jest.fn();
    const setEntity = jest.fn();

    mount(
      <ExploreDataFlow
        save
        groupList={groupList}
        selectGroupObject={selectGroupObject}
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
        setFinishDraw={setFinishDraw}
        selectedGroup={selectedGroup}
        sqlID="123"
        selectNodeId="123"
        edit={false}
        historyMode
        setDiagram={setDiagram}
        setSeqId={setSeqId}
        setSaveOrRunLoading={setSaveOrRunLoading}
        setDataFlowGroupId={setDataFlowGroupId}
        setCronLoading={setCronLoading}
        setCronValue={setCronValue}
        setGetUIValue={setGetUIValue}
        setResetShowData={setResetShowData}
        setChangeGroup={setChangeGroup}
        setEntity={setEntity}
      />,
    );
    expect(setFinishDraw).toHaveBeenCalledTimes(0);
  });
});
