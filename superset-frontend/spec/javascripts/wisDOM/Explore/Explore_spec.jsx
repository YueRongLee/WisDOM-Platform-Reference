import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import renderer from 'react-test-renderer';
import Explore from 'src/wisDOM/components/Explore/Explore';
import { AppContext } from 'src/store/appStore';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';
// Enzyme.configure({ adapter: new Adapter() });
const mockContextProps = {
  value: {
    userInfo: {
      emplId: '',
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      access_token: '',
      roles: [],
    },
    setUserInfo: jest.fn(),
  },
};

const mainOptions = {
  wrappingComponent: AppContext.Provider,
  wrappingComponentProps: mockContextProps,
};

jest.mock('src/wisDOM/components/CronModal/CustomCronModal', () =>
  jest.fn(() => <div />),
);

describe('Explore', () => {
  it('is valid', () => {
    const appStore = {
      userInfo: {
        email: '123',
      },
    };
    const selectGroupObject = {
      groupName: 'groupName',
    };
    const handleOK = jest.fn();
    const wrapper = mount(
      <Explore
        appStore={appStore}
        handleOK={handleOK}
        selectGroupObject={selectGroupObject}
      />,
      mainOptions,
    ); // mount/render/shallow when applicable
    wrapper.find('[data-test="submit"]').props().onClick();
    expect(wrapper.find('.exploreContainer')).toExist();
  });
});
