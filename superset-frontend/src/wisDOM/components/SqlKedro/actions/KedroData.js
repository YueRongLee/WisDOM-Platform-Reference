// 組合成 kedro json
import moment from 'moment';
import { FUNCTIONS } from '~~constants/index';

export function tableDataformat(data) {
  return {
    edges: [],
    nodes:
      data.length !== 0
        ? data.map((item, index) => ({
            // id: item.guid,
            // id: `Dataset${index + 1}`,
            id: `Dataset${moment().format('x')}${index + 1}`,
            type: 'Dataset',
            name: FUNCTIONS.NODE_NAME(item.name),
            full_name: item.name,
            tableInfo: { ...item },
            schema:
              item.columns &&
              item.columns.length > 0 &&
              item.columns.map(e => ({
                name: e.name,
                type: e.type,
              })),
            args: {
              name: item.name,
              table_name: item.name,
              type: 'datasource',
              classification: 'DataSource',
            },
          }))
        : [],
  };
}

// 組合成 dataset 中的 table columns
export function tableSchema(data, dataset) {
  const index = data.nodes.findIndex(e => e.full_name === dataset);
  const nodeColumns = data.nodes[index].tableInfo.columns;
  return nodeColumns;
}
