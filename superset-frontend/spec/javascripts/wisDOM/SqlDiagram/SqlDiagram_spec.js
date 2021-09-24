import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import renderer from 'react-test-renderer';
import SqlDiagram from 'src/wisDOM/components/SqlDiagram/SqlDiagram';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

// Enzyme.configure({ adapter: new Adapter() });

describe('SqlDiagram', () => {
  it('is valid', () => {
    const wrapper = shallow(<SqlDiagram />); // mount/render/shallow when applicable

    expect(wrapper.find('.sqldiagram')).toExist();
  });
});
