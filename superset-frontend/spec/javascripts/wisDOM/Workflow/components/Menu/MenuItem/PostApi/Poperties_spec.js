import React from 'react';
import { mount } from 'enzyme';
import PostApiPoperties from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/PostApi/Poperties';

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
    const workflowSeqId = '123';
    document.execCommand = jest.fn();
    const wrapper = mount(
      <PostApiPoperties
        nodeData={nodeData}
        data={data}
        workflowSeqId={workflowSeqId}
      />,
    );
    wrapper.find('[data-test="copyBtnPostAPI"]').first().props().onClick();
    wrapper.find('[data-test="copyBtnUrl"]').first().props().onClick();
    expect(wrapper.find('.postAPI')).toExist();
  });
});
