import React from 'react';
import { mount } from 'enzyme';
import CreateDataRobotProject from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/DataRobot/CreateDataRobotProject/Poperties';

jest.mock('@baic/sql-editor', () => jest.fn(() => <div />));

describe('wisDOM App', () => {
  it('is valid', () => {
    const nodeData = {
      name: 'test',
      type: 'Action',
      id: 'test',
      edit: true,
    };
    const data = {
      nodes: [
        {
          full_name: 'new_Node',
          id: 'test',
          name: 'new_Node',
          type: 'Action',
          args: {
            name: 'new_Node',
            type: 'action',
            classification: 'createDataRobotProject',
            dataflowId: 123,
            output: 'OUTPUTCDM',
            projectName: 'test',
            shareUser: 'test',
            targetList: ['Target1623981360510'],
            triggerAutoML: true,
            dataRobotType: 'dataRobotAutoML',
            triggerTimeSeries: false,
          },
        },
      ],
    };

    const temp = {
      target: {
        value: 'test',
      },
    };

    const dataflowList = [
      {
        Key: 123,
        value: 'test',
      },
      {
        Key: 456,
        value: 'test2',
      },
    ];

    const changeDataflow = { dataflow: 'test2' };
    const changeTarget = { target: 'test' };
    const changeShare = { share: 'test' };
    const selectData = [
      {
        key: 123,
        value: 'test',
        label: 'test2',
        schema: [{ name: 'test', type: 'string' }],
      },
      {
        key: 456,
        value: 'test2',
        label: 'test2',
        schema: [
          { name: 'test', type: 'string' },
          { name: 'date', type: 'Date' },
        ],
      },
    ];

    const onBlurProjectName = jest.fn();
    const handlePreview = jest.fn();
    const hangeValueChange = jest.fn();
    const handleSelectTarget = jest.fn();
    const setSelectFinish = jest.fn();
    const setData = jest.fn();
    const setFocusNode = jest.fn();
    const setNodeChange = jest.fn();
    const setDataRobotTarget = jest.fn();
    const openModal = jest.fn();
    const closeModal = jest.fn();
    const setOutputType = jest.fn();
    const setTargetList = jest.fn();

    const wrapper = mount(
      <CreateDataRobotProject
        dataflowLoading={false}
        menuLoading={false}
        openModal={openModal}
        closeModal={closeModal}
        setSelectFinish={setSelectFinish}
        setFocusNode={setFocusNode}
        setNodeChange={setNodeChange}
        setDataRobotTarget={setDataRobotTarget}
        setData={setData}
        nodeData={nodeData}
        data={data}
        onBlur={onBlurProjectName}
        onClick={handlePreview}
        onValuesChange={hangeValueChange}
        onChange={handleSelectTarget}
        setOutputType={setOutputType}
        setTargetList={setTargetList}
        dataflowList={dataflowList}
      />,
    );
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeDataflow);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeTarget);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeShare);
    wrapper.find('[data-test="projectNameInput"]').first().props().onBlur(temp);
    wrapper.find('[data-test="previewBtn"]').first().props().onClick();
    wrapper
      .find('[data-test="selectChange"]')
      .first()
      .props()
      .onChange('test', selectData);
    // wrapper
    //   .find('[data-test="selectChange"]')
    //   .first()
    //   .props()
    //   .onChange(['test'], selectData);
    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
