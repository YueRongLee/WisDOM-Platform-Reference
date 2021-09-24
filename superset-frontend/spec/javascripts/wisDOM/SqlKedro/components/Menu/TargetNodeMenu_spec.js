import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
// import Adapter from 'enzyme-adapter-react-16';
// import renderer from 'react-test-renderer';
import TargetNodeMenu from 'src/wisDOM/components/SqlKedro/components/Menu/TargetNodeMenu';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

// Enzyme.configure({ adapter: new Adapter() });

describe('TargetNodeMenu', () => {
  it('is valid', () => {
    const handleClick = jest.fn();
    const setSelectItem = jest.fn();
    const setRecordHeader = jest.fn();
    const wrapper = mount(
      <TargetNodeMenu
        onClick={handleClick}
        setSelectItem={setSelectItem}
        setRecordHeader={setRecordHeader}
      />,
    ); // mount/render/shallow when applicable
    wrapper
      .findWhere(e => e.key() === 'outputTransform')
      .props()
      .onClick();

    wrapper
      .findWhere(e => e.key() === 'properties')
      .props()
      .onClick();

    wrapper
      .findWhere(e => e.key() === 'node')
      .props()
      .onClick();

    wrapper
      .findWhere(e => e.key() === 'output-data')
      .props()
      .onClick();

    expect(handleClick).toHaveBeenCalledTimes(0);
    expect(setSelectItem).toHaveBeenCalledTimes(0);
    expect(setRecordHeader).toHaveBeenCalledTimes(0);
    expect(wrapper.find('#TargetNodeMenu')).toExist();
  });
});
