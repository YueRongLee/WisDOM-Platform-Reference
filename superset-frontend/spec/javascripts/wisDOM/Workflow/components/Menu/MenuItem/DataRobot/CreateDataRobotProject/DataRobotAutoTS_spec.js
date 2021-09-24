import React from 'react';
import { mount } from 'enzyme';
import DataRobotAutoTS from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/DataRobot/CreateDataRobotProject/DataRobotAutoTS';

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
            projectName: 'project123',
            shareUser: ['DATAROBOT1@wistron.com'],
            targetList: ['Target1623981360510'],
            triggerAutoML: true,
            dataRobotType: 'dataRobotAutoTS',
            triggerTimeSeries: true,
            autoTSData: {
              target: 'new_case',
              mertic: 'Rate@TopTenth%',
              datetimeColumn: 'bornDate',
              recommendation: true,
              featureStart: -1,
              featureEnd: 0,
              forecastStart: 1,
              forecastEnd: 2,
              enableHoldout: false,
              holdoutDate: ['2021/07/28', '2021/07/30'],
              backTestNum: 2,
              backTestList: [
                {
                  primaryDate: ['2021/07/21', '2021/07/22'],
                  validationDate: ['2021/07/22', '2021/07/24'],
                },
                {
                  primaryDate: ['2021/07/24', '2021/07/25'],
                  validationDate: ['2021/07/26', '2021/07/27'],
                },
              ],
            },
          },
        },
      ],
    };

    const dataRobotTarget = {
      schema: [
        { name: 'test', type: 'string' },
        { name: 'test2', type: 'string' },
        { name: 'date', type: 'date' },
      ],
    };

    const changeTarget = { target: 'test' };
    const changeFStart = { featureStart: -2 };
    const changeFEnd = { featureEnd: -1 };
    const changeforecastStart = { forecastStart: 2 };
    const changeforecastEnd = { forecastEnd: 3 };
    const changeHoldout = { enableHoldout: false };
    const changeDatetimeColumn = { datetimeColumn: 'test' };
    const changeR = { recommendation: true };
    const changeHoldoutDate = { holdoutDate: ['2021/07/29', '2021/07/30'] };
    const changePayload = {
      payload: [
        {
          primaryDate: ['2021/07/21', '2021/07/22'],
          validationDate: ['2021/07/22', '2021/07/24'],
        },
        {
          primaryDate: ['2021/07/21', '2021/07/22'],
          validationDate: ['2021/07/22', '2021/07/24'],
        },
      ],
    };

    const hangeValueChange = jest.fn();
    const hangeOnChange = jest.fn();
    const setShowHoldout = jest.fn();
    const wrapper = mount(
      <DataRobotAutoTS
        nodeData={nodeData}
        data={data}
        dataRobotTarget={dataRobotTarget}
        onValuesChange={hangeValueChange}
        onChange={hangeOnChange}
        setShowHoldout={setShowHoldout}
      />,
    );

    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeTarget);

    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeFStart);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeFEnd);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeforecastStart);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeforecastEnd);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeHoldout);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeDatetimeColumn);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeR);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeHoldoutDate);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changePayload);

    wrapper
      .find('[data-test="rangePickerValueChange"]')
      .first()
      .props()
      .onChange('2021/07/21', '2021/07/21');

    wrapper
      .find('[data-test="rangePickerValueChange"]')
      .first()
      .props()
      .onChange('2021/07/21', '2021/07/21');

    wrapper
      .find('[data-test="rangePickerHoldDateChange"]')
      .first()
      .props()
      .onChange('2021/07/21', '2021/07/21');

    expect(hangeOnChange).toHaveBeenCalledTimes(0);
    expect(hangeValueChange).toHaveBeenCalledTimes(0);
    expect(hangeValueChange).toBeTruthy();
    expect(wrapper.find('.node-wrapper')).toExist();
  });

  it('is No TS Data,view mode', () => {
    const nodeData = {
      name: 'test',
      type: 'Action',
      id: 'test',
      edit: false,
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
            projectName: 'project123',
            shareUser: ['DATAROBOT1@wistron.com'],
            targetList: ['Target1623981360510'],
            triggerAutoML: true,
            dataRobotType: 'dataRobotAutoTS',
            triggerTimeSeries: true,
          },
        },
      ],
    };

    const dataRobotTarget = {
      schema: [
        { name: 'test', type: 'string' },
        { name: 'test2', type: 'string' },
        { name: 'date', type: 'date' },
      ],
    };

    const changeNothing = { test: 'test' };
    const hangeValueChange = jest.fn();

    const wrapper = mount(
      <DataRobotAutoTS
        nodeData={nodeData}
        data={data}
        dataRobotTarget={dataRobotTarget}
        onValuesChange={hangeValueChange}
      />,
    );

    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeNothing);

    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
