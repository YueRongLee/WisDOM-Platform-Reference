/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
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

const SelectField = ({
  nodeParents,
  nodeData,
  data,
  setData,
  setSelectFinish,
  setFocusNode,
  schemaLoading,
  setNodeChange,
  //   setSelectPage,
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
        thisNode.args.classification = 'SelectFields';
        thisNode.args.table_name = nodeParents[0].args.table_name
          ? nodeParents[0].args.table_name
          : nodeParents[0].full_name;
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
          // id變更
          //   const newID = thisNode.type + moment().format('x');
          //   const nodeFilter = data.nodes.filter(e => e.id !== thisNode.id);

          //   newEdge = data.edges.map(e =>
          //     e.source === thisNode.id || e.target === thisNode.id
          //       ? {
          //           source: e.source === thisNode.id ? newID : e.source,
          //           target: e.target === thisNode.id ? newID : e.target,
          //         }
          //       : {
          //           source: e.source,
          //           target: e.target,
          //         },
          //   );

          //   newNodes = [
          //     ...nodeFilter,
          //     {
          //       full_name: thisNode.name,
          //       name:
          //         thisNode.name.length > 10
          //           ? `${thisNode.name.substring(0, 8)}...`
          //           : thisNode.name,
          //       id: newID,
          //       type: thisNode.type,
          //       args: thisNode.args,
          //       check: thisNode.check,
          //       schema: thisNode.schema,
          //     },
          //   ];
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

  const findParent = () =>
    data.edges.filter(item => item.target === nodeData.id)[0].source;

  const getSchema = id => {
    if (id) {
      const index = data.nodes.findIndex(e => e.id === id);
      return { columns: data.nodes[index].schema };
    }
    const index = data.nodes.findIndex(e => e.id === findParent());
    return { columns: data.nodes[index].schema };
  };

  useEffect(() => {
    if (
      nodeParents[0].type === undefined ||
      nodeParents[0].type === DATAFLOW_TYPE.DATASET.value
    ) {
      getTableColumns(
        nodeParents[0].args && nodeParents[0].args.table_name !== undefined
          ? nodeParents[0].args.table_name
          : nodeParents[0].name,
      );
    } else {
      setTableInfo(getSchema(nodeParents[0].id));
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
        {/* <div className="checkbox-wrapper"> */}
        <div className="SelectField">
          <div style={{ color: '#00000099', margin: '10px 0 10px 10px' }}>
            Retain the selected columns
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
        </div>
      </Spin>
    </Style.InsertScroll>
  );
};

export default SelectField;
