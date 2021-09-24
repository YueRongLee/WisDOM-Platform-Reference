/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-restricted-imports
import { Spin, Table, Input, message } from 'antd';
import { DATAFLOW_TYPE } from '~~constants/index';
import * as Style from './style';

const column = [
  {
    key: 'name',
    dataIndex: 'name',
    title: 'column',
  },
  {
    key: 'type',
    title: 'type',
    dataIndex: 'type',
  },
];

const OutputSchema = ({ nodeData, data, schemaLoading }) => {
  const [tableInfo, setTableInfo] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleChange = (index, text, record) => {
    const nodeIndex =
      data !== undefined ? data.nodes.findIndex(e => e.id === nodeData.id) : -1;
    if (nodeIndex !== -1) {
      const cols = data.nodes[nodeIndex].args.columnDescription[index];
      if (text === '') {
        message.error('Column description is empty !');
      }

      cols.description = text !== '' ? text : record.name;
      const newInfo = tableInfo;
      newInfo[index].description = text !== '' ? text : record.name;
      setTableInfo(newInfo);
    }
  };

  const columnTarget = [
    {
      key: 'name',
      dataIndex: 'name',
      title: 'column',
    },
    {
      key: 'type',
      title: 'type',
      dataIndex: 'type',
    },
    {
      title: 'Column Description',
      dataIndex: 'description',
      key: 'description',
      render: (text, record, index) => (
        <Input
          data-test="columnDescriptionInput"
          placeholder="Column Description"
          disabled={!nodeData.edit}
          onBlur={e => handleChange(index, e.target.value, record)}
          defaultValue={text}
        />
      ),
    },
  ];

  const getColumns = () => {
    setLoading(true);
    const index =
      data !== undefined ? data.nodes.findIndex(e => e.id === nodeData.id) : -1;

    if (index !== -1) {
      const { schema } = data.nodes[index];
      const nodeArg = data.nodes[index].args;
      if (
        nodeData.type.toLowerCase() === DATAFLOW_TYPE.TARGET.key &&
        nodeArg.publish === true
      ) {
        setShowInput(true);
      } else {
        setShowInput(false);
      }

      if (schema !== null && schema !== undefined) {
        if (
          nodeArg.columnDescription &&
          nodeArg.columnDescription.length === schema.length
        ) {
          // 改名後可能columnDescription沒被吃到
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < schema.length; i++) {
            // if (nodeArg.columnDescription[i].name !== schema[i].name) {
            //   nodeArg.columnDescription[i].name = schema[i].name;
            // }
            nodeArg.columnDescription[i].name = schema[i].name;
            nodeArg.columnDescription[i].type = schema[i].type;
          }

          setTableInfo(nodeArg.columnDescription);
        } else {
          const tempDes =
            schema &&
            schema.map(e => ({
              name: e.name,
              type: e.type,
              description: e.description || e.name,
            }));
          nodeArg.columnDescription = tempDes;
          setTableInfo(tempDes);
        }
        // setTableInfo(schema);z
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    getColumns();
  }, []);

  return (
    <Spin
      wrapperClassName="schema-list-wrapper"
      spinning={isLoading || schemaLoading}
    >
      <Style.SqlKedroBlock id="dataflow-output-schema">
        <Table
          dataSource={tableInfo}
          columns={showInput ? columnTarget : column}
          rowKey="name"
          pagination={false}
          scroll={{ y: '40vh' }}
        />
      </Style.SqlKedroBlock>
    </Spin>
  );
};

export default OutputSchema;
