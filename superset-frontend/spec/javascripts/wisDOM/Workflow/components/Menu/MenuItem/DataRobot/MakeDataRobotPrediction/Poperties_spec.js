import React from 'react';
import { mount } from 'enzyme';
import MakeDataRobotPrediction from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/DataRobot/MakeDataRobotPrediction/Poperties';

jest.mock('@baic/sql-editor', () => jest.fn(() => <div />));
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
          full_name: 'new_Node',
          id: 'test',
          name: 'new_Node',
          type: 'Action',
          args: {
            name: 'new_Node',
            type: 'action',
            classification: 'makeDataRobotPrediction',
            dataflowId: 123,
            output: 'OUTPUTCDM',
            projectId: '60c0622e1b9fa0a0d4cc3bfb',
            modelId: 'test',
            modelType: 'AVG Blender',
            modelNumber: 45,
            targetMapping: [
              {
                nodeId: 'test',
                nodeName: 'test',
                tableName: 'minny',
                duplicateStatus: 'success',
                checkbox: true,
              },
            ],
          },
        },
      ],
    };
    const temp = {
      target: {
        value: 'test',
      },
    };

    const onBlurProjectId = jest.fn();
    const handlePreview = jest.fn();
    const hangeValueChange = jest.fn();
    const setSelectFinish = jest.fn();
    const setFocusNode = jest.fn();
    const setData = jest.fn();
    const changeDataflow = { dataflow: 'test2' };
    const cLocation = { location: 'WisDom Deliver(Local)' };
    const cLocation2 = { location: 'WisDom Deliver(Cloud)' };
    const cLocation3 = { location: 'test' };
    const cStorageType = { storageType: 'Microsoft CDM' };
    const cStorageType2 = { storageType: 'Database' };
    const cStorageType3 = { storageType: 'WisDOM Temp Dataset' };
    const cColumns = { columns: { checkbox: true } };
    const cColumns2 = { columns: { tableName: 'test' } };
    const cDatabase = { database: 'Wisdom' };

    const wrapper = mount(
      <MakeDataRobotPrediction
        dataflowList={dataflowList}
        setSelectFinish={setSelectFinish}
        setFocusNode={setFocusNode}
        setData={setData}
        nodeData={nodeData}
        data={data}
        onBlur={onBlurProjectId}
        onClick={handlePreview}
        onValuesChange={hangeValueChange}
      />,
    );
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(cDatabase);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeDataflow);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(cLocation);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(cLocation2);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(cLocation3);

    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(cStorageType3);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(cStorageType);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(cStorageType2);

    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(cColumns);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(cColumns2);

    wrapper.find('[data-test="projectID"]').first().props().onBlur(temp);
    wrapper.find('[data-test="previewBtn"]').first().props().onClick();
    expect(wrapper.find('.node-wrapper')).toExist();
  });

  it('is valid onBlurTableName', () => {
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
            classification: 'makeDataRobotPrediction',
            dataflowId: 123,
            output: 'OUTPUTEXCEL',
            projectId: '60c0622e1b9fa0a0d4cc3bfb',
            targetMapping: [
              {
                nodeId: 'test',
                nodeName: 'test',
                tableName: 'minny',
                duplicateStatus: 'error',
                checkbox: true,
              },
              {
                nodeId: 'test',
                nodeName: 'test',
                tableName: 'minny',
                duplicateStatus: 'success',
                checkbox: true,
              },
            ],
          },
        },
      ],
    };

    const onBlurTableName = jest.fn();

    const wrapper = mount(
      <MakeDataRobotPrediction
        dataflowList={dataflowList}
        nodeData={nodeData}
        data={data}
        onBlur={onBlurTableName}
      />,
    );

    wrapper
      .find('[data-test="tableNameInputValue"]')
      .first()
      .props('tableNameInputValue')
      .onBlur();
    expect(onBlurTableName).toHaveBeenCalledTimes(0);

    wrapper.find('[data-test="tableNameInputValue"]').first().props().onBlur();
    expect(wrapper.find('.node-wrapper')).toExist();
  });

  it('is valid OUTPUTWDL', () => {
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
            classification: 'makeDataRobotPrediction',
            dataflowId: 123,
            output: 'OUTPUTWTD',
            projectId: '60c0622e1b9fa0a0d4cc3bfb',
            targetMapping: [
              {
                nodeId: 'test',
                nodeName: 'test',
                tableName: 'minny',
                duplicateStatus: 'error',
                checkbox: true,
              },
              {
                nodeId: 'test',
                nodeName: 'test',
                tableName: 'minny',
                duplicateStatus: 'success',
                checkbox: false,
              },
            ],
          },
        },
      ],
    };

    const onBlurTableName = jest.fn();

    const wrapper = mount(
      <MakeDataRobotPrediction
        dataflowList={dataflowList}
        nodeData={nodeData}
        data={data}
        onBlur={onBlurTableName}
      />,
    );

    wrapper
      .find('[data-test="tableNameInputValue"]')
      .first()
      .props('tableNameInputValue')
      .onBlur();
    expect(onBlurTableName).toHaveBeenCalledTimes(0);

    wrapper.find('[data-test="tableNameInputValue"]').first().props().onBlur();
    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
