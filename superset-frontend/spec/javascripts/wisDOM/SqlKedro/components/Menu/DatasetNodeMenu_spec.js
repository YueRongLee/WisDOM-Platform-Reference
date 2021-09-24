import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import renderer from 'react-test-renderer';
import DatasetNodeMenu from 'src/wisDOM/components/SqlKedro/components/Menu/DatasetNodeMenu';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

// Enzyme.configure({ adapter: new Adapter() });

describe('DatasetNodeMenu', () => {
  it('is valid', () => {
    const handleClick = jest.fn();
    const setSelectItem = jest.fn();
    const setRecordHeader = jest.fn();

    const wrapper = mount(
      <DatasetNodeMenu
        onClick={handleClick}
        setSelectItem={setSelectItem}
        setRecordHeader={setRecordHeader}
      />,
    ); // mount/render/shallow when applicable

    wrapper
      .findWhere(e => e.key() === 'node')
      .props()
      .onClick();

    expect(handleClick).toHaveBeenCalledTimes(0);
    expect(setSelectItem).toHaveBeenCalledTimes(0);
    expect(setRecordHeader).toHaveBeenCalledTimes(0);

    expect(wrapper.find('#DatasetNodeMenu')).toExist();
  });
});
