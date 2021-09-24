import React from 'react';
// import { mount } from 'enzyme';
import { mockData } from 'src/wisDOM/components/SearchData/mockData';

describe('wisDOM App', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is valid', () => {
    expect(React.isValidElement(<mockData />)).toBe(true);
  });

  it('Add requires mockData prop', () => {
    expect(mockData).toBeDefined();
  });
});
