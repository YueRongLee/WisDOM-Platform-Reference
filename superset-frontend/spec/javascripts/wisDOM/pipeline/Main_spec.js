import React from 'react';
import { mount } from 'enzyme';
import Main from 'src/wisDOM/Main';
import { act } from 'react-dom/test-utils';
import { AppContext } from 'src/store/appStore';
import { ROLE_TYPE } from '~~constants/index';
import { RoleApi } from '~~apis/';
// import { useModal } from '~~hooks/';
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

const mockgetRolesPromise = Promise.resolve([]);
const mockgetMasterRolesPromise = Promise.resolve([ROLE_TYPE.DATA_MASTER]);
const mockOpenModal = jest.fn();
jest.mock('~~apis/RoleApi', () => ({
  getRoles: jest.fn(() => mockgetRolesPromise),
}));
jest.mock('~~hooks/useModal', () =>
  jest.fn(() => ({
    visible: false,
    modalData: {},
    openModal: mockOpenModal,
    closeModal: () => {},
  })),
);
jest.mock('src/wisDOM/components/SearchData/SearchData', () =>
  jest.fn(() => <div />),
);
jest.mock('src/wisDOM/components/Explore/Explore', () =>
  jest.fn(() => <div />),
);
jest.mock('src/wisDOM/components/ImportModal/ImportModal', () =>
  jest.fn(() => <div />),
);
jest.mock('src/wisDOM/components/UploadModal/UploadModal', () =>
  jest.fn(() => <div />),
);
jest.mock('src/wisDOM/components/SyncDataModal/SyncDataModal', () =>
  jest.fn(() => <div />),
);
jest.mock('src/wisDOM/components/SyncDataModal/CreateSyncData', () =>
  jest.fn(() => <div />),
);

jest.mock(
  'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/Customize',
  () => jest.fn(() => <div />),
);

describe('wisDOM App', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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

  const mainOptions = {
    wrappingComponent: AppContext.Provider,
    wrappingComponentProps: mockContextProps,
  };
  const mountMain = () => mount(<Main {...mockedProps} />, mainOptions);

  React.useState = setHookState({
    currTab: 'FIND_DATA',
    selectedColumns: [],
  });

  it('is valid', () => {
    expect(React.isValidElement(<Main {...mockedProps} />)).toBe(true);
    const wrapper = mount(<Main />);
    expect(wrapper.find('.mainContainer')).toExist();
    expect(wrapper.find('.wisdom')).toExist();
    expect(wrapper.find('.mainTitle')).toExist();
  });

  it('renders initial search tab', async () => {
    const wrapper = mountMain();
    expect(wrapper.find('.mainContainer')).toHaveLength(1);
    await act(() => mockgetRolesPromise);
  });

  it('should call get roles api', async () => {
    mountMain();
    expect(RoleApi.getRoles).toHaveBeenCalledTimes(1);
    await act(() => mockgetRolesPromise);
  });

  it('user role show only upload button', async () => {
    const wrapper = mountMain();
    await act(() => mockgetRolesPromise);
    wrapper.update();
    const buttons = wrapper.find('button');
    expect(buttons).toHaveLength(1);
    expect(buttons.at(0).text()).toEqual('Upload');
  });

  it('master group role should show sync and upload button', async () => {
    RoleApi.getRoles.mockImplementation(
      jest.fn(() => mockgetMasterRolesPromise),
    );
    const wrapper = mountMain();
    await act(() => mockgetMasterRolesPromise);
    wrapper.update();
    const buttons = wrapper.find('button');
    expect(buttons).toHaveLength(2);
    expect(buttons.at(0).text()).toEqual('Sync Data');
    expect(buttons.at(1).text()).toEqual('Upload');
  });

  it('master group user click sync data should open modal', async () => {
    RoleApi.getRoles.mockImplementation(
      jest.fn(() => mockgetMasterRolesPromise),
    );
    const wrapper = mountMain();
    await act(() => mockgetMasterRolesPromise);
    wrapper.update();
    const buttons = wrapper.find('button');
    buttons.at(0).simulate('click');
    expect(mockOpenModal).toHaveBeenCalledTimes(1);
  });

  it('normal user click upload data should open modal', async () => {
    const wrapper = mountMain();
    await act(() => mockgetRolesPromise);
    wrapper.update();
    const buttons = wrapper.find('button');
    buttons.at(0).simulate('click');
    expect(mockOpenModal).toHaveBeenCalledTimes(1);
  });
});
