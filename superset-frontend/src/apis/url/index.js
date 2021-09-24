const ATLAS_QUERY = {
  GET_ENTITY_LIST_FROM_ATLAS: '/basic',
  GET_TERM: '/queryTerm',
  GET_USER_SELECT_TABLE: '/findData/getTemp',
  SAVE_SELECT_ETL: '/findData/saveTemp',
  WKC_DATA: '/wkcDataAssetDetail',
  WKC_RELATED_TABLE: '/wkcRelatedTables',
};

const ETL = {
  GET_ETL_LIST: '/etl/list',
  GET_SQL: '/etl/parsingDiagram',
  SAVE_ETL: '/etl/save',
  DELETE_ETL: '/etl/delete',
  UPDATE_ETL: '/etl/update',
  GET_DETAIL: '/etl',
  GET_SHARE_LIST: '/etl/share/list',
  SHARE_ETL: '/etl/share',
  GET_SHARE_DETAIL: '/etl/share/{id}',
  SET_ETL_EDIT: '/etl/edit',
  CANCEL_ETL_EDIT_STATUS: '/etl/edit/cancel',
};

const EVIDENCE = {
  VERIFY: '/evidence/verify',
};

const METADATA = {
  GET_USER_TABLE: '/metadata/getUserDefineTable',
  GET_USER_TABLE_SCHEMA: '/metadata/getUserDefineTableSchema',
  GET_COLUMN_TYPE: '/metadata/getColumnType',
  GET_USER_DEFINED_LIST: '/metadata/query',
  GRANT_USER_DEFINED_PERMISSION: '/metadata/chagneStatus',
};

const NIFI_DEPLOY = {
  CONSUME_TABLE: '/nifiDeploy/consume',
};

const PREVIEW = {
  PREVIEW_ETL: '/preview/etl',
  PREVIEW_TABLE: '/preview/table',
  PREVIEW_CHECK: '/preview/check',
  PREVIEW_CHECKS: '/preview/checkTables',
};

const ROLE = {
  GET_ROLES: '/getUserRoles',
  CHECK_CATEGORY: '/checkCategoryOwner',
};

const TABLE_AUTH = {
  TABLE_APPLY: '/table/apply',
  GET_APPROVE_LIST: '/table/queryUserAllowed',
  GRANT_PERMISSION: '/table/chagneAllowed',
  GET_USER_ALLOWED: '/table/getUserAllowedTable',
  TABLE_DELETE: '/table/delete',
  ALLOWED_TABLE: '/table/getUserAllowedTable',
  EXTEND_APPLY: '/table/extendApply',
  COLUMNFILTER_TRIAL_RUN: '/table/columnFilter/trialRun',
  COLUMNFILTER_PREVIEW: '/table/columnFilter/preview',
  DISABLE_ALLOWED: '/table/disableAllowed',
  GET_APPLICATION_HEALTH: '/table/info',
  GET_CATEGORY_APPLICATION_LIST: '/table/category/application/list',
  APPROVE_CATEGORY_APPLICATION: '/table/category/application/review',
  LAST_DATE: '/table/lastDate',
  GET_SIGN_OFF_INFO: '/table/queryUserAllowed',
  GET_USER_APPLY_RECORD: '/table/queryUserApplyRecord',
};

const TABLE_INFO = {
  GET_HEALTH: '/tableInfo',
  EDIT_DESCRIPTION: '/tableInfo/alterComment',
  GET_TABLE_LINEAGE: '/tableInfo/lineage',
  GET_TABLE_COLUMNS: '/tableInfo/getByGroupId',
  GET_TABLE_COLUMNS_BY_NAME: '/tableInfo/getByName',
  GET_TABLE_PERMISSION_FOR_GROUP: '/table/getTablePermissionForGroup',
  DELETE_TABLE_PERMISSION_FOR_GROUP: '/table/deleteTablePermissionForGroup',
  GET_TABLE: '/tableInfo/search',
  CHANGE_OWNER: '/tableInfo/changeOwner',
  CHANGE_CATEGORY: '/tableInfo/changeCategory',
  GET_USERALLOWS: '/tableInfo/userAllows',
  GET_APPRPVED_LIST: '/tableInfo/approvedApplication',
  GET_APPROVING_COUNTS: '/table/approvingCounts',
};

const TABLE_ON_CHAIN_STATUS = {
  GET_TABLE_INFO: '/tableOnChainStatusList',
};

