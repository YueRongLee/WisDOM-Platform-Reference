import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import TargetProperties from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Target/TargetProperties';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('TargetNodeItem TargetProperties', () => {
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
    const selectPage = 'target';
    const setSelectPage = jest.fn();
    const setFocusNode = jest.fn();
    const setNodePublish = jest.fn();
    const setNodeChange = jest.fn();
    const setSelectFinish = jest.fn();
    const setData = jest.fn();
    const setInputClick = jest.fn();
    const hangeValueChange = jest.fn();
    const wrapper = mount(
      <TargetProperties
        nodeData={nodeData}
        data={data}
        selectPage={selectPage}
        setSelectPage={setSelectPage}
        setNodeChange={setNodeChange}
        nodePublish={false}
        setNodePublish={setNodePublish}
        setFocusNode={setFocusNode}
        setSelectFinish={setSelectFinish}
        setData={setData}
        onFocus={setInputClick}
        onBlur={setInputClick}
        onValuesChange={hangeValueChange}
      />,
    ); // mount/render/shallow when applicable

    wrapper
      .findWhere(e => e.key() === 'testInput')
      .props()
      .onFocus();

    wrapper
      .findWhere(e => e.key() === 'testInput')
      .props()
      .onBlur();

    // wrapper.find('[data-test="testInput"]').props().onFocus();
    // wrapper.find('[data-test="testInput"]').props().onBlur();
    expect(setInputClick).toHaveBeenCalledTimes(0);

    wrapper.find('[data-test="testForm"]').props().onValuesChange();
    expect(hangeValueChange).toHaveBeenCalledTimes(0);

    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
