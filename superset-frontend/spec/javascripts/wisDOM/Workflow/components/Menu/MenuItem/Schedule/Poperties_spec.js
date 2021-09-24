import React from 'react';
import { mount, shallow } from 'enzyme';
import SchedulePoperties from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/Schedule/Poperties';
import { setHookState } from '../../../../../../../helpers/hook';

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
    React.useState = setHookState({
      selectDate: 'Interval',
    });
    const changedValues = {
      Date: '1123',
    };
    const setUItoValue = jest.fn();
    const handleGetCron = jest.fn();
    const wrapper = shallow(
      <SchedulePoperties
        selectDate="Interval"
        nodeData={nodeData}
        data={data}
        changedValues={changedValues}
        setUItoValue={setUItoValue}
        handleGetCron={handleGetCron}
      />,
    );
    // wrapper.find('[data-test="cron"]').first().props('cron').onValuesChange();
    wrapper.find('[data-test="time"]').first().props('time').onBlur();
    expect(wrapper.find('.popertiesText')).toExist();
  });
});
