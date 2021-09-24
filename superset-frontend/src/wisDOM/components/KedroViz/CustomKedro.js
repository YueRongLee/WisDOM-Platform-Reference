import React from 'react';
// import KedroViz from '@quantumblack/kedro-viz';
import KedroViz from '@wisdom_dataplatform/wisdom-kedro-viz';
import { FUNCTIONS } from '~~constants/index';
import './KedroStyle.less';

const CustomKedro = ({ kedroData }) => {
  const formateNodes = data => {
    if (data !== undefined) {
      const newNode = data.nodes.map(e => ({
        id: e.id,
        type: e.type,
        name: FUNCTIONS.NODE_NAME(e.name),
        full_name: e.name,
      }));

      const newData = {
        edges: data.edges,
        nodes: newNode,
      };

      return newData;
    }
    return data;
  };

  return (
    <>
      <div id="kedroChart" style={{ height: '100%', width: '100%' }}>
        <KedroViz theme="dark" data={formateNodes(kedroData)} />
      </div>
    </>
  );
};

export default CustomKedro;
