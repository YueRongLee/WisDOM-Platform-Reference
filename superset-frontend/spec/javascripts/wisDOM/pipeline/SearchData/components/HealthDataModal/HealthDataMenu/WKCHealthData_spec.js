import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import WKCHealthData from 'src/wisDOM/components/SearchData/components/HealthDataMenu/WKCHealthData';

describe('wisDOM App', () => {
  it('is valid', () => {
    const showReference = jest.fn();
    const GetColor = jest.fn(() => 'red');

    const data = {
      table: {
        name: 'test',
        categories: ['123'],
        systemType: 'WisDOM',
        tags: ['123', '456'],
        columns: [
          {
            name: 'name',
            comment: 'test',
            type: 'string',
          },
        ],
      },
      frequency: '123',
      lastUpdateTime: '123',
      ownerEnName: 'test',
      owner: 'test',
    };
    const wrapper = mount(
      <WKCHealthData
        data={data}
        GetColor={GetColor}
        showReference={showReference}
      />,
    );

    // expect(wrapper.find('.WKCHealthData')).toExist();
    expect(wrapper.find('.healthy-left-form-container')).toExist();
    expect(wrapper.find('.listTag2')).toExist();
    expect(wrapper.find('.health-owner')).toExist();
    expect(wrapper.find('.healthlistWrapper')).toExist();
    expect(wrapper.find('.health-list-container')).toExist();
  });

  it('no data test', () => {
    const data = {
      table: {
        name: 'test',
        columns: [
          {
            name: 'name',
            comment: 'test',
            type: 'string',
          },
        ],
      },
      frequency: '123',
      owner: 'test',
      lastUpdateTime: '',
      ownerEnName: '',
    };
    const wrapper = mount(<WKCHealthData data={data} />);

    expect(wrapper.find('.healthlistWrapper')).toExist();
  });
});
