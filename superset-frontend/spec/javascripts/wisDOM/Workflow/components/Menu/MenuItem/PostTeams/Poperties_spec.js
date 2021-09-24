import React from 'react';
import { mount } from 'enzyme';
import PostTeamsPoperties from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/PostTeams/Poperties';

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
    const setVisible = jest.fn();
    const setTeamsData = jest.fn();
    const wrapper = mount(
      <PostTeamsPoperties
        nodeData={nodeData}
        data={data}
        setVisible={setVisible}
        setTeamsData={setTeamsData}
      />,
    );
    wrapper.find('[data-test="channelUrl"]').first().props().onBlur();
    wrapper.find('[data-test="copyBtnUrl"]').first().props().onBlur();
    wrapper.find('[data-test="InfoCircleOutlined"]').first().props().onClick();
    expect(wrapper.find('.formListBlock')).toExist();
  });
});
