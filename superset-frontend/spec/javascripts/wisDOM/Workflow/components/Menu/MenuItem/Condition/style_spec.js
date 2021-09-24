import React from 'react';
import { mount } from 'enzyme';
import InsertScroll from 'src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/Condition/style';

describe('wisDOM App', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is valid', () => {
    expect(React.isValidElement(<InsertScroll />)).toBe(true);
  });

  //   InsertScroll
});

describe('<div> component', () => {
  it('should have flex display', () => {
    const wrapper = mount(<div />);
    expect(wrapper.find('div')).toHaveStyleRule('overflow', 'auto');
  });
});
