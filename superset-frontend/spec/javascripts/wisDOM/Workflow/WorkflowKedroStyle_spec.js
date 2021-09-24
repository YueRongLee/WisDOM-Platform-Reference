import React from 'react';
import { mount } from 'enzyme';
import style from 'src/wisDOM/components/WorkflowKedro/WorkflowKedroStyle';

describe('wisDOM App', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is valid', () => {
    expect(React.isValidElement(<style />)).toBe(true);
  });

  describe('<div> component', () => {
    it('should have width', () => {
      const wrapper = mount(<div />);
      expect(wrapper.find('div')).toHaveStyleRule('width', '50%');
    });
  });
});
