import React from 'react';
import { mount } from 'enzyme';
import ImportModal from 'src/wisDOM/components/ImportModal/ImportModal';

describe('wisDOM App', () => {
  it('is valid', () => {
    const modal = {
      visible: true,
    };
    const wrapper = mount(<ImportModal modal={modal} />);
    expect(wrapper.find('.copyBtn')).toExist();
    expect(wrapper.find('.columnRow')).toExist();
    expect(wrapper.find('.linkbutton')).toExist();
  });
});
