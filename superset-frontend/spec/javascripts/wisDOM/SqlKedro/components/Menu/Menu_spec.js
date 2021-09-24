import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import { render } from '@testing-library/react';
import Menu from 'src/wisDOM/components/SqlKedro/components/Menu/Menu';
import { DATAFLOW_TYPE } from '~~constants/index';

Enzyme.configure({ adapter: new Adapter() });

jest.mock(
  'src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/Customize',
  () => jest.fn(() => <div />),
);

describe('Menu', () => {
  it('is valid', () => {
    const nodeData = {
      name: 'test',
      type: 'Target',
      id: 'test',
      edit: true,
      args: {
        name: 'test',
        table_name: 'table_name',
      },
    };
    const focusNode = {
      name: 'test',
      type: 'Target',
      id: 'test',
    };
    const data = {
      nodes: [
        {
          id: 'test',
          args: {
            classification: 'test',
          },
          check: 'error',
          schema: null,
          mapping: [],
        },
      ],
      edges: [
        {
          target: 'test',
          source: '456',
        },
      ],
    };
    const defaultTable = {
      nodes: [
        {
          id: '123',
        },
      ],
    };
    const selectNode = '123';
    const groupId = 'test';
    const projectName = 'testprojectName';
    const setData = jest.fn();
    const setFocusNode = jest.fn();
    const setNodeChange = jest.fn();
    const setRecordHeader = jest.fn();
    const handleGetSchema = jest.fn();
    const getParentSource = jest.fn();
    const setSelectFinish = jest.fn();
    const setSelectPage = jest.fn();
    const setNodeData = jest.fn();
    const setSchemaLoading = jest.fn();
    const wrapper = mount(
      <Menu
        schemaLoading={false}
        setSchemaLoading={setSchemaLoading}
        projectName={projectName}
        selectNode={selectNode}
        nodeData={nodeData}
        data={data}
        setData={setData}
        groupId={groupId}
        setFocusNode={setFocusNode}
        selectPage={DATAFLOW_TYPE.NEWNODE.key}
        recordHeader="node"
        setSelectPage={setSelectPage}
        setNodeChange={setNodeChange}
        setRecordHeader={setRecordHeader}
        handleGetSchema={handleGetSchema}
        getParentSource={getParentSource}
        setSelectFinish={setSelectFinish}
        focusNode={focusNode}
        setNodeData={setNodeData}
        defaultTable={defaultTable}
      />,
    ); // mount/render/shallow when applicable

    mount(
      <Menu
        selectPage={DATAFLOW_TYPE.DATASET.key}
        projectName={projectName}
        selectNode={selectNode}
        nodeData={nodeData}
        data={data}
        setData={setData}
        groupId={groupId}
        setFocusNode={setFocusNode}
        setSelectPage={setSelectPage}
        setNodeChange={setNodeChange}
        setRecordHeader={setRecordHeader}
        handleGetSchema={handleGetSchema}
        getParentSource={getParentSource}
        setSelectFinish={setSelectFinish}
        focusNode={focusNode}
        setNodeData={setNodeData}
        defaultTable={defaultTable}
      />,
    ); // mount/render/shallow when applicable

    mount(
      <Menu
        selectPage={DATAFLOW_TYPE.TRANSFORM.key}
        projectName={projectName}
        selectNode={selectNode}
        nodeData={nodeData}
        data={data}
        setData={setData}
        groupId={groupId}
        setFocusNode={setFocusNode}
        setSelectPage={setSelectPage}
        setNodeChange={setNodeChange}
        setRecordHeader={setRecordHeader}
        handleGetSchema={handleGetSchema}
        getParentSource={getParentSource}
        setSelectFinish={setSelectFinish}
        focusNode={focusNode}
        setNodeData={setNodeData}
        defaultTable={defaultTable}
      />,
    ); // mount/render/shallow when applicable

    mount(
      <Menu
        selectPage={DATAFLOW_TYPE.TARGET.key}
        projectName={projectName}
        selectNode={selectNode}
        nodeData={nodeData}
        data={data}
        setData={setData}
        groupId={groupId}
        setFocusNode={setFocusNode}
        setSelectPage={setSelectPage}
        setNodeChange={setNodeChange}
        setRecordHeader={setRecordHeader}
        handleGetSchema={handleGetSchema}
        getParentSource={getParentSource}
        setSelectFinish={setSelectFinish}
        focusNode={focusNode}
        setNodeData={setNodeData}
        defaultTable={defaultTable}
      />,
    ); // mount/render/shallow when applicable

    mount(
      <Menu
        selectPage={DATAFLOW_TYPE.TARGET.key}
        projectName={projectName}
        selectNode={selectNode}
        nodeData={nodeData}
        data={data}
        setData={setData}
        groupId={groupId}
        setFocusNode={setFocusNode}
        setSelectPage={setSelectPage}
        setNodeChange={setNodeChange}
        setRecordHeader={setRecordHeader}
        handleGetSchema={handleGetSchema}
        getParentSource={getParentSource}
        setSelectFinish={setSelectFinish}
        focusNode={focusNode}
        setNodeData={setNodeData}
        defaultTable={defaultTable}
      />,
    ); // mount/render/shallow when applicable

    expect(wrapper.find('.Menu')).toExist();
  });
});
