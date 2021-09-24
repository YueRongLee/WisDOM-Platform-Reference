import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import OutputData from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Target/OutputData';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('TargetNodeItem NodeItem', () => {
  it('is valid', () => {
    const wrapper = mount(<OutputData />); // mount/render/shallow when applicable

    expect(wrapper.find('.target-outputdata-wrapper')).toExist();
  });
});