const USER = {
  USER_SEARCH: '/user/search',
  USER_SEARCH_AAD: '/user/searchAad?keyword=',
  USER_LIST: '/user/list',
};

const USER_DEFINE = {
  USER_UPLOAD: '/userDefine/userUpload',
  METADATA_ADD_FILE: '/userDefine/metadataAndFile',
  METADATA: '/userDefine/metadata',
  GET_UPLOAD_HISTORY: '/userDefine/uploadHistory',
  TABLE_ADD_FILE: '/userDefine/tableAndFile',
  COLUMN_BY_FILE_ETL: '/userDefine/getColumnByFile',
  COLUMN_BY_SCHEMA_FILE_ETL: '/userDefine/getColumnSchemaByFile',
};

const USER_GROUP = {
  GET_GROUPS: '/group',
  GET_GROUP_TABLE: '/group/tables/search/{groupId}',
  GET_GROUP_MEMBER: '/group/member/{groupId}',
  UPDATE_MEMBER: '/group/user/{groupId}',
  GET_ALL_GROUPS: '/group/all',
  GET_NORMAL_GROUPS: '/group/byOwner/undefined',
  SET_GROUP_ALLOW: '/group/allow/{groupId}',
  SET_GROUP_REJECT: '/group/reject/{groupId}',
  DELETE_GROUP_TABLE: '/group/tables/delete',
};

const USER_TAG = {
  GET_CATEGORY: '/category/list',
  GET_CATEGORY_ENABLE: '/category/list/enabled',
};

const FLOW = {
  SYNC_TABLE: '/flow/syncTable',
  TEST_CONN: '/flow/testConn',
  GET_SYNC_RECORD: '/flow/getSyncRecord',
  GET_LIST_SYNC_RECORD: '/flow/listSyncRecord',
};

const NOTIFY = {
  GET_UNREAD_COUNT: '/notify/getUnReadCount',
  GET_MESSAGE: '/notify/getMessage',
  GET_LATEST_MESSAGE: '/notify/getLatestMessage',
  CHANGE_MSG_STATUS: '/notify/changeMessageStatus',
  SET_READ_ALL: '/notify/setReadAll',
};

const DATAFLOW = {
  ETL_SAVE: '/dataflow/save',
  GET_DATAFLOW_LIST: '/dataflow/list',
  GET_DATAFLOW_DETAIL: '/dataflow',
  SET_DATAFLOW_STATUS: '/dataflow/edit',
  CHECK_DATAFLOW_LOCKED: '/dataflow/checklock',
  DELETE_DATAFLOW: '/dataflow/delete',
  RUN_DATAFLOW: '/dataflow/run',
  VALIDATE_DATAFLOW: '/dataflow/validate',
  CANCEL_DATAFLOW_EDIT_STATUS: '/dataflow/edit/cancel',
  ETL_PREVIEW: '/dataflow/preview',
  GET_TARGETNODE: '/dataflow/targetNode',
  GET_TARGET_SCHEMAS: '/dataflow/targetSchemas',
  GET_OUTPUT_SCHEMA: '/dataflow/outputSchema',
  DATAFLOW_HISTORY: '/dataflow/history',
  DATAFLOW_DETAIL: '/dataflow/detail',
  DATAFLOW_IMMEDIATERESULT: '/dataflow/immediateResult',
  DATAFLOW_ISRUNNING: '/dataflow/isRunning',
  GET_WORKFLOW_REFERENCE: '/dataflow/workflowReferences',
  GET_DATAFLOW_DETAIL_WITH_DIAGRAM: '/dataflow/detailWithDiagram',
  GET_TABLE_EXIT: '/dataflow/tableExists',
  GET_CHECK_PUBLISH: '/dataflow',
  DATAFLOW_CHECK_PERMISSION: '/dataflow',
  GET_TABLE_SAMPLE_DATA: 'dataflow/table',
};

