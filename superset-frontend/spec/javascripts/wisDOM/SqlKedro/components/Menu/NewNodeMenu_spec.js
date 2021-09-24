import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import renderer from 'react-test-renderer';
import NewNodeMenu from 'src/wisDOM/components/SqlKedro/components/Menu/NewNodeMenu';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

// Enzyme.configure({ adapter: new Adapter() });

describe('NewNodeMenu', () => {
  it('is valid', () => {
    const handleClick = jest.fn();
    const setSelectItem = jest.fn();
    const setRecordHeader = jest.fn();

    const wrapper = mount(
      <NewNodeMenu
        setSelectItem={setSelectItem}
        setRecordHeader={setRecordHeader}
        onClick={handleClick}
      />,
    );

    wrapper
      .findWhere(e => e.key() === 'node')
      .props()
      .onClick();

    expect(wrapper.find('#NewNodeMenu')).toExist();
  });
});
