import React from 'react';
import { mount } from 'enzyme';
import InsertDataSubPoperties from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/InsertData/SubPoperties';

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
            dbInfo: {
              host: '123',
              port: '123',
              dbType: '',
              database: '',
              userName: '123',
              password: '123',
            },
            frontend: {},
          },
        },
      ],
    };
    const changeValue = {
      password: '1234',
    };
    const changeValueH = {
      host: '1234',
    };
    const changeValueP = {
      port: '1234',
    };
    const changeValueDB = {
      dbType: '1234',
    };
    const changeValueD = {
      database: '1234',
    };
    const changeValueU = {
      userName: '1234',
    };

    const handleOnBlur = jest.fn();
    const handleTest = jest.fn();
    const hangeValueChange = jest.fn();

    const wrapper = mount(
      <InsertDataSubPoperties
        nodeData={nodeData}
        data={data}
        handleOnBlur={handleOnBlur}
        handleTest={handleTest}
        onValuesChange={hangeValueChange}
      />,
    );
    wrapper
      .find('[data-test="import"]')
      .first()
      .props()
      .onValuesChange(changeValue);

    wrapper
      .find('[data-test="import"]')
      .first()
      .props()
      .onValuesChange(changeValueH);

    wrapper
      .find('[data-test="import"]')
      .first()
      .props()
      .onValuesChange(changeValueP);

    wrapper
      .find('[data-test="import"]')
      .first()
      .props()
      .onValuesChange(changeValueDB);

    wrapper
      .find('[data-test="import"]')
      .first()
      .props()
      .onValuesChange(changeValueD);

    wrapper
      .find('[data-test="import"]')
      .first()
      .props()
      .onValuesChange(changeValueU);

    expect(hangeValueChange).toHaveBeenCalledTimes(0);
    wrapper.find('[data-test="host"]').first().props().onBlur();
    wrapper.find('[data-test="testConnect"]').first().props().onClick();
    expect(wrapper.find('.node-wrapper')).toExist();
  });

  it('is edit valid', () => {
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

    const handleEdit = jest.fn();
    const handleFinish = jest.fn();
    const wrapper = mount(
      <InsertDataSubPoperties
        nodeData={nodeData}
        data={data}
        handleEdit={handleEdit}
        handleFinish={handleFinish}
      />,
    );

    wrapper.find('[data-test="edit"]').first().props().onClick();
    wrapper.find('[data-test="import"]').first().props().onFinish();
    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