const WORKFLOW = {
  SAVE_WORK_FLOW: '/workflow/save',
  GET_WORKFLOW_LIST: '/workflow/list',
  GET_WORKFLOW_DETAIL: '/workflow',
  CHECK_WORKFLOW_LOCKED: '/workflow/checklock',
  WORKFLOW_EDIT_STATUS: '/workflow/edit',
  CANCEL_WORKFLOW_EDIT_STATUS: '/workflow/edit/cancel',
  DELETE_WORKFLOW: '/workflow/delete',
  ACTIVE_WORKFLOW: '/workflow/activate',
  DEACTIVE_WORKFLOW: '/workflow/deactivate',
  GET_DATAFLOW_BY_GROUP: '/workflow/dataflowByGroup',
  GET_TARGET_MAPPING: '/workflow/targetMapping',
  RUN_WORKFLOW: '/workflow/run',
  TEST_CONNECT: '/workflow/testConnection',
  GET_TARGET_SCHEMAS: '/dataflow/targetSchemas',
  TABLE_NAME_DUPLICATED: '/workflow/tableName/duplicated',
  WORKFLOW_HISTORY: '/workflow/history',
  WORKFLOW_DETAIL: '/workflow/detail',
  WORKFLOWNODE_URL: '/exposeapi',
  WORKFLOW_ISRUNNING: '/workflow/isRunning',
  WORKFLOW_POWERBI_PREVIEW: '/workflow/powerbi/preview',
  WORKFLOW_POWERBI_TEMPLATE: '/workflow/powerbi/template',
  WORKFLOW_RECEIVER: '/workflow/receiver?searchKey=',
  WORKFLOW_CHECK_PERMISSION: '/workflow',
};

const SYNCDATA = {
  CATEGORY_LIST: '/syncDataRequest/category/list',
  APPLY_SYNC_DATA: '/syncDataRequest/apply',
  SYNC_DATA_LIST: '/syncDataRequest/filter',
  COMPLETE_SYNC_DATA: '/syncDataRequest/complete',
};

const CATEGORY = {
  CATEGORY_LIST: '/category/management/list',
  CATEGORY_TABLES: '/category/tables',
  CATEGORY_CHANGE_OWNER: '/category/management/owner',
  CATEGORY_ADD: '/category',
  CATEGORY_ENABLE: '/category/management/status',
};

const POWER_BI_TEMPLATE = {
  POWER_BI_TEMPLATE_LIST: '/powerbiTemplate',
  POWER_BI_TEMPLATE_UPDATE: '/powerbiTemplate',
  POWER_BI_TEMPLATE_DELETE: '/powerbiTemplate',
  POWER_BI_TEMPLATE_CREATE: '/powerbiTemplate/upload',
  POWER_BI_TEMPLATE_INFO: '/powerbiTemplate',
  POWER_BI_TEMPLATE_GET_COLUMN_INFO: '/powerbiTemplate/getColumnInfo',
  POWER_BI_TEMPLATE_GET_SCHEMA_INFO: '/powerbiTemplate/updateColumnInfo',
};

const OUTPUT_DATA = {
  GET_WORKFLOW_LIST: `/outputData/excel`,
};

const DATAROBOT = {
  LIST_MODEL: `/dataRobot/listModels`,
  LIST_ACCOUNT: `/dataRobot/listDataRobotAccounts`,
  LIST_METRIC: `dataRobot/retrieveMetricsNames`,
};

const ANNOUNCEMENT = {
  GET_ANNOUNCEMENT: `/announcement`,
  SAVE_ANNOUNCEMENT: `/announcement`,
};

const ROLE_MANAGEMENT = {
  ROLE_MANAGEMENT: '/roleManagement/role',
  GET_ROLE_LIST: '/roleManagement/roles',
  GET_ROLE_DETAIL: '/roleManagement/role/search',
};

const USER_MANAGEMENT = {
  USER_MANAGEMENT: '/userRoleManagement/user',
  GET_USER_LIST: '/userRoleManagement/users/search',
  GET_USER_PERMISSION: '/userRoleManagement/permission',
};

export {
  ATLAS_QUERY,
  ETL,
  EVIDENCE,
  METADATA,
  NIFI_DEPLOY,
  PREVIEW,
  ROLE,
  TABLE_AUTH,
  TABLE_INFO,
  TABLE_ON_CHAIN_STATUS,
  USER,
  USER_DEFINE,
  USER_GROUP,
  USER_TAG,
  FLOW,
  NOTIFY,
  DATAFLOW,
  WORKFLOW,
  SYNCDATA,
  CATEGORY,
  POWER_BI_TEMPLATE,
  OUTPUT_DATA,
  DATAROBOT,
  ANNOUNCEMENT,
  ROLE_MANAGEMENT,
  USER_MANAGEMENT,
};
