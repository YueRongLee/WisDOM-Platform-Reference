import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import DatasetNodeItem from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/DatasetNodeItem';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('DatasetNodeItem', () => {
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
    const setSelectPage = jest.fn();
    const setInputClick = jest.fn();
    const wrapper = mount(
      <DatasetNodeItem
        nodeData={nodeData}
        data={data}
        setSelectPage={setSelectPage}
        onFocus={setInputClick}
        onBlur={setInputClick}
      />,
    ); // mount/render/shallow when applicable
    wrapper.find('[data-test="name"]').first().props().onFocus();
    wrapper.find('[data-test="name"]').first().props().onBlur();
    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
