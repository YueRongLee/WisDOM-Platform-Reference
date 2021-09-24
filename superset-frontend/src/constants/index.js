import AppConfig from '~~config';
import * as DIAGRAM from './diagram';
import * as SVGICONS from './svgIcons';
import * as FUNCTIONS from './functions';
import * as ROLEPERMISSION from './rolePermission';
import * as HARD_CODE from './hardCode';

export { DIAGRAM, SVGICONS, FUNCTIONS, ROLEPERMISSION, HARD_CODE };

export const SET_MATOMO = {
  URL_BASE: AppConfig.MATOMO_URL_BASE,
  SITE_ID: AppConfig.MATOMO_SITE_ID,
};

export const TAB_KEY = {
  FIND_DATA: 'FIND_DATA',
  EXPLORE: 'EXPLORE',
  DATAFLOW: 'DATAFLOW',
};

// 起始英文,結尾英文或數字,可允許單一英文
export const TABLE_NAME_RULES = {
  // pattern: new RegExp(/^[A-Za-z]+([A-Za-z0-9_]|)+([A-Za-z0-9])$/i),
  pattern: new RegExp(/^[A-Za-z]+(([A-Za-z0-9_]|)+[A-Za-z0-9]|)$/i),
};

// export const TABLE_NAME_RULES = {
//   pattern: new RegExp(/^[A-Za-z]+[A-Za-z0-9_]*$/i),
// };

export const ROLE_NAME_RULES = {
  pattern: new RegExp(/^[A-Za-z0-9_-\s/()]*$/i),
};

// for node name
export const FLOW_NAME_RULES = {
  //   pattern: new RegExp(/^[A-Za-z0-9_\s/()]*$/i),
  pattern: new RegExp(/^[A-Za-z]+(([A-Za-z0-9_]|)+[A-Za-z0-9]|)$/i),
};

export const NEW_COLUMN_RULES = {
  pattern: new RegExp(/^[A-Za-z_]*$/i),
};

export const COLUMN_RULES = {
  pattern: new RegExp(/^[a-z0-9_]*$/i),
};

export const MATH_RULES = {
  pattern: new RegExp(/^[0-9.-]*$/i),
};

export const NUMBER_RULES = {
  pattern: new RegExp(/^[0-9]*$/i),
};

export const TERM_SOURCE = {
  WKC: {
    key: 'WKC',
    value: 'wkc',
  },
};

export const INPUT_RULES = {
  TABLE_NAME: { value: 400 },
  TABLE_DESCRIPTION: { value: 500 },
  COLUMN_NAME: { value: 255 },
  COLUMN_DESCRIPTION: { value: 500 },
  HOST: { value: 100 },
  PORT: { value: 100 },
  DB_NAME: { value: 100 },
  USER_NAME: { value: 100 },
  USER_PW: { value: 100 },
  GROUP_NAME: { value: 255 },
  REASON: { value: 1000 },
  PROJECT_NAME: { value: 100 },
  ENTITY_NAME: { value: 400 },
  ENTITY_DESCRIPTION: { value: 500 },
  NICKNAME: { value: 100 },
  DEPARTMENT_NAME: { value: 20 },
  EMAIL: { value: 200 },
  CONSUME_SCOPE: { value: 15 },
  CONSUME_VALUE: { value: 15 },
  MATH_VALUE: { value: 20 }, // 加減乘除長度
  MATH_ROUND_VALUE: { value: 10 }, // 四捨五入長度
  CATEGORY_NAME: { value: 14 },
  POWERBI_COMMENT: { value: 150 },
};

export const SYSTEM_TYPE = {
  props: {
    WisDOM: {
      key: 'WisDOM',
      name: 'WisDOM',
      color: '#fb8435',
    },
    WDC: {
      key: 'WDC',
      name: 'WisDOM Deliver (Cloud)',
      color: '#b77cae',
    },
    WDL: {
      key: 'WDL',
      name: 'WisDOM Deliver (Local)',
      color: '#fa5252',
    },
    ITPG: {
      key: 'ITPG',
      name: 'IT deliver zone (Postgres)',
      color: '#fab005',
    },
    // 還沒實做
    // ITMO: {
    //   key: 'ITMO',
    //   name: 'IT deliver zone (MiniO)',
    //   color: '#228be6',
    // },
    ITKA: {
      key: 'ITKA',
      name: 'IT deliver zone (Kafka)',
      color: '#15aabf',
    },
  },
  getOptionList: () => Object.values(SYSTEM_TYPE.props),
};

// export const CONSUME_TYPE = {
//   ITPG:'ITPG',
//   ITMO: 'ITMO',
//   ITKA: 'ITKA',
//   WisDOM: 'WisDOM',
//   Dataflow: 'Dataflow',
//   user_define: 'user_define',
//   sync: 'sync',
//   WDC: 'WDC',
//   WDL: 'WDL',
//   CustomDB: 'CustomDB',
//   CDM: 'CDM',
// }

export const DB_TYPE = {
  props: {
    postgres: { value: 'postgres' },
    mssql: { value: 'mssql' },
    mysql: { value: 'mysql' },
    oracle: { value: 'oracle' },
  },
  getOptionList: () => Object.values(DB_TYPE.props),
};

