/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Spin, Table } from 'antd';
import { DataFlowApi } from 'src/apis/';

const Sample = ({ groupId, data, nodeData }) => {
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [dataSource, setDataSource] = useState([]);

  const getWidth = () => columns.length * 150;

  const getTableSampleData = async () => {
    try {
      setLoading(true);

      // 取得當前點擊的 node 的 index
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      if (index !== -1) {
        const thisNode = data.nodes[index];

        // 取得 table sample data
        const payload = {
          groupId,
          tableName: thisNode.args.table_name,
        };
        const sample = await DataFlowApi.getTableSampleData(payload);

        // 取得 dataSource
        sample.forEach((data, index) => {
          setDataSource(prev => [...prev, { ...data, key: index }]);
        });

        // 取得columns
        for (const [key, value] of Object.entries(sample[0])) {
          setColumns(prev => [
            ...prev,
            {
              title: key,
              dataIndex: key,
              key,
              width: 150,
              render: value =>
                value !== undefined && value !== null && value.toString
                  ? value.toString()
                  : value,
            },
          ]);
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTableSampleData();
  }, []);

  return (
    // const [loading, setLoading] = useState(false);

    <Spin className="dataset-sample-tab" spinning={loading}>
      <div>
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          scroll={{ x: getWidth(), y: '40vh' }}
        />
      </div>
    </Spin>
  );
};
export default Sample;
