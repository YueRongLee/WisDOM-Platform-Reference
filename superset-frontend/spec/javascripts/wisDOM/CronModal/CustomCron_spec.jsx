import React from 'react';
// import sinon from 'sinon';
import { mount } from 'enzyme';
import CustomCron from 'src/wisDOM/components/CronModal/CustomCron';

describe('wisDOM App', () => {
  it('is valid', () => {
    const getUIValue = '0 04 * * *';
    const setGetUIValue = jest.fn();
    const setUItoValue = jest.fn();
    const setSubmitIsLoading = jest.fn();
    const setOkIsLoading = jest.fn();
    const wrapper = mount(
      <CustomCron
        setGetUIValue={setGetUIValue}
        modalVisible
        okIsLoading
        getUIValue={getUIValue}
        setUItoValue={setUItoValue}
        setSubmitIsLoading={setSubmitIsLoading}
        setOkIsLoading={setOkIsLoading}
      />,
    );
    expect(wrapper.find('.cronSelect')).toExist();
    expect(wrapper.find('.cronSelectText')).toExist();
  });
});
