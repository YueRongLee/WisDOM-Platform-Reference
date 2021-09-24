import React from 'react';
import { mount } from 'enzyme';
import Main from 'src/workspace/Main';
import { act } from 'react-dom/test-utils';
import { AppContext } from 'src/store/appStore';
import { UserApi } from '~~apis/';
import { setHookState } from '../../../helpers/hook';

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

const mockedProps = {
  user: {
    username: 'alpha',
    firstName: 'alpha',
    lastName: 'alpha',
    createdOn: '2016-11-11T12:34:17',
    userId: 5,
    email: 'alpha@alpha.com',
    isActive: true,
    emplId: '109010001',
    roles: [],
  },
};
const mockgetETLPromise = Promise.resolve([]);
jest.mock('~~apis/UserApi', () => ({
  getRoles: jest.fn(() => mockgetETLPromise),
}));

jest.mock('src/workspace/components/ETLList/ETLList', () =>
  jest.fn(() => <div />),
);
jest.mock('src/workspace/components/ETLDetail/ETLDetail', () =>
  jest.fn(() => <div />),
);
jest.mock('src/workspace/components/ETLShareDetail/ETLShareDetail', () =>
  jest.fn(() => <div />),
);

describe('wisDOM App', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  React.useState = setHookState({
    currTab: 'FIND_DATA',
    update: 0,
    updateShare: 0,
  });
  const mainOptions = {
    wrappingComponent: AppContext.Provider,
    wrappingComponentProps: mockContextProps,
  };
  const mountMain = () => mount(<Main {...mockedProps} />, mainOptions);

  it('should call get roles api', async () => {
    mountMain();
    expect(UserApi.getGroups).toHaveBeenCalledTimes(1);
    await act(() => mockgetETLPromise);
  });

  it('is valid', () => {
    const wrapper = mount(<Main {...mockedProps} />);
    expect(wrapper.find('.workspaceContainer')).toExist();
  });
});
