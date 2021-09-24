import React from 'react';
import { mount } from 'enzyme';
import App from 'src/wisDOM/index';

jest.mock(
  'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/Customize',
  () => jest.fn(() => <div />),
);

describe('wisDOM App', () => {
  it('is valid', () => {
    expect(React.isValidElement(<App />)).toBe(true);

    const wrapper = mount(<App />);
    expect(wrapper.find('app')).toExist();
  });
});
