import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import ImportModal from 'src/wisDOM/components/ImportModal/ImportModal';

describe('wisDOM App', () => {
  it('is valid', () => {
    const modal = {
      visible: true,
    };
    const wrapper = mount(<ImportModal modal={modal} />);
    expect(wrapper.find('.importModal')).toExist();
  });

  it('cancel', () => {
    const modal = {
      visible: true,
      closeModal: jest.fn(),
    };
    const handleBeforeLeave = jest.fn();
    const setFileList = jest.fn();
    const setSchemaFileList = jest.fn();
    const setDataFileColumn = jest.fn();
    const setSchemaFileColumn = jest.fn();
    const handleFinish = jest.fn();
    const wrapper = mount(
      <ImportModal
        modal={modal}
        onClick={handleBeforeLeave}
        setFileList={setFileList}
        setSchemaFileList={setSchemaFileList}
        setDataFileColumn={setDataFileColumn}
        setSchemaFileColumn={setSchemaFileColumn}
        handleFinish={handleFinish}
      />,
    );
    wrapper.find('[data-test="cancel"]').first().props().onClick();
    wrapper.find('[data-test="import"]').first().props().onFinish();
  });

  it('schemafile', () => {
    const modal = {
      visible: true,
    };
    const handleSchemaChange = jest.fn();
    const handleBeforeUpload = jest.fn();
    const wrapper = mount(
      <ImportModal
        modal={modal}
        onChange={handleSchemaChange}
        handleBeforeUpload={handleBeforeUpload}
      />,
    );
    const file = {
      size: 10000,
    };

    const info = {
      fileList: [],
      file: {
        status: 'done',
      },
    };

    wrapper.find('[data-test="schemafile"]').first().props().beforeUpload(file);
    wrapper.find('[data-test="schemafile"]').first().props().onChange(info);
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
      <ImportModal modal={modal} onClick={copyUrl} document={document} />,
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
      <ImportModal modal={modal} onClick={copyGetItem} document={document} />,
    );

    wrapper.find('[data-test="copyGetItem"]').first().props().onClick();
    expect(wrapper.find('.copyBtn')).toExist();
  });
});
