import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import renderer from 'react-test-renderer';
import RunPreviewKedro from 'src/wisDOM/components/FlowsComponent/RunPreviewKedro/RunPreviewKedro';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

// Enzyme.configure({ adapter: new Adapter() });

describe('RunPreviewKedro', () => {
  it('is valid', () => {
    const diagram = `{"edges":[],"nodes":[{"full_name":"Schedule_full_name","name":"Schedule...","id":"Trigger","type":"Trigger","args":{"type":"trigger","name":"schedule_trigger_1","cron":"0 04 * * *","classification":"schedule"}}]}`;
    const nodeInfo = [
      {
        dataflowHistoryId: '',
        dataflowRunId: 0,
        info: 'None',
        nextNode: [],
        nodeAction: 'schedule',
        nodeId: 'Trigger',
        nodeName: 'Schedule...',
        nodeType: 'Trigger',
        status: 'SUCCESS',
      },
    ];
    const wrapper = mount(
      <RunPreviewKedro diagram={diagram} nodeInfo={nodeInfo} />,
    ); // mount/render/shallow when applicable

    expect(wrapper.find('.dataflowListContainer')).toExist();
  });
});
