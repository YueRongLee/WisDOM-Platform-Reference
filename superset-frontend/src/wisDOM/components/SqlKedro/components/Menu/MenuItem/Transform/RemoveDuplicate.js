/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Table, Spin } from 'antd';
import { TableApi } from '~~apis/';
import { DATAFLOW_TYPE, FUNCTIONS } from '~~constants/index';
import * as Style from './style';
import '../Menu.less';

const columns = [
  {
    title: 'Column',
    dataIndex: 'name',
  },
  {
    title: 'Data Type',
    dataIndex: 'type',
  },
];

const RemoveDuplicate = ({
  nodeParents,
  nodeData,
  data,
  setData,
  setSelectFinish,
  setFocusNode,
  schemaLoading,
  setNodeChange,
}) => {
  const [tableInfo, setTableInfo] = useState([]);
  const [selectedRowKeys, setDefault] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setLoading(true);
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      if (index !== -1) {
        const thisNode = data.nodes[index];
        thisNode.args.classification = 'RemoveDuplicates';
        // thisNode.args.table_name = nodeParents.name;
        thisNode.args.fields = selectedRows.map(item => item.name);
        setDefault(thisNode.args.fields);
        let bolCheck = false;
        if (thisNode.args.fields.length === 0) {
          if (thisNode.check !== 'error') {
            thisNode.check = 'error';
            thisNode.schema = null;
            bolCheck = true;
          }
        } else if (thisNode.check !== undefined) {
          thisNode.check = undefined;
          bolCheck = true;
        }

        const newNodes = [...data.nodes];
        const newEdge = [...data.edges];
        if (bolCheck === true) {
          setNodeChange(thisNode);
        } else {
          setSelectFinish(false);
          setData({
            edges: newEdge,
            nodes: newNodes,
          });
          setFocusNode({
            full_name: thisNode.name,
            name: FUNCTIONS.NODE_NAME(thisNode.name),
            id: thisNode.id,
            type: thisNode.type,
            check: thisNode.check,
          });
        }
      }
      setLoading(false);
    },
    getCheckboxProps: record => ({
      disabled: !nodeData.edit ? record.name : '',
      name: record.name,
    }),
  };

  const getTableColumns = async tableName => {
    setLoading(true);
    try {
      const result = await TableApi.getAllowedTableColumns(tableName);
      setTableInfo({
        tableName: result && result.table ? result.table.name : '',
        columns: result && result.table ? result.table.columns : [],
        lastUpdateTime: result && result.lastUpdateTime,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getSchema = id => {
    const index = data.nodes.findIndex(e => e.id === id);
    return { columns: data.nodes[index].schema };
  };

  useEffect(() => {
    if (
      nodeParents.type === undefined ||
      nodeParents.type === DATAFLOW_TYPE.DATASET.value
    ) {
      getTableColumns(
        nodeParents.full_name === undefined
          ? nodeParents.name
          : nodeParents.args.table_name,
      );
    } else {
      setTableInfo(getSchema(nodeParents.id));
    }

    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    if (index !== -1) {
      const nodeArg = data.nodes[index].args;
      if (nodeArg.fields !== undefined) {
        setDefault(nodeArg.fields);
      }
    }
  }, []);

  return (
    <Style.InsertScroll>
      <Spin
        wrapperClassName="schema-list-wrapper"
        spinning={isLoading || schemaLoading}
      >
        <div style={{ color: '#00000099', margin: '20px 0 20px 20px' }}>
          Retain the selected columns and then remove duplicate rows
        </div>
        <Table
          rowSelection={{
            type: 'Checkbox',
            ...rowSelection,
          }}
          style={{ overflow: 'unset' }}
          rowKey="name"
          columns={columns}
          dataSource={tableInfo.columns}
          pagination={false}
        />
      </Spin>
    </Style.InsertScroll>
  );
};

export default RemoveDuplicate;
