import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import Main from 'src/wisDOM/Main';

jest.mock(
  'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/Customize',
  () => jest.fn(() => <div />),
);

describe('wisDOM App', () => {
  it('is valid', () => {
    const wrapper = mount(<Main />);
    expect(wrapper.find('.wisdom')).toExist();
  });
});
