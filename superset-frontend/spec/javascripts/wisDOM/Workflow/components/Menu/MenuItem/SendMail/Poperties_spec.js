import React from 'react';
import { mount, shallow } from 'enzyme';
import SendMailPoperties from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/SendMail/Poperties';

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
    const mailGroup = ['dafds@sdfs.com.tw'];
    const setMailData = jest.fn();

    const form = {
      onBlurMailGroup: jest.fn(),
      onBlurSubject: jest.fn(),
      handleValueChange: jest.fn(),
    };
    // const onBlurMailGroup = jest.spyOn(tempMail);
    const wrapper = shallow(
      <SendMailPoperties
        mailGroup={mailGroup}
        nodeData={nodeData}
        data={data}
        setMailData={setMailData}
        form={form}
      />,
    );
    // wrapper.find('[data-test="mailGroup"]').instance().onBlurMailGroup();
    wrapper.find('[data-test="subject"]').props('subject').onBlur();
    wrapper.find('[data-test="mailGroup"]').props('mailGroup').onBlur();
    wrapper.find('[data-test="content"]').props('content').onBlur();
    expect(wrapper.find('.formListBlock')).toExist();
  });
});
