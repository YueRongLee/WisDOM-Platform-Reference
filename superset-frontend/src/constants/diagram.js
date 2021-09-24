export const NODE = {
  DATASET: {
    key: 'DATASET',
    name: 'DataSet',
    selectable: true,
    list: {
      TABLE: {
        key: 'TABLE',
        selectable: false,
        initPosition: [100, 100],
        color: '#16758c',
      },
      CUSTOMIZED: {
        name: 'Customized',
        key: 'CUSTOMIZED',
        selectable: true,
        initPosition: [100, 200],
        portAction: ['addOutPort'],
        color: '#16758c',
      },
    },
  },
  SETTING: {
    key: 'SETTING',
    name: 'Extra',
    selectable: true,
    list: {
      CONFIG: {
        name: 'Output Setting',
        key: 'CONFIG',
        selectable: true,
        initPosition: [300, 100],
        initLink: 'OutputNode',
        color: '#5e676b',
      },
    },
  },
  OUTPUT: {
    list: {
      OUTPUT: {
        key: 'OUTPUT',
        initPosition: [500, 100],
        color: '#444e7c',
      },
    },
  },
  FUNCTION: {
    list: {
      JoinNode: {
        name: 'Join',
        key: 'JoinNode',
        color: '#90979a',
      },
      WhereNode: {
        name: 'Where',
        key: 'WhereNode',
        color: '#90979a',
      },
      CalculateNode: {
        name: 'Calculate',
        key: 'CalculateNode',
        color: '#90979a',
      },
      GroupNode: {
        name: 'Group',
        key: 'GroupNode',
        color: '#90979a',
      },
    },
  },
};
