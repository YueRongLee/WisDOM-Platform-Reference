import React from 'react';
import { mount } from 'enzyme';
import ConditionPoperties from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/Condition/Poperties';

const COMPARISON_OPERATOR_MAP = [
  {
    key: 'GREATER',
    name: '>',
    disabledType: ['string'],
  },
  {
    key: 'LESS_THAN',
    name: '<',
    disabledType: ['string'],
  },
  {
    key: 'GREATER_OR_EQUAL',
    name: '>=',
    disabledType: ['string'],
  },
  {
    key: 'LESS_THAN_OR_EQUAL',
    name: '<=',
    disabledType: ['string'],
  },
  {
    key: 'EQUAL',
    name: '==',
    disabledType: [],
  },
  {
    key: 'NOT_EQUAL',
    name: '!=',
    disabledType: [],
  },
];

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
          args: {
            classification: 'test',
          },
        },
      ],
    };
    const dataflowList = [
      {
        key: '132',
        value: '123',
      },
    ];
    const tables = [
      {
        targetId: '132',
      },
    ];
    const setTables = jest.fn();
    const setPayload = jest.fn();
    const closeModal = jest.fn();
    const openModal = jest.fn();
    const getTargetSchema = jest.fn();
    const handleSelectChange = jest.fn();

    const wrapper = mount(
      <ConditionPoperties
        nodeData={nodeData}
        data={data}
        dataflowList={dataflowList}
        tables={tables}
        setTables={setTables}
        setPayload={setPayload}
        dataflowLoading={false}
        closeModal={closeModal}
        openModal={openModal}
        getTargetSchema={getTargetSchema}
        COMPARISON_OPERATOR_MAP={COMPARISON_OPERATOR_MAP}
        onChange={handleSelectChange}
      />,
    );

    wrapper.find('[data-test="dataflowId"]').first().props().onChange('123');
    expect(handleSelectChange).toHaveBeenCalledTimes(0);

    expect(wrapper.find('.formListBlock')).toExist();
    expect(wrapper.find('.blockDashed')).toExist();
    expect(wrapper.find('.tableBlock')).toExist();
    expect(wrapper.find('.delbutton')).toExist();
    expect(wrapper.find('.whereRow')).toExist();
    expect(wrapper.find('.flex-1')).toExist();

    wrapper.find('[data-test="dataflowId"]').first().props().onChange();
    wrapper.find('[data-test="handlePreview"]').first().props().onClick();
    wrapper.find('[data-test="add"]').first().props().onClick();
    wrapper.find('[data-test="selectTable"]').first().props().onBlur();
    wrapper.find('[data-test="delbutton"]').first().props().onClick();
    wrapper.find('[data-test="selectColumn"]').first().props().onBlur();
    wrapper.find('[data-test="selectOperator"]').first().props().onBlur();
  });
});