export const PREVIEW_STATUS = {
  NOT_ALLOWED: {
    value: 0,
    name: 'Not Allowed',
  },
  ALLOWED: {
    value: 1,
    name: 'Allowed',
  },
  APPLYING: {
    value: 2,
    name: 'Applying',
  },
  REJECT: {
    value: 3,
    name: 'Reject',
  },
  EXTEND_NOTIFIED: {
    value: 4,
    name: 'Need to extend',
  },
  EXTEND_APPLYING: {
    value: 5,
    name: 'Extend applying',
  },
  PREVIEW: {
    value: 7,
    name: 'PREVIEW',
  },
  // TODO: need check code
  ENDORSEMENT: {
    value: 8,
    name: 'Add Endorsement',
  },
};

export const APPLICATION_RECORD_STATUS = {
  NOT_ALLOWED: {
    value: 0,
    name: 'Rejected',
  },
  ALLOWED: {
    value: 1,
    name: 'Approved',
  },
  APPLYING: {
    value: 2,
    name: 'Applying',
  },
  REJECT: {
    value: 3,
    name: 'Rejected',
  },
  EXTEND_NOTIFIED: {
    value: 4,
    name: 'Need to extend',
  },
  EXTEND_APPLYING: {
    value: 5,
    name: 'Extend applying',
  },
  EXPIRED: {
    value: 6,
    name: 'Expired',
  },
};

export const CONSUME_STATUS = {
  NOT_CONSUMEABLE: 0,
  CONSUMEABLE: 1,
};

export const DATE_TYPE = {
  DATE: 'YYYY/MM/DD',
  DATE_TIME: 'YYYY/MM/DD HH:mm',
  DATE_TIME_WITH_SEC: 'YYYY/MM/DD HH:mm:ss',
};

export const ROLE_TYPE = {
  DATA_MASTER: 'Data Administrator',
  SYSTEM_MASTER: 'System Administrator',
};

export const ACTION_TYPE = {
  append: {
    value: 'append',
    name: 'Append',
  },
  overwrite: {
    value: 'overwrite',
    name: 'Overwrite',
  },
  upsert: {
    value: 'upsert',
    name: 'Update and Append',
  },
};

export const BLOCKCHAIN_STATUS = {
  LEDGER_INPUT_OK: 'LEDGER_INPUT_OK',
  VERIFY_OK: 'VERIFY_OK',
};

export const GROUP_TYPE = {
  DEFAULT: 1,
  CUSTOMIZED: 0,
};

export const OUTPUT_TYPE = {
  props: {
    CDM: {
      key: 'outputCDM',
      value: 'CDM',
      showName: 'CDM',
    },
    DB: {
      key: 'outputDB',
      value: 'DB',
      showName: SYSTEM_TYPE.props.WDC.name,
    },
    HIVE: {
      key: 'outputHive',
      value: 'HIVE',
      showName: SYSTEM_TYPE.props.WisDOM.name,
    },
    WL: {
      key: 'outputWl',
      value: 'WL',
      showName: SYSTEM_TYPE.props.WDL.name,
    },
    CUSTOM: {
      key: 'outputCustom',
      value: 'CUSTOM',
      showName: 'Customized DB',
      dbInfo: {
        host: undefined,
        port: undefined,
        database: undefined,
        dbType: undefined, // DB_TYPE props value
        userName: undefined,
        password: undefined,
      },
    },
  },
  getOptionList: () => Object.values(OUTPUT_TYPE.props),
};

export const NODE_INFO_TEXT = {
  filter:
    'Use a filter to retain data from your dataset based on one or more conditions.',
  changeformat:
    'Use a format transformation to change the format of the data in a column.',
  renamefields: 'Use this transformation to rename a column.',
  join: 'The default join in most database systems.',
  customize: 'Add a custom SQL script what you need.',
  selectfields:
    'Use a delete column transformation to retain selected columns.',
  removeduplicates:
    'Use duplicates transformations to remove duplicate rows in the selected columns.',
  mergecolumn: 'Use a merge transformation to combine data from two columns.',
  groupby:
    'Apply an aggregation. For each aggregation, there is a conditional aggregate.',
  innerJoin:
    'Use an inner join when you want to see only the data that matches between two datasets.',
  leftJoin:
    'In a graphical interface, you can see which dataset is at right or left. In a SQL statement, the first dataset is considered the left one. Choosing a left outer join as opposed to a right outer join depends only on how the datasets appear in your query tool.',
  rightJoin:
    'In a graphical interface, you can see which dataset is at right or left. In a SQL statement, the first dataset is considered the left one. Choosing a left outer join as opposed to a right outer join depends only on how the datasets appear in your query tool.',
  schedule: 'You choose when and how often it runs.',
  postAPI: 'You can trigger by http interface. ',
  insertData: 'Put data into wisdom deliver zone',
  postTeam: 'Post a message to a group. ',
  sendMail: 'Send a mail to user. ',
  condition:
    'Identifies which block of actions to execute based on the evaluation of condition input.',
  powerBi: 'Create one page report on Power BI.',
  makeDataRobotPrediction:
    'Make a predicition via DataRobot AutoML/AutoTS Services.',
  createDataRobotProject:
    'Create a Project and import training dataset on DataRobot.',
  missingvalues: 'Modify the column by NULL values.',
  customvalues: 'Modify the column by custom values.',
  changedatatype:
    'Use data type transformations to change the data type of a column.',
};

