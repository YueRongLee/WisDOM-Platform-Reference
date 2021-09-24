import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import renderer from 'react-test-renderer';
import ColumnPopover from 'src/wisDOM/components/SqlEditor/ColumnPopover';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

// Enzyme.configure({ adapter: new Adapter() });

describe('ColumnPopover', () => {
  it('is valid', () => {
    const data = {
      nodes: [
        {
          id: 'test',
          args: {
            classification: 'test',
          },
        },
      ],
    };
    const onSave = jest.fn();
    const modal = {
      visible: true,
    };
    const allEntity = [
      {
        guid: '123',
      },
    ];
    const columnDesc = 'tests';

    const wrapper = mount(
      <ColumnPopover
        allEntity={allEntity}
        columnDesc={columnDesc}
        modal={modal}
        data={data}
        onSave={onSave}
      />,
    ); // mount/render/shallow when applicable

    expect(wrapper.find('.entityContainer')).toExist();
  });
});
