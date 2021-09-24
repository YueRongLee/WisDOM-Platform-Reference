import React from 'react';
// import { mount } from 'enzyme';
import Menu from 'src/wisDOM/components/WorkflowKedro/components/Menu/Menu';

jest.mock(
  'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/Customize',
  () => jest.fn(() => <div />),
);

describe('wisDOM App', () => {
  it('is valid', () => {
    expect(React.isValidElement(<Menu />)).toBe(true);
  });
});
