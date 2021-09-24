import React from 'react';
import { mount } from 'enzyme';
// import { shallow, mount } from 'enzyme';
import SearchData from 'src/wisDOM/components/SearchData/SearchData';
// import { setHookState } from '../../../helpers/hook';

// const tmpGetGroupsQuery = {
//   data: {
//     groupListData: [
//       {
//         groupId: 110,
//         owner: '10912345',
//         groupName: 'Minny(test)',
//         status: 1,
//         rejectReason: '',
//         updatedAt: 1611212187000,
//         allowUser: '',
//         createdAt: 1611212187000,
//       },
//     ],
//   },
// };

const mockedProps = {
  next: jest.fn(),
  selectedColumns: [],
  setSelectedColumns: jest.fn(),
  user: {
    emplId: 123,
    lastName: 'Minny',
    email: 'Minny123@wistron.com',
  },
  selectedGroup: undefined,
  setSelectedGroup: jest.fn(),
  setSelectedGroupObject: jest.fn(),
};

const mockOpenModal = jest.fn();
jest.mock('~~hooks/useModal', () =>
  jest.fn(() => ({
    visible: false,
    modalData: {},
    openModal: mockOpenModal,
    closeModal: () => {},
  })),
);

jest.mock('src/wisDOM/components/SearchData/components/ApplyModal', () =>
  jest.fn(() => <div />),
);

describe('wisDOM App', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  //   React.useState = setHookState({
  //     currTab: 'FIND_DATA',
  //     atlasContent: [],
  //     checking: [],
  //     changeGroupList: [
  //       {
  //         groupId: 110,
  //         owner: '10912345',
  //         groupName: 'Minny(test)',
  //         status: 1,
  //         rejectReason: '',
  //         updatedAt: 1611212187000,
  //         allowUser: '',
  //         createdAt: 1611212187000,
  //       },
  //     ],
  //     tableLoading: false,
  //     cartVisible: false,
  //   });

  it('is valid', () => {
    expect(React.isValidElement(<SearchData {...mockedProps} />)).toBe(true);

    const wrapper = mount(<SearchData {...mockedProps} />);
    // expect(wrapper.find('.termWrapper')).toExist();
    expect(wrapper.find('.toolbar')).toExist();
    expect(wrapper.find('.select-wrapper')).toExist();
    expect(wrapper.find('.type-select')).toExist();
    expect(wrapper.find('.listCategory')).toExist();
    expect(wrapper.find('.fixIcon')).toExist();
    expect(wrapper.find('.fixIcon2')).toExist();
    expect(wrapper.find('.fixShadow')).toExist();
    expect(wrapper.find('.ant-select-selection-overflow')).toExist();
    expect(wrapper.find('.ant-select-selection-overflow-item')).toExist();
    expect(wrapper.find('.ant-avatar')).toExist();
    expect(wrapper.find('.ant-btn')).toExist();
    expect(wrapper.find('.ant-input-wrapper ')).toExist();
  });
});
