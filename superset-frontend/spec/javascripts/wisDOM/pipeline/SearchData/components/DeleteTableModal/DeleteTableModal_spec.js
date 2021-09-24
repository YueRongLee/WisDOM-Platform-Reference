import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import DeleteTableModal from 'src/wisDOM/components/SearchData/components/DeleteTableModal';

describe('wisDOM App', () => {
  it('is valid', () => {
    const modal = {
      visible: true,
    };
    const handleDelete = jest.fn();
    const handleBeforeLeave = jest.fn();
    const wrapper = mount(
      <DeleteTableModal
        modal={modal}
        handleDelete={handleDelete}
        handleBeforeLeave={handleBeforeLeave}
      />,
    );
    expect(wrapper.find('.DeleteTableModal')).toExist();
    wrapper.find('[data-test="DeleteTable"]').first().props().onOk();
    wrapper.find('[data-test="DeleteTable"]').first().props().onCancel();
  });
});
