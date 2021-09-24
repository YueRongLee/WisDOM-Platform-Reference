import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import OutputSchema from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/OutputSchema';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('OutputSchema publish', () => {
  it('is valid', () => {
    const nodeData = {
      name: 'test',
      type: 'transform',
      id: 'test',
      edit: true,
    };
    const data = {
      nodes: [
        {
          id: 'test',
          full_name: 'test',
          name: 'test',
          type: 'target',
          check: undefined,
          schema: [
            {
              name: 'firstname',
              type: 'string',
              columnDescription: 'test',
            },
            {
              name: 'secondname',
              type: 'string',
              columnDescription: 'test',
            },
          ],
          args: {
            name: 'test',
            type: 'target',
            publish: true,
            table_name: 'publish_table_name',
          },
        },
      ],
      edges: [],
    };

    const hangeChange = jest.fn();

    const wrapper = mount(
      <OutputSchema
        schemaLoading={false}
        data={data}
        nodeData={nodeData}
        onBlur={hangeChange}
      />,
    ); // mount/render/shallow when applicable

    const inputRecord = {
      name: 'test',
    };
    wrapper
      .find('[data-test="columnDescriptionInput"]')
      .first()
      .props()
      .onBlur((0, 'test', inputRecord));

    expect(wrapper.find('.OutputSchema')).toExist();
    expect(wrapper.find('.schema-list-wrapper')).toExist();
  });
});
