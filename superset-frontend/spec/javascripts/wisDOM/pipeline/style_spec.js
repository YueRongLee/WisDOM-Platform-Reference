import React from 'react';
import { mount } from 'enzyme';
import style from 'src/wisDOM/style';

describe('wisDOM App', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is valid', () => {
    expect(React.isValidElement(<style />)).toBe(true);
  });

  describe('<div> component', () => {
    it('should have flex display', () => {
      const wrapper = mount(<div />);
      expect(wrapper.find('div')).toHaveStyleRule('display', 'flex');
    });
  });
});
