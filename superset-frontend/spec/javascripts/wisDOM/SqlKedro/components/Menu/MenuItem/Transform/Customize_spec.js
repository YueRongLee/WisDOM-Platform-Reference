import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import Customize from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/Customize';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';
jest.mock('@baic/sql-editor', () => jest.fn(() => <div />));
Enzyme.configure({ adapter: new Adapter() });

describe('Customize', () => {
  it('is valid', () => {
    const Kind = {
      Keyword: 'Keyword',
    };
    const wrapper = mount(<Customize Kind={Kind} />); // mount/render/shallow when applicable

    expect(wrapper.find('.Customize')).toExist();
  });
});
