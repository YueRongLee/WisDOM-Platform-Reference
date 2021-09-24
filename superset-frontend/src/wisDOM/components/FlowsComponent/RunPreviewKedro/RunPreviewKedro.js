/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Alert, Spin } from 'antd';
import PropTypes, { node } from 'prop-types';
// import SqlKedro from 'src/wisDOM/components/SqlKedro/SqlKedro';
import KedroViz from '@wisdom_dataplatform/wisdom-kedro-viz';
// import { DataFlowApi } from '~~apis/';
import { FUNCTIONS } from '~~constants/index';
import * as Style from './style';

const RunPreviewKedro = ({ diagram, nodeInfo }) => {
  const [kedroData, setKedroData] = useState();

  const getStatus = id => {
    const info = nodeInfo.filter(e => e.nodeId === id);
    if (info.length > 0) {
      //   const status =
      //     info[0].status === 'finished' || info[0].status === 'SUCCESS'
      //       ? 'success'
      //       : 'error';
      let status;
      // 相同id的話有多個info,抓最後一個的狀態
      const getInfoStatus =
        info.length > 1 ? info[info.length - 1].status : info[0].status;
      switch (getInfoStatus) {
        case 'finished': // Dataflow
          status = 'success';
          break;
        case 'error': // Dataflow
          status = 'error';
          break;
        case 'SUCCESS': // Workflow
          status = 'success';
          break;
        case 'FAIL': // Workflow
          status = 'error';
          break;
        default:
          status = undefined;
          break;
      }

      return status;
    }
    return undefined;
  };

  const formateNodes = tempDiagram => {
    const tmpDiagram = JSON.parse(tempDiagram);
    if (nodeInfo.length > 0 && tmpDiagram && tmpDiagram.nodes.length !== 0) {
      const newNode = tmpDiagram.nodes.map(e => ({
        id: e.id,
        type: e.type,
        name: FUNCTIONS.NODE_NAME(e.name),
        full_name: e.name,
        check: getStatus(e.id),
      }));

      const newData = {
        edges: tmpDiagram.edges,
        nodes: newNode,
      };

      return newData;
    }
    return tmpDiagram;
  };

  useEffect(() => {
    if (diagram && nodeInfo) {
      const data = formateNodes(diagram);
      setKedroData(data);
    }
  }, [diagram]);

  return (
    <>
      {diagram && kedroData ? (
        <div style={{ height: '100%', width: '100%' }}>
          <KedroViz data={kedroData} />
        </div>
      ) : (
        <div style={{ marginBottom: 24, width: '100%' }}>
          <Alert message="No Data" type="error" showIcon />
        </div>
      )}
    </>
  );
};
RunPreviewKedro.propTypes = {
  kedroData: PropTypes.arrayOf(PropTypes.object).isRequired,
};

RunPreviewKedro.defaultProps = {};

export default RunPreviewKedro;
