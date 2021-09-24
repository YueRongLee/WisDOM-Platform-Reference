import React from 'react';
import { mount } from 'enzyme';
import Sub3PowerBiPoperties from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/PowerBi/Sub3Poperties';
import { Select } from 'antd';
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
            receivers: 'test@wistron.com',
          },
        },
      ],
    };

    const List = (
      <Select.Option key="test" value="test@wistron.com">
        test@wistron.com
      </Select.Option>
    );

    React.useState = setHookState({
      loading: false,
      optionList: List,
    });

    const handleSelectChange = jest.fn();
    const handleSearch = jest.fn();

    const wrapper = mount(
      <Sub3PowerBiPoperties
        optionList={List}
        nodeData={nodeData}
        data={data}
        onChange={handleSelectChange}
        onSearch={handleSearch}
      />,
    );
    wrapper.find('[data-test="select_Email"]').first().props().onSearch();
    expect(handleSearch).toHaveBeenCalledTimes(0);
    wrapper.find('[data-test="select_Email"]').first().props().onSearch('test');
    expect(handleSearch).toHaveBeenCalledTimes(0);
    wrapper.find('[data-test="select_Email"]').first().props().onChange();
    expect(handleSelectChange).toHaveBeenCalledTimes(0);
  });
});
