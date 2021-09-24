import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import Schema from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Dataset/Schema';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('DatasetNodeItem Schema', () => {
  it('is valid', () => {
    const wrapper = mount(<Schema />); // mount/render/shallow when applicable

    expect(wrapper.find('.table-updatetime')).toExist();
  });
});
