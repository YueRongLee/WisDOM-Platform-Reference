import React from 'react';
import { mount } from 'enzyme';
import PreviewModal from 'src/wisDOM/components/WorkflowKedro/components/PreviewModal/PreviewModal';

jest.mock(
  'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/Customize',
  () => jest.fn(() => <div />),
);

describe('wisDOM App', () => {
  it('is valid', () => {
    const modal = {
      visible: true,
    };
    const wrapper = mount(<PreviewModal modal={modal} />);
    expect(wrapper.find('.reference-chart')).toExist();
  });
});
