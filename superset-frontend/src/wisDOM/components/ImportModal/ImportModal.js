/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Button,
  Form,
  Input,
  Upload,
  Select,
  Space,
  message,
  Table,
  Spin,
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { AppContext } from 'src/store/appStore';
import ReactGA from 'react-ga';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import AppConfig from '~~config';
import { DataFlowApi, UserApi, MetadataApi } from '~~apis/';
import { useQuery } from '~~hooks/';
import {
  ROLE_TYPE,
  TABLE_NAME_RULES,
  INPUT_RULES,
  COLUMN_RULES,
} from '~~constants/index';
import './ImportModalStyle.less';
import * as Style from './style';

const FILE_SIZE = 10; // MB

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};

const copyUrl = () => {
  const el = document.createElement('textarea');
  el.value = AppConfig.serverUrl + UserApi.tableAddFile.url;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  message.success('Copy successfully!');
};

const copyGetItem = () => {
  const el = document.createElement('textarea');
  el.value = `Bearer ${sessionStorage.getItem('access_token')}`;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  message.success('Copy successfully!');
};

const ImportModal = ({ modal, onUploadExist }) => {
  const appStore = useContext(AppContext);
  const [columnTypes, setColumnTypes] = useState([]);
  const [SLoading, setSLoading] = useState(false);
  const [DLoading, setDLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [fileloading, setFileloading] = useState(false);
  const [schemaFileList, setSchemaFileList] = useState([]);
  const [schemaFileloading, setSchemaFileloading] = useState(false); // finish=>true
  const [fileColumn, setFileColumn] = useState([]); // 實際顯示的欄位
  const [dataFileColumn, setDataFileColumn] = useState([]); // datafile的欄位
  const [schemaFileColumn, setSchemaFileColumn] = useState([]); // schema的欄位
  const [compareError, setCompareError] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [form] = Form.useForm();
  const getColumnTypeQuery = useQuery(MetadataApi.getColumnType);
  const tableAddFileQuery = useQuery(UserApi.tableAddFile);
  const getEnableTagListQuery = useQuery(UserApi.getEnableTags);
  const [checkLoading, setCheckLoading] = useState(false);
  const [showError, setShowError] = useState(); // true:error
  const [apiErrorMsg, setApiErrorMsg] = useState([]);
  const { trackEvent } = useMatomo();
  const getColumnType = async () => {
    const result = await getColumnTypeQuery.exec();
    setColumnTypes(result);
  };

  const getCategoryList = async () => {
    try {
      const result = await getEnableTagListQuery.exec();
      setCategoryList(result);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (modal.visible) {
      getColumnType();
      getCategoryList();
    }
  }, [modal.visible]);

  const handleBeforeLeave = () => {
    setFileList([]);
    setSchemaFileList([]);
    setDataFileColumn([]);
    setSchemaFileColumn([]);
    setFileColumn([]);
    setApiErrorMsg([]);
    setSchemaFileloading(false);
    setFileloading(false);
    setDLoading(false);
    setSLoading(false);
    setCompareError(false);
    form.resetFields();
    modal.closeModal();
  };

  useEffect(() => {
    if (dataFileColumn.length !== 0 && schemaFileColumn.length !== 0) {
      const data = dataFileColumn.map(e => e.name);
      const schema = schemaFileColumn.map(e => e.name);
      data.sort();
      schema.sort();
      const bolCompare =
        data.length === schema.length &&
        data.every((value, index) => value === schema[index]); // true=the same
      setCompareError(!bolCompare);
    } else {
      setCompareError(false);
    }
  }, [dataFileColumn, schemaFileColumn]);

  const handleChange = info => {
    setApiErrorMsg([]);

    setDLoading(true);
    let flist = [...info.fileList];
    let nextList = [];
    // 1. Limit the number of uploaded files
    // Only to show two recent uploaded files, and old ones will be replaced by the new
    flist = flist.slice(-1);
    if (flist.every(f => f.isLimit)) {
      nextList = [].concat(flist);
    }

    setFileList(nextList);

    if (info.file.status !== 'uploading') {
      setFileloading(false);
    }
    if (info.file.status === 'done') {
      setFileloading(true);
      setDLoading(false);
    } else if (info.file.status === 'error') {
      setFileloading(false);
    }
  };

  const handleFinish = async data => {
    ReactGA.event({
      category: 'Import',
      action: 'Import table metadata',
    });
    trackEvent({
      category: 'Import',
      action: 'Import table metadata',
    });
    const tableInfo = {
      name: data.name,
      comment: data.comment,
      columns: data.columns,
      categories: [data.categories],
    };
    delete tableInfo.dataFile;
    const tableStr = JSON.stringify(tableInfo);

    try {
      let bellNotifyCount = sessionStorage.getItem('bellNotifyCount') || 0;
      const fd = new FormData();
      if (fileList[0]) {
        fd.append('file', fileList[0].originFileObj);
      }
      fd.append('tableStr', tableStr);
      const result = await tableAddFileQuery.execForFormData(fd);
      if (result.code === 1) {
        message.success('Your table is upload Successful.');
        handleBeforeLeave();
        // eslint-disable-next-line no-plusplus
        sessionStorage.setItem('bellNotifyCount', ++bellNotifyCount);
      } else {
        setApiErrorMsg(result.msgs);
        message.error('Please fix the error and try again.');
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fileExtraProps = {};
  if (!form.getFieldError('dataFile').length) {
    fileExtraProps.help = 'File types supported: json, csv, xls, xlsx';
  }

  const handleBeforeUpload = file => {
    setDLoading(true);
    // 限制大小為10MB
    const isLimit = file.size / 1024 / 1024 < FILE_SIZE;
    if (!isLimit) {
      message.error(`The file size upload limit is ${FILE_SIZE} MB`);
      setDLoading(false);
    }
    // eslint-disable-next-line no-param-reassign
    file.isLimit = isLimit;
    setDLoading(false);
    return isLimit;
  };

  const handleUploadExist = () => {
    handleBeforeLeave();
    onUploadExist();
  };

  const ColumnRemove = () => {
    if (fileColumn !== '' && fileloading === true) {
      const values = form.getFieldsValue();
      form.setFieldsValue({ ...values, columns: [] });
    }
  };

  const parameterData = [
    {
      key: '1',
      name: 'file',
      formate: 'file',
      description: 'file',
    },
    {
      key: '2',
      name: 'tableStr',
      formate: 'string',
      description: 'table str,table and column json str',
    },
  ];

  const parameterCol = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Formate',
      dataIndex: 'formate',
      key: 'formate',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  //   // for schema file
  const handleSchemaChange = info => {
    setApiErrorMsg([]);

    let flist = [...info.fileList];
    let nextList = [];
    // 1. Limit the number of uploaded files
    // Only to show two recent uploaded files, and old ones will be replaced by the new
    flist = flist.slice(-1);
    if (flist.every(f => f.isLimit)) {
      nextList = [].concat(flist);
    }

    setSchemaFileList(nextList);
    setSLoading(true);

    if (info.file.status !== 'uploading') {
      setSchemaFileloading(false);
    }
    if (info.file.status === 'done') {
      setSchemaFileloading(true);
      setSLoading(false);
    } else if (info.file.status === 'error') {
      setSchemaFileloading(false);
    }

    if (info.fileList.length === 0) {
      setSchemaFileColumn([]);
      setFileColumn(dataFileColumn);
      form.setFieldsValue({ columns: dataFileColumn });
    }
  };

  const checkTableDuplicate = async value => {
    try {
      setCheckLoading(true);
      const result = await DataFlowApi.getTableDuplicate(value);
      const check = result === false ? 'success' : 'error';
      setShowError(check);
    } catch (e) {
      console.log(e);
    } finally {
      setCheckLoading(false);
    }
  };

  const onBlurCheck = value => {
    if (value) {
      checkTableDuplicate(value);
    } else {
      setShowError();
    }
  };

  const handleErrorMsg = idx => {
    if (apiErrorMsg.length > 0) {
      const filterM = apiErrorMsg.filter(e => e.column_index === idx);
      if (filterM && filterM.length > 0) {
        return filterM[0].error_msg;
      }
      return false;
    }
    return null;
  };

  const showIcon = idx => {
    if (apiErrorMsg.length > 0) {
      const filterM = apiErrorMsg.filter(e => e.column_index === idx);
      if (filterM && filterM.length > 0) {
        return true;
      }
      return false;
    }

    return false;
  };

  return (
    <Modal
      className="importModal"
      title="Import Data"
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '75vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的75％就scroll
      onCancel={handleBeforeLeave}
      footer={
        <Space align="end">
          <Button
            data-test="cancel"
            disabled={tableAddFileQuery.isLoading}
            onClick={handleBeforeLeave}
          >
            Cancel
          </Button>
          <Button
            loading={tableAddFileQuery.isLoading}
            type="primary"
            onClick={form.submit}
          >
            {appStore && appStore.userInfo.roles.includes(ROLE_TYPE.DATA_MASTER)
              ? 'Ok'
              : 'Apply'}
          </Button>
        </Space>
      }
      width={900}
      destroyOnClose
      closable={!tableAddFileQuery.isLoading}
      maskClosable={!tableAddFileQuery.isLoading}
    >
      <Spin spinning={DLoading || SLoading}>
        <Form
          {...formItemLayout}
          data-test="import"
          form={form}
          name="import"
          onFinish={handleFinish}
          scrollToFirstError
        >
          {() => (
            <>
              <Form.Item
                name="dataFile"
                label="Data File"
                rules={[
                  {
                    required: true,
                    message: 'Please select a file',
                  },
                ]}
                {...fileExtraProps}
                shouldUpdate
              >
                <Upload
                  name="file"
                  beforeUpload={handleBeforeUpload}
                  onChange={handleChange}
                  multiple={false}
                  fileList={fileList}
                  showUploadList={{
                    showDownloadIcon: false,
                    showRemoveIcon: fileloading,
                    showPreviewIcon: false,
                  }}
                  customRequest={({ file, onSuccess, onError }) => {
                    const config = {
                      onUploadProgress: progressEvent => {
                        Math.round(
                          (progressEvent.loaded * 100) / progressEvent.total,
                        );
                      },
                    };
                    UserApi.ColumnByFileVerify(file, config).then(
                      result => {
                        const list = result.map(item => ({
                          name: item.column,
                          dataType: item.type,
                        }));
                        setDataFileColumn(list);
                        setFileColumn(list);
                        if (schemaFileloading === false) {
                          setFileColumn(list);
                        } else if (fileColumn.length === 0) {
                          setFileColumn([]);
                        } else {
                          setFileColumn(fileColumn);
                        }
                        onSuccess(result, file);
                      },
                      e => {
                        onError(e);
                        setDLoading(false);
                      },
                    );
                  }}
                  accept=".json, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                >
                  <Button>
                    <UploadOutlined /> Click to Upload
                  </Button>
                </Upload>
              </Form.Item>
              <Form.Item
                name="schemaFile"
                label="Schema File"
                rules={[
                  {
                    required: false,
                    message: 'Please select a schemafile',
                  },
                ]}
                shouldUpdate
                extra="Only json File types supported"
                validateStatus={compareError === true ? 'error' : null}
                help={
                  compareError === true
                    ? 'Compare Data File & Schema File error, please check length and content!'
                    : null
                }
              >
                <Upload
                  data-test="schemafile"
                  name="schemafile"
                  beforeUpload={handleBeforeUpload}
                  onChange={handleSchemaChange}
                  multiple={false}
                  fileList={schemaFileList}
                  showUploadList={{
                    showDownloadIcon: false,
                    showRemoveIcon: schemaFileloading,
                    showPreviewIcon: false,
                  }}
                  customRequest={({ file, onSuccess, onError }) => {
                    const config = {
                      onUploadProgress: progressEvent => {
                        Math.round(
                          (progressEvent.loaded * 100) / progressEvent.total,
                        );
                      },
                    };
                    UserApi.ColumnBySchemaFileVerify(file, config).then(
                      result => {
                        const list = result.map(item => ({
                          name: item.columnName,
                          dataType: item.columnType,
                          comment: item.columnDesc,
                        }));
                        setSchemaFileColumn(list);
                        setFileColumn(list); // schema有就覆蓋
                        onSuccess(result, file);
                        form.setFieldsValue({ columns: list });
                      },
                      e => {
                        onError(e);
                        setSLoading(false);
                      },
                    );
                  }}
                  accept=".json"
                >
                  <Button>
                    <UploadOutlined /> Click to Upload
                  </Button>
                </Upload>
              </Form.Item>
              <Form.Item
                label={
                  <>
                    <span
                      style={{
                        marginRight: 4,
                        color: '#e04355',
                        fontSize: 14,
                        fontFamily: 'SimSun, sans-serif',
                        lineHeight: 1,
                        content: '*',
                      }}
                    >
                      *
                    </span>
                    <span>Table Name</span>
                  </>
                }
              >
                <Style.FormItemTable
                  name="name" // in dbSetting
                  // noStyle
                  style={{ display: 'inline-block', width: '55%' }}
                  rules={[
                    {
                      required: true,
                      message: 'Please input Table Name',
                    },
                    {
                      pattern: TABLE_NAME_RULES.pattern,
                      message:
                        'Start with alphabet and accept only letters(A-Za-z), numbers(0-9) and underline(_)',
                    },
                  ]}
                  normalize={value => (value || '').toLowerCase()}
                  validateStatus={showError || null}
                  help={showError === 'error' ? 'Table Name is Exit' : null}
                >
                  <Input
                    // style={{ width: '80%' }}
                    onBlur={e => onBlurCheck(e.target.value)}
                    maxLength={INPUT_RULES.TABLE_NAME.value}
                    disabled={checkLoading}
                  />
                </Style.FormItemTable>
                <Form.Item style={{ display: 'inline-block' }}>
                  <Button
                    className="linkbutton"
                    type="link"
                    onClick={handleUploadExist}
                  >
                    Upload Exist
                  </Button>
                </Form.Item>
              </Form.Item>
              <Form.Item name="comment" label="Table Description">
                <Input maxLength={INPUT_RULES.TABLE_DESCRIPTION.value} />
              </Form.Item>
              <Form.Item name="categories" label="Data Domain">
                <Select
                  showSearch
                  style={{ width: 200 }}
                  placeholder="Select a data domain"
                  allowClear
                >
                  {categoryList.map(e => (
                    <Select.Option value={e}>{e}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="tableAndFile" label="Url">
                <Input.TextArea
                  style={{ cursor: 'default', color: '#000000bf' }}
                  disabled
                  defaultValue={AppConfig.serverUrl + UserApi.tableAddFile.url}
                  autoSize={{ minRows: 1, maxRows: 2 }}
                />
                <Button
                  data-test="copyBtn"
                  className="copyBtn"
                  onClick={copyUrl}
                >
                  <CopyOutlined /> Copy
                </Button>
              </Form.Item>
              <Form.Item name="getItem" label="Authorization">
                <Input.TextArea
                  style={{ cursor: 'default', color: '#000000bf' }}
                  disabled
                  defaultValue={`Bearer ${sessionStorage.getItem(
                    'access_token',
                  )}`}
                  autoSize={{ minRows: 4, maxRows: 6 }}
                />
                <Button
                  data-test="copyGetItem"
                  className="copyBtn"
                  onClick={copyGetItem}
                >
                  <CopyOutlined /> Copy
                </Button>
              </Form.Item>
              <Form.Item name="parameters" label="Parameters">
                <Table
                  columns={parameterCol}
                  dataSource={parameterData}
                  scroll={{ x: 'max-content' }}
                  pagination={false}
                  size="small"
                />
              </Form.Item>
              <Style.FormItemBottom
                name="columns"
                label="Columns"
                rules={[
                  {
                    required: true,
                    message: 'Please add a column',
                  },
                ]}
              >
                <Form.List name="columns">
                  {(fields, { add, remove }) => (
                    <>
                      <div>
                        {fields.map((field, index) => (
                          <>
                            <Space
                              key={field.key}
                              className="columnRow"
                              align="center"
                            >
                              {showIcon(index) ? (
                                <Form.Item>
                                  <ExclamationCircleOutlined
                                    style={{
                                      color: '#e04355',
                                      marginRight: '5px',
                                    }}
                                  />
                                </Form.Item>
                              ) : (
                                <Form.Item style={{ width: '20px' }} />
                              )}
                              <Form.Item
                                {...field}
                                name={[field.name, 'name']}
                                fieldKey={[field.fieldKey, 'name']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Missing column name',
                                  },
                                  {
                                    pattern: COLUMN_RULES.pattern,
                                    message:
                                      'Accept letters(a-z) , numbers(0-9) and underline(_) only',
                                  },
                                ]}
                              >
                                <Input
                                  placeholder="Column Name"
                                  maxLength={INPUT_RULES.COLUMN_NAME.value}
                                />
                              </Form.Item>
                              <Form.Item
                                {...field}
                                name={[field.name, 'dataType']}
                                fieldKey={[field.fieldKey, 'dataType']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Missing column type',
                                  },
                                ]}
                              >
                                <Select>
                                  {columnTypes.map(c => (
                                    <Select.Option key={c.seq} value={c.type}>
                                      {c.type}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                              <Form.Item
                                {...field}
                                name={[field.name, 'comment']}
                                fieldKey={[field.fieldKey, 'comment']}
                              >
                                <Input
                                  placeholder="Column Description"
                                  style={{ minWidth: 100, maxWidth: 500 }}
                                  maxLength={
                                    INPUT_RULES.COLUMN_DESCRIPTION.value
                                  }
                                />
                              </Form.Item>
                              <Form.Item {...field}>
                                <MinusCircleOutlined
                                  onClick={() => {
                                    remove(field.name);
                                  }}
                                />
                              </Form.Item>
                            </Space>
                            <div
                              style={{
                                marginLeft: '30px',
                                color: '#e04355',
                                minWidth: '100px',
                              }}
                            >
                              {handleErrorMsg(index)}
                            </div>
                          </>
                        ))}
                        <Button
                          type="dashed"
                          onClick={() => {
                            add({
                              dataType: columnTypes.length
                                ? columnTypes[0].type
                                : undefined,
                            });
                          }}
                          block
                        >
                          <PlusOutlined />
                        </Button>
                        {ColumnRemove()}
                        {fileColumn !== '' && fileloading === true
                          ? fileColumn.forEach(item => {
                              setFileloading(false);
                              add(item);
                            })
                          : null}
                      </div>
                    </>
                  )}
                </Form.List>
              </Style.FormItemBottom>
            </>
          )}
        </Form>
      </Spin>
    </Modal>
  );
};

ImportModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  onUploadExist: PropTypes.func,
};

ImportModal.defaultProps = {
  onUploadExist: () => null,
};

export default ImportModal;
