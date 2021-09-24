import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import renderer from 'react-test-renderer';
import SqlEditorForDiagram from 'src/wisDOM/components/SqlEditor/SqlEditorForDiagram';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

// Enzyme.configure({ adapter: new Adapter() });

describe('SqlEditorForDiagram', () => {
  it('is valid', () => {
    const setPreviewInfo = jest.fn();
    const formRef = jest.fn();
    const allEntity = [
      {
        guid: '123',
      },
    ];

    const previewInfo = {
      cdmProperties: ['132'],
    };
    const wrapper = mount(
      <SqlEditorForDiagram
        allEntity={allEntity}
        readOnly={false}
        setPreviewInfo={setPreviewInfo}
        formRef={formRef}
        previewInfo={previewInfo}
        customized
        editMode
        groupId="123"
      />,
    ); // mount/render/shallow when applicable

    expect(wrapper.find('.sqlEditorContainer')).toExist();
  });
});
