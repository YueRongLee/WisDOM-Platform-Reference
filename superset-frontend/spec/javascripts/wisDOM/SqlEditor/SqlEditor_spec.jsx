import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import renderer from 'react-test-renderer';
import SqlEditor from 'src/wisDOM/components/SqlEditor/SqlEditor';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

// Enzyme.configure({ adapter: new Adapter() });

describe('SqlEditor', () => {
  it('is valid', () => {
    const source = {
      sql: '123',
    };
    const onPreviewSql = jest.fn();
    const onDelete = jest.fn();
    const oEntity = [
      {
        name: '123',
      },
    ];
    const allEntity = [
      {
        guid: '123',
      },
    ];
    const wrapper = mount(
      <SqlEditor
        source={source}
        onPreviewSql={onPreviewSql}
        onDelete={onDelete}
        oEntity={oEntity}
        allEntity={allEntity}
      />,
    ); // mount/render/shallow when applicable

    expect(wrapper.find('.sqlEditorContainer')).toExist();
  });
});
