/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { supersetTheme, ThemeProvider } from '@superset-ui/core';
import Collapse from 'src/common/components/Collapse';

import { IconTooltip } from 'src/components/IconTooltip';
import Fade from 'src/common/components/Fade';
import TableElement from 'src/SqlLab/components/TableElement';
import ColumnElement from 'src/SqlLab/components/ColumnElement';
import waitForComponentToPaint from 'spec/helpers/waitForComponentToPaint';
import { mockedActions, table } from './fixtures';

describe('TableElement', () => {
  const mockStore = configureStore([]);
  const store = mockStore({});
  const mockedProps = {
    actions: mockedActions,
    table,
    timeout: 0,
  };
  it('renders', () => {
    expect(React.isValidElement(<TableElement />)).toBe(true);
  });
  it('renders with props', () => {
    expect(React.isValidElement(<TableElement {...mockedProps} />)).toBe(true);
  });
  it('has 4 IconTooltip elements', () => {
    const wrapper = mount(
      <Provider store={store}>
        <TableElement {...mockedProps} />
      </Provider>,
      {
        wrappingComponent: ThemeProvider,
        wrappingComponentProps: {
          theme: supersetTheme,
        },
      },
    );
    expect(wrapper.find(IconTooltip)).toHaveLength(4);
  });
  it('has 14 columns', () => {
    const wrapper = shallow(<TableElement {...mockedProps} />);
    expect(wrapper.find(ColumnElement)).toHaveLength(14);
  });
  it('mounts', () => {
    mount(
      <Provider store={store}>
        <TableElement {...mockedProps} />
      </Provider>,
      {
        wrappingComponent: ThemeProvider,
        wrappingComponentProps: {
          theme: supersetTheme,
        },
      },
    );
  });
  it('fades table', async () => {
    const wrapper = mount(
      <Provider store={store}>
        <TableElement {...mockedProps} />
      </Provider>,
      {
        wrappingComponent: ThemeProvider,
        wrappingComponentProps: {
          theme: supersetTheme,
        },
      },
    );
    expect(wrapper.find(TableElement).state().hovered).toBe(false);
    expect(wrapper.find(Fade).props().hovered).toBe(false);
    wrapper.find('.header-container').hostNodes().simulate('mouseEnter');
    await waitForComponentToPaint(wrapper, 300);
    expect(wrapper.find(TableElement).state().hovered).toBe(true);
    expect(wrapper.find(Fade).props().hovered).toBe(true);
  });
  it('fades table', () => {
    const wrapper = shallow(<TableElement {...mockedProps} />);
    expect(wrapper.state().hovered).toBe(false);
    expect(wrapper.find(Fade).props().hovered).toBe(false);
    wrapper.find('div.TableElement').simulate('mouseEnter');
    expect(wrapper.state().hovered).toBe(true);
    expect(wrapper.find(Fade).props().hovered).toBe(true);
  });
  it('sorts columns', () => {
    const wrapper = mount(
      <Provider store={store}>
        <Collapse>
          <TableElement {...mockedProps} />
        </Collapse>
      </Provider>,
      {
        wrappingComponent: ThemeProvider,
        wrappingComponentProps: {
          theme: supersetTheme,
        },
      },
    );
    expect(wrapper.find(TableElement).state().sortColumns).toBe(false);
    wrapper.find('.header-container').hostNodes().simulate('click');
    expect(wrapper.find(ColumnElement).first().props().column.name).toBe('id');
    wrapper.find('.header-container').simulate('mouseEnter');
    wrapper.find('.sort-cols').hostNodes().simulate('click');
    expect(wrapper.find(TableElement).state().sortColumns).toBe(true);
    expect(wrapper.find(ColumnElement).first().props().column.name).toBe(
      'active',
    );
  });
  it('calls the collapseTable action', () => {
    const wrapper = mount(
      <Provider store={store}>
        <TableElement {...mockedProps} />
      </Provider>,
      {
        wrappingComponent: ThemeProvider,
        wrappingComponentProps: {
          theme: supersetTheme,
        },
      },
    );
    expect(mockedActions.collapseTable.called).toBe(false);
    wrapper.find('[data-test="collapse"]').hostNodes().simulate('click');
    expect(mockedActions.collapseTable.called).toBe(true);
  });
  it('removes the table', () => {
    const wrapper = mount(
      <Provider store={store}>
        <TableElement {...mockedProps} />
      </Provider>,
      {
        wrappingComponent: ThemeProvider,
        wrappingComponentProps: {
          theme: supersetTheme,
        },
      },
    );
    wrapper.find('.table-remove').hostNodes().simulate('click');
    expect(mockedActions.removeDataPreview.called).toBe(true);
  });
});
