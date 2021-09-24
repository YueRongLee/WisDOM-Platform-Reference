import React from 'react';
import { mount } from 'enzyme';
import MenuHeader from 'src/wisDOM/components/SearchData/components/HealthDataMenu/MenuHeader';

describe('wisDOM App', () => {
  it('is valid', () => {
    const setSelectItem = jest.fn();
    const handleClick = jest.fn();
    const wrapper = mount(
      <MenuHeader
        selectItem="healthData"
        setSelectItem={setSelectItem}
        onClick={handleClick}
      />,
    );
    const wrapper2 = mount(
      <MenuHeader
        selectItem="WKC"
        setSelectItem={setSelectItem}
        onClick={handleClick}
      />,
    );

    wrapper.find('[data-test="healthData"]').first().props().onClick();
    expect(handleClick).toHaveBeenCalledTimes(0);
    wrapper2.find('[data-test="WKC"]').first().props().onClick();
    expect(handleClick).toHaveBeenCalledTimes(0);
  });
});
