import React from 'react';
import { mount } from 'enzyme';
import ConditionNodeMenu from 'src/wisDOM/components/WorkflowKedro/components/Menu/ConditionNodeMenu';

describe('wisDOM App', () => {
  it('is valid', () => {
    expect(React.isValidElement(<ConditionNodeMenu />)).toBe(true);
    mount(<ConditionNodeMenu />);
  });
});
