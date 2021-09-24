import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import InfoModal from 'src/wisDOM/components/SearchData/components/InfoModal';

describe('wisDOM App', () => {
  it('is valid', () => {
    const modal = {
      visible: true,
    };
    const wrapper = mount(<InfoModal modal={modal} />);
    expect(wrapper.find('.InfoModal')).toExist();
  });
  it('beforeLeave', () => {
    const modal = {
      visible: true,
      modalData: {
        name: 'test',
      },
      closeModal: jest.fn(),
    };
    const handleBeforeLeave = jest.fn();
    const getTableOnChainStatusList = jest.fn();

    const wrapper = mount(
      <InfoModal
        modal={modal}
        onClick={handleBeforeLeave}
        getTableOnChainStatusList={getTableOnChainStatusList}
      />,
    );
    wrapper.find('[data-test="beforeLeave"]').first().props().onClick();
  });
});
