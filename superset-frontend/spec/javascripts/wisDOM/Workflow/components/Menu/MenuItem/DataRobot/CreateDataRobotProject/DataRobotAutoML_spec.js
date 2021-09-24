import React from 'react';
import { mount } from 'enzyme';
import DataRobotAutoML from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/DataRobot/CreateDataRobotProject/DataRobotAutoML';

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
            dataRobotType: 'dataRobotAutoML',
            triggerTimeSeries: false,
            autoMLData: {
              target: 'test',
              mertic: 'Rate@TopTenth%',
              recommendation: false,
              holdoutPercentage: 20,
              partition: 'RandomCV',
              reps: 5,
              validationPCT: undefined,
              workerCount: -1,
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

    const changeRecommendation = { recommendation: true };
    const changeTarget = { target: 'test' };
    const changeHold = { holdoutPercentage: 21 };
    const changePT = { partition: 'RandomCV' };
    const changeReps = { reps: 6 };
    const changeV = { validationPCT: 19 };
    const changeW = { workerCount: 20 };

    const hangeValueChange = jest.fn();

    const wrapper = mount(
      <DataRobotAutoML
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
      .onValuesChange(changeHold);

    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeRecommendation);

    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeTarget);

    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changePT);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeReps);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeV);
    wrapper
      .find('[data-test="formValueChange"]')
      .first()
      .props()
      .onValuesChange(changeW);

    expect(hangeValueChange).toHaveBeenCalledTimes(0);
    expect(hangeValueChange).toBeTruthy();
    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
