import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import NewNodeItem from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/NewNode/NewNodeItem';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('NewNodeItem', () => {
  it('is valid', () => {
    const wrapper = mount(<NewNodeItem />); // mount/render/shallow when applicable

    expect(wrapper.find('.node-wrapper')).toExist();
  });
});
