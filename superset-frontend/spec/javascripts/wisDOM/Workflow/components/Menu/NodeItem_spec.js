import React from 'react';
import { mount } from 'enzyme';
import NodeItem from 'src/wisDOM/components/WorkflowKedro/components/Menu/NodeItem';

describe('wisDOM App', () => {
  it('is valid', () => {
    const setSelectPage = jest.fn();
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
      edges: [
        {
          source: 'test',
          target: 'test2',
        },
      ],
    };
    expect(
      React.isValidElement(
        <NodeItem
          nodeData={nodeData}
          data={data}
          setSelectPage={setSelectPage}
        />,
      ),
    ).toBe(true);

    const setInputClick = jest.fn();
    const handleValidate = jest.fn();

    const wrapper = mount(
      <NodeItem
        optionPage="join"
        nodeData={nodeData}
        data={data}
        setSelectPage={setSelectPage}
        onBlur={handleValidate}
        onFocus={setInputClick}
      />,
    );
    expect(wrapper.find('.node-wrapper')).toExist();

    wrapper.find('[data-test="nodeItemInput"]').first().props().onBlur();
    expect(handleValidate).toHaveBeenCalledTimes(0);
    wrapper.find('[data-test="nodeItemInput"]').first().props().onFocus();
    expect(setInputClick).toHaveBeenCalledTimes(0);
  });
});
