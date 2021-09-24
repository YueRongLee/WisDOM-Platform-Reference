import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import { render } from '@testing-library/react';
import MathFunction from 'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/MathFunction';
// import { act } from 'react-dom/test-utils';
// import { setHookState } from '../../../helpers/hook';

Enzyme.configure({ adapter: new Adapter() });

describe('MathFunction', () => {
  it('is valid', () => {
    const nodeData = {
      name: 'test',
      type: 'test',
      id: 'test',
      edit: true,
    };

    const data = {
      nodes: [
        {
          id: 'test',
          args: {
            classification: 'test',
          },
          check: 'error',
        },
      ],
      edges: [],
    };

    const data2 = {
      nodes: [
        {
          id: 'test',
          args: {
            classification: 'test',
          },
        },
      ],
      edges: [],
    };

    const nodeParents = {
      id: 'test',
      type: 'Dataset',
    };
    const setSelectFinish = jest.fn();
    const setData = jest.fn();
    const setFocusNode = jest.fn();
    const schemaLoading = jest.fn();
    const setNodeChange = jest.fn();
    const onBlurInput = jest.fn();
    const handleChangePosition = jest.fn();
    const objAry = { 123: 'Round', 465: 'Add' };
    const hangeValueChange = jest.fn(() => objAry);
    const setDisableCol = jest.fn(() => false);
    const onBlurCheck = jest.fn();
    const mathFilds = {
      valueUsing: '123',
      mathType: 'Round',
      newColumn: '123',
      column1: '123',
      column2: '123',
    };

    const wrapper = mount(
      <MathFunction
        nodeData={nodeData}
        nodeParents={nodeParents}
        setSelectFinish={setSelectFinish}
        data={data2}
        setData={setData}
        setFocusNode={setFocusNode}
        schemaLoading={schemaLoading}
        setNodeChange={setNodeChange}
      />,
    ); // mount/render/shallow when applicable

    expect(wrapper.find('.node-wrapper')).toExist();

    const wrapperS = shallow(
      <MathFunction
        nodeData={nodeData}
        nodeParents={nodeParents}
        setSelectFinish={setSelectFinish}
        data={data}
        setData={setData}
        setFocusNode={setFocusNode}
        schemaLoading={schemaLoading}
        setNodeChange={setNodeChange}
        onBlur={() => onBlurInput}
        onClick={handleChangePosition}
        onValuesChange={hangeValueChange}
        showInput
        disableCol={false}
        setDisableCol={setDisableCol}
        mathFilds={mathFilds}
        onBlurCheck={onBlurCheck}
      />,
    );

    const input = wrapper.find('[data-test="inputValue"]');
    expect(input.length).toEqual(3);

    wrapperS.find('[data-test="inputValue"]').props('inputValue').onBlur();
    expect(onBlurInput).toHaveBeenCalledTimes(0);

    wrapperS.find('[data-test="formValueChange"]').props().onValuesChange();
    expect(hangeValueChange(objAry)).toBeTruthy();
  });
});

// describe('Test', () => {
//   const defaultProps = {
//     onSubmit: jest.fn(),
//     onClear: jest.fn(),
//     onChange: jest.fn(),
//     onBlur: jest.fn(),
//     value: '',
//   };

//   const factory = overrideProps => {
//     const props = { ...defaultProps, ...(overrideProps || {}) };
//     return shallow(<MathFunction {...props} />);
//   };

//   let wrapper;

//   beforeAll(() => {
//     wrapper = factory();
//   });
// });
