import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import renderer from 'react-test-renderer';
import TransformNodeMenu from 'src/wisDOM/components/SqlKedro/components/Menu/TransformNodeMenu';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

// Enzyme.configure({ adapter: new Adapter() });

describe('TransformNodeMenu', () => {
  it('is valid', () => {
    const handleClick = jest.fn();
    const setSelectItem = jest.fn();
    const setRecordHeader = jest.fn();

    const wrapper = mount(
      <TransformNodeMenu
        onClick={handleClick}
        setSelectItem={setSelectItem}
        setRecordHeader={setRecordHeader}
      />,
    ); // mount/render/shallow when applicable

    wrapper
      .findWhere(e => e.key() === 'transform')
      .props()
      .onClick();
    wrapper
      .findWhere(e => e.key() === 'outputTransform')
      .props()
      .onClick();
    wrapper
      .findWhere(e => e.key() === 'node')
      .props()
      .onClick();

    expect(handleClick).toHaveBeenCalledTimes(0);
    expect(setSelectItem).toHaveBeenCalledTimes(0);
    expect(setRecordHeader).toHaveBeenCalledTimes(0);

    expect(wrapper.find('#TransformNodeMenu')).toExist();
  });
});
