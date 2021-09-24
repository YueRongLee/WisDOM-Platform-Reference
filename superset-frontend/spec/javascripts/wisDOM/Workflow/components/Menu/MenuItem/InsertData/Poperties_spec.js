import React from 'react';
import { mount } from 'enzyme';
import InsertDataPoperties from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/InsertData/Poperties';

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
          check: undefined,
          args: {
            output: '',
            dataflowId: '123',
            classification: 'test',
            targetMapping: [
              {
                nodeId: 123,
                nodeName: '123',
                tableName: '123',
                duplicateStatus: false,
                checkbox: false,
              },
              {
                nodeId: 456,
                nodeName: '456',
                tableName: '456',
                duplicateStatus: false,
                checkbox: true,
              },
            ],
          },
        },
      ],
    };
    const dataflowList = [
      {
        key: '123',
        value: '123',
      },
    ];

    const changeValue = {
      dataflow: '123',
    };

    const setOutputType = jest.fn();
    const setSelectFinish = jest.fn();
    const setData = jest.fn();
    const setFocusNode = jest.fn();
    const setMenuLoading = jest.fn();
    const closeModal = jest.fn();
    const openModal = jest.fn();
    const setOnBlurData = jest.fn();
    const hangeValueChange = jest.fn();
    const onBlurTableName = jest.fn();
    const handlePreview = jest.fn();

    const wrapper = mount(
      <InsertDataPoperties
        nodeData={nodeData}
        data={data}
        setData={setData}
        setOutputType={setOutputType}
        setSelectFinish={setSelectFinish}
        dataflowLoading={false}
        seqId="123"
        menuLoading={false}
        closeModal={closeModal}
        openModal={openModal}
        setFocusNode={setFocusNode}
        setMenuLoading={setMenuLoading}
        setOnBlurData={setOnBlurData}
        dataflowList={dataflowList}
        onValuesChange={hangeValueChange}
        onBlur={() => onBlurTableName}
        onClick={() => handlePreview}
      />,
    );
    expect(wrapper.find('.node-wrapper')).toExist();
    expect(wrapper.find('.field-box')).toExist();
    expect(wrapper.find('.field-box-list-container')).toExist();

    wrapper.find('[data-test="previewBtn"]').first().props().onClick();

    wrapper
      .find('[data-test="tableNameInputValue"]')
      .first()
      .props('tableNameInputValue')
      .onBlur();
    expect(onBlurTableName).toHaveBeenCalledTimes(0);

    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeValue);
    expect(hangeValueChange).toHaveBeenCalledTimes(0);
    expect(hangeValueChange).toBeTruthy();
  });
});
