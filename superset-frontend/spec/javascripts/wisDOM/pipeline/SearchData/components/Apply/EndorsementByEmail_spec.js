/* eslint-disable jest/expect-expect */
/* eslint-disable no-console */
import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import EndorsementByEmail from 'src/wisDOM/components/SearchData/components/Apply/EndorsementByEmail';

describe('wisDOM App', () => {
  const setEndorsement = jest.fn();
  let wrapper;

  const value = [
    { key: 'test123', label: 'test123@wistron.com', value: 'test123' },
  ];

  beforeEach(() => {
    wrapper = mount(<EndorsementByEmail setEndorsement={setEndorsement} />);
  });

  it('Is valid.', () => {
    expect(
      wrapper.find('[data-test="apply-endorsement-email-form-unit-test"]'),
    ).toExist();
  });

  it('Is connected to table when user selected.', () => {
    wrapper
      .find('[data-test="apply-endorsement-email-select-unit-test"]')
      .first()
      .props()
      .onChange(value);

    expect(
      wrapper
        .find('[data-test="apply-endorsement-email-table-unit-test"]')
        .first()
        .props()
        .dataSource(),
    ).toBe(value);
  });

  it('Is function called when user input words.', () => {
    wrapper
      .find('[data-test="apply-endorsement-email-select-unit-test"]')
      .first()
      .props()
      .onSearch('test');
  });
});