export const DATAFLOW_TYPE = {
  DATASET: {
    key: 'dataset',
    value: 'Dataset',
  },
  CLEANSING: {
    key: 'cleansing',
    value: 'Cleansing',
    props: {
      MISSINGVALUE: {
        key: 'missingvalues',
        value: 'MissingValues',
      },
      CUSTOMVALUE: {
        key: 'customvalues',
        value: 'CustomValues',
      },
    },
    getList: () => Object.values(DATAFLOW_TYPE.CLEANSING.props),
  },
  TRANSFORM: {
    key: 'transform',
    props: {
      SELECTFIELDS: {
        key: 'selectfields',
        // value: 'RemoveColumns',
        value: 'SelectFields',
        label: 'RemoveColumns',
      },
      CUSTOMIZE: {
        key: 'customize',
        value: 'Customize',
        label: 'Customize',
      },
      JOIN: {
        key: 'join',
        value: 'Join',
        label: 'Join',
      },
      RENAMEFIELDS: {
        key: 'renamefields',
        // value: 'RenameColumns',
        value: 'RenameFields',
        label: 'RenameColumns',
      },
      GROUPBY: {
        key: 'groupby',
        value: 'GroupBy',
        label: 'GroupBy',
      },
      // JOINRENAMEFIELDS: {
      //   key: 'joinrenamefields',
      //   value: 'JoinRenameFields',
      // },
      FILTER: {
        key: 'filter',
        value: 'Filter',
        label: 'Filter',
      },
      CHANGEFORMAT: {
        key: 'changeformat',
        value: 'ChangeFormat',
        label: 'ChangeFormat',
      },
      CHANGEDATATYPE: {
        key: 'changedatatype',
        value: 'ChangeDataType',
        label: 'ChangeDataType',
      },
      MATHFUNCTION: {
        key: 'mathfunction',
        value: 'MathFunction',
        label: 'MathFunction',
      },
      REMOVEDUPLICATES: {
        key: 'removeduplicates',
        value: 'RemoveDuplicates',
        label: 'RemoveDuplicates',
      },
      MERGECOLUMN: {
        key: 'mergecolumn',
        value: 'MergeColumn',
        label: 'MergeColumn',
      },
      UNION: {
        key: 'union',
        value: 'Union',
        label: 'Union',
      },
    },
    OUTPUTDATA: {
      key: 'outputTransform',
    },
    getList: () => Object.values(DATAFLOW_TYPE.TRANSFORM.props),
  },
  TARGET: {
    key: 'target',
    PROPERTIES: {
      key: 'properties',
    },
    OUTPUTDATA: {
      key: 'output-data',
    },
  },
  NEWNODE: {
    key: 'new_node',
  },
};

export const checkErrorInput = name => {
  const regex = new RegExp(/^[A-Za-z0-9_-\s/()]*$/i);
  return regex.test(name);
};

// forIcons
export const InnerJoinIcon = {};

export const GROUPBY_TYPE = {
  props: {
    GROUPBY: {
      key: 'groupby',
      value: 'Group by',
    },
    SUM: {
      key: 'sum',
      value: 'Sum',
    },
    COUNT: {
      key: 'count',
      value: 'Count',
    },
    MAX: {
      key: 'max',
      value: 'Max',
    },
    MIN: {
      key: 'min',
      value: 'Min',
    },
    MEAN: {
      key: 'mean',
      value: 'Mean',
    },
    MEDIAN: {
      key: 'median',
      value: 'Median',
    },
  },
  getList: () => Object.values(GROUPBY_TYPE.props),
};

export const INFO_TITLE = {
  functionReleases: 'functionReleases',
  sitemap: 'sitemap',
  systemGuidebook: 'systemGuidebook',
  dataSecurityPolicy: 'dataSecurityPolicy',
  learningByFunctions: 'learningByFunctions',
  learningByScenarios: 'learningByScenarios',
  workshop: 'workshop',
};

export const ROLE_MANAGEMENT_TYPE = {
  SYSTEM_ROLE: 'systemRole',
  DATA_ROLE: 'dataRole',
  SYSTEM_ROLES: 'systemRoles',
  DATA_ROLES: 'dataRoles',
  SYSTEM_ROLE_PERMISSION: 'system',
  DATA_ROLE_PERMISSION: 'data',
};

export const WKC_MESSAGE = {
  error:
    'The connection to Watson Knowledge Catalog (wkc) is temporarily wrong. Please try again later. If you have encountered this issue for several hours, please contact Hiram Shen (Hiram_Shen@wistron.com).',
  info:
    'Watson Knowledge Catalog (wkc) is currently undergoing routine maintenance. WisDOM will provide you with wkc service after the routine maintenance is completed.',
};
