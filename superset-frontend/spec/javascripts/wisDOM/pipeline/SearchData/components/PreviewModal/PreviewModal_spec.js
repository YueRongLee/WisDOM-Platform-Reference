import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import PreviewModal from 'src/wisDOM/components/SearchData/components/PreviewModal';

describe('wisDOM App', () => {
  it('is valid', () => {
    const modal = {
      visible: true,
      modalData: {
        name: 'test',
        columns: [
          {
            name: 'testColumns',
          },
        ],
      },
      closeModal: jest.fn(),
    };
    const handleBeforeLeave = jest.fn();
    const wrapper = mount(
      <PreviewModal modal={modal} handleBeforeLeave={handleBeforeLeave} />,
    );
    expect(wrapper.find('.PreviewModal')).toExist();
    wrapper.find('[data-test="beforeLeave"]').first().props().onClick();
  });
});
