import React from 'react';
import { render } from '@testing-library/react';
import { shallow } from 'enzyme';
import Main from './Main';

const container = shallow(<Main />);
test('should match the snapshot', () => {
  expect(container.html()).toMatchSnapshot();
});
