import React from 'react';
import { mount } from 'enzyme';
import UploadModal from 'src/wisDOM/components/UploadModal/UploadModal';

describe('wisDOM App', () => {
  it('is valid', () => {
    const modal = {
      visible: true,
    };
    const wrapper = mount(<UploadModal modal={modal} />);
    expect(wrapper.find('.linkbutton')).toExist();
    expect(wrapper.find('.copyBtn')).toExist();
  });
  it('is beforeLeave valid', () => {
    const modal = {
      visible: true,
    };
    const handleBeforeLeave = jest.fn();
    const wrapper = mount(
      <UploadModal modal={modal} handleBeforeLeave={handleBeforeLeave} />,
    );
    wrapper.find('[data-test="beforeLeave"]').first().props().onClick();
    expect(wrapper.find('.copyBtn')).toExist();
  });
  it('is beforeUpload valid', () => {
    const modal = {
      visible: true,
    };
    const handleBeforeUpload = jest.fn();
    const handleChange = jest.fn();
    const wrapper = mount(
      <UploadModal
        modal={modal}
        handleBeforeUpload={handleBeforeUpload}
        handleChange={handleChange}
      />,
    );
    wrapper.find('[data-test="uploadFile"]').first().props().beforeUpload();
    wrapper.find('[data-test="uploadFile"]').first().props().onChange();
    expect(wrapper.find('.copyBtn')).toExist();
  });
  it('copyBtn', () => {
    const modal = {
      visible: true,
    };
    const copyUrl = jest.fn();

    const file = {
      size: 10000,
    };

    const info = {
      fileList: [],
      file: {
        status: 'done',
      },
    };

    const document = {
      execCommand: jest.fn(),
    };

    const wrapper = mount(
      <UploadModal modal={modal} onClick={copyUrl} document={document} />,
    );

    wrapper.find('[data-test="copyBtn"]').first().props().onClick();
    expect(wrapper.find('.copyBtn')).toExist();
  });

  it('copyGetItem', () => {
    const modal = {
      visible: true,
    };

    const copyGetItem = jest.fn();

    const file = {
      size: 10000,
    };

    const info = {
      fileList: [],
      file: {
        status: 'done',
      },
    };

    const document = {
      execCommand: jest.fn(),
    };

    const wrapper = mount(
      <UploadModal modal={modal} onClick={copyGetItem} document={document} />,
    );

    wrapper.find('[data-test="copyGetItem"]').first().props().onClick();
    expect(wrapper.find('.copyBtn')).toExist();
  });
});
