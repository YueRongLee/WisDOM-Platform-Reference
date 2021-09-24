import React from 'react';
import { mount } from 'enzyme';
import Sub2Poperties from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/PowerBi/Sub2Poperties';
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
            dataflowId: 'test',
            logicalOperator: 'and',
            powerBiCondition: [
              {
                target: 'test',
                aggregate: 'sum',
                operation: '>',
                columnName: 'test',
                value: '0',
              },
            ],
          },
        },
      ],
    };
    const targetList = [
      {
        name: '123',
        type: 'string',
        id: 'test',
      },
      {
        name: '456',
        type: 'int',
        id: 'test2',
      },
    ];
    const allValue = {
      logicalOperator: 'and',
      payload: [
        {
          aggregate: 'sum',
          columnName: 'test',
          operation: '>',
          value: '0',
        },
      ],
    };

    const changeValue = {
      payload: [
        {
          aggregate: 'min',
        },
      ],
    };
    const setData = jest.fn(() => []);
    const setFocusNode = jest.fn();
    const setSelectFinish = jest.fn();
    const hangeValueChange = jest.fn();
    const add = jest.fn();

    React.useState = setHookState({
      targetList,
    });

    const wrapper = mount(
      <Sub2Poperties
        loading={false}
        nodeData={nodeData}
        data={data}
        // targetList={targetList}
        setSelectFinish={setSelectFinish}
        setData={setData}
        setFocusNode={setFocusNode}
        onValuesChange={hangeValueChange}
        onClick={() => {
          add();
        }}
      />,
    );
    expect(wrapper.find('.node-wrapper')).toExist();
    wrapper.find('[data-test="addBtn"]').first().props().onClick();
    expect(add).toHaveBeenCalledTimes(0);
    wrapper.find('[data-test="selectTarget"]').first().props().onBlur();
    wrapper.find('[data-test="delbutton"]').first().props().onClick();

    wrapper
      .find('[data-test="formValueChange"]')
      .props()
      .onValuesChange(changeValue, allValue);
    expect(hangeValueChange).toHaveBeenCalledTimes(0);
  });
});
