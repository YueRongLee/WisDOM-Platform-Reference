import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import renderer from 'react-test-renderer';
import DataSetTable from 'src/DatasetManagement/components/DataSetTable/DataSetTable';
import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('DataSetTable', () => {
  it('is valid', () => {
    const wrapper = mount(<DataSetTable />); // mount/render/shallow when applicable

    expect(wrapper.find('.DataSetTable')).toExist();
  });
});

describe('Test TypeInInput', () => {
  const showConfirm = jest.fn();
  it('change event', () => {
    const onChangeInput = jest.fn();
    const wrapper = shallow(<DataSetTable onChange={onChangeInput} />);
    wrapper.find('#test-keyword').simulate('change', {
      target: {
        id: 'test-keyword',
        value: 'EE',
      },
    });
    expect(wrapper.find('#test-keyword').props().value).toEqual('EE');
  });

  it('click event', () => {
    const wrapper = mount(<DataSetTable onClick={showConfirm} />);
    // wrapper.find('#test-button').simulate('click');
    wrapper
      .find('#test-button')
      .at(0)
      .simulate('click', { target: { id: '#test-button' } });
    // wrapper.update();
    // expect(showConfirm.mock.calls.length).toEqual(1);

    // wrapper.find('#test-button').props().onClick();

    // act(() => {
    //   // Invoke the button's click handler, but this time directly, instead of
    //   // via an Enzyme API
    //   onClickConfirm();
    // });
    // Refresh Enzyme's view of the output
    wrapper.update();
    expect(showConfirm).toHaveBeenCalled();
  });
});
