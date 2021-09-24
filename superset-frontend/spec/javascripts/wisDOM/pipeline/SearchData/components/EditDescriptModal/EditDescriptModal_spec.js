import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import EditDescriptModal from 'src/wisDOM/components/SearchData/components/EditDescriptModal';

describe('wisDOM App', () => {
  it('is valid', () => {
    const modal = {
      visible: true,
    };
    const sourceData = {
      table: {
        name: 'table',
        columns: [
          {
            name: 'test',
            comment: 'test',
          },
        ],
      },
    };
    const wrapper = mount(
      <EditDescriptModal modal={modal} sourceData={sourceData} />,
    );
    expect(wrapper.find('.EditDescriptModal')).toExist();
  });
});
