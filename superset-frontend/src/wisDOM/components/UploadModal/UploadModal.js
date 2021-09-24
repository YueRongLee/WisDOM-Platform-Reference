/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
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
  Radio,
  Table,
  Spin,
} from 'antd';
import { UploadOutlined, CopyOutlined } from '@ant-design/icons';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import ReactGA from 'react-ga';
import AppConfig from '~~config';
import { useQuery, useModal } from '~~hooks/';
import { UserApi, PreviewApi, MetadataApi } from '~~apis/';
import { ACTION_TYPE } from '~~constants/index';
import HistoryModal from './HistoryModal';

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

const UploadModal = ({ modal, onCreateNew }) => {
  const [fileList, setFileList] = useState([]);
  const [tableInfo, setTableInfo] = useState([]);
  const [tableSchema, setTableSchema] = useState([]);
  const [selectValue, setSelectValue] = useState('');
  const [selectKey, setSelectKey] = useState('');
  const [columns, setColumns] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [updateAction, setUpdateAction] = useState(false);
  const [tableLock, setTableLock] = useState(false);
  const [form] = Form.useForm();
  const historyModal = useModal();
  const getUserDefineTableQuery = useQuery(MetadataApi.getUserDefineTable);
  const getUserDefineTableSchema = useQuery(
    MetadataApi.getUserDefineTableSchema,
  );
  const userUploadQuery = useQuery(UserApi.userUpload);
  const { trackEvent } = useMatomo();
  const copyUrl = () => {
    const el = document.createElement('textarea');
    el.value = AppConfig.serverUrl + UserApi.userUpload.url;
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

  const getTableList = async () => {
    try {
      const result = await getUserDefineTableQuery.exec();
      setTableInfo(result);
    } catch (e) {
      console.log(e);
    }
  };

  const getTableSchema = async () => {
    try {
      const result = await getUserDefineTableSchema.exec();
      setTableSchema(result.tables);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (modal.visible) {
      getTableList();
      getTableSchema();
    }
  }, [modal.visible]);

  // TODO Jason
  const getPreviewTable = async (tableName, systemType, groupId) => {
    setPreviewLoading(true);
    try {
      const result = await PreviewApi.getPreviewTable(
        tableName,
        systemType,
        groupId,
      );

      setPreviewData(
        result.datas.map((data, index) => ({
          key: `${data.name}-${index}`,
          ...data,
        })),
      );

      if (result.msg) {
        message.error(result.msg);

        setTableLock(true);
      } else {
        setTableLock(false);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleBeforeLeave = () => {
    setFileList([]);
    setPreviewData([]);
    setColumns([]);
    setTableInfo([]);
    setUpdateAction(false);
    setTableLock(false);
    form.resetFields();
    modal.closeModal();
  };

  const handleChange = info => {
    let flist = [...info.fileList];
    let nextList = [];
    // 1. Limit the number of uploaded files
    // Only to show two recent uploaded files, and old ones will be replaced by the new
    flist = flist.slice(-1);
    if (flist.every(f => f.isLimit)) {
      nextList = [].concat(flist);
    }

    setFileList(nextList);
  };

  const handleFinish = async data => {
    ReactGA.event({
      category: 'Upload',
      action: `Upload table data action is ${data.action}`,
    });
    trackEvent({
      category: 'Upload',
      action: `Upload table data action is ${data.action}`,
    });

    try {
      const fd = new FormData();
      fd.append('file', fileList[0].originFileObj);
      fd.append('tableName', data.tableName);
      fd.append(
        'groupId',
        tableInfo.length !== 0
          ? tableInfo.tables.filter(e => e.tableName === data.tableName)[0]
              .groupId
          : null,
      );
      fd.append('action', data.action);
      fd.append('columnKeys', selectKey);
      const result = await userUploadQuery.execForFormData(fd);

      if (result.code === 1) {
        message.success('Table data has been uploaded successfully');
        handleBeforeLeave();
      } else {
        message.error(
          <>
            {result.msgs.map(e => (
              <div>
                Error Column:[{e.column_name}],{e.error_msg}
              </div>
            ))}
          </>,
        );
      }

      // message.success('Table data has been uploaded successfully');
      // handleBeforeLeave();
    } catch (e) {
      console.log(e);
    }
  };

  const fileExtraProps = {};
  if (!form.getFieldError('dataFile').length) {
    fileExtraProps.help = 'File types supported: json, csv, xls, xlsx';
  }

  const handleBeforeUpload = file => {
    // 限制大小為10MB
    const isLimit = file.size / 1024 / 1024 < FILE_SIZE;
    if (!isLimit) {
      message.error(`The file size upload limit is ${FILE_SIZE} MB`);
    }
    // eslint-disable-next-line no-param-reassign
    file.isLimit = isLimit;
    return isLimit;
  };

  const handleCreateNew = () => {
    handleBeforeLeave();
    onCreateNew();
  };

  const handleColSchema = select => {
    const cols = select.map(item => item.columns);
    const map = cols.map(item =>
      item.map(sub => ({
        title: `${sub.name} (${sub.dataType})`,
        dataIndex: sub.name,
        render: value =>
          value !== undefined && value !== null && value.toString
            ? value.toString()
            : value,
      })),
    );

    setColumns(map[0].filter(e => e.dataIndex !== 'wisdom_batch_id'));
  };

  const handleSelect = value => {
    setSelectValue(value);
    getPreviewTable(
      value,
      null,
      tableInfo.tables.filter(e => e.tableName === value)[0].groupId,
    );
    handleColSchema(
      tableSchema.filter(item => (item.name === value ? item.columns : null)),
    );
  };

  const handleSelectKey = value => {
    setSelectKey(value);
  };

  const parameterData = [
    {
      key: '1',
      name: 'action',
      formate: 'string',
      description: 'action, ex:append/overwrite/update, default:append',
    },
    {
      key: '2',
      name: 'file',
      formate: 'file',
      description: 'file',
    },
    {
      key: '3',
      name: 'tableName',
      formate: 'string',
      description: 'table name',
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

  const handleValueChange = changedValues => {
    if (changedValues.action !== undefined) {
      if (changedValues.action === ACTION_TYPE.upsert.value) {
        setUpdateAction(true);
      } else setUpdateAction(false);
    }
  };

  return (
    <Modal
      title="Upload Data"
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '75vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的75％就scroll
      onCancel={handleBeforeLeave}
      footer={
        <Space align="end">
          <Button
            data-test="beforeLeave"
            disabled={userUploadQuery.isLoading}
            onClick={handleBeforeLeave}
          >
            Cancel
          </Button>
          <Button
            loading={userUploadQuery.isLoading}
            type="primary"
            onClick={form.submit}
            disabled={
              tableLock || !form.getFieldValue('tableName') || previewLoading
            }
          >
            Ok
          </Button>
        </Space>
      }
      width={900}
      destroyOnClose
      closable={!userUploadQuery.isLoading}
      maskClosable={!userUploadQuery.isLoading}
    >
      <Spin spinning={previewLoading}>
        <Form
          {...formItemLayout}
          form={form}
          name="import"
          onFinish={handleFinish}
          scrollToFirstError
          onValuesChange={handleValueChange}
        >
          {() => (
            <>
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
                <Form.Item
                  name="tableName"
                  noStyle
                  rules={[
                    {
                      required: true,
                      message: 'Please select a table',
                    },
                  ]}
                >
                  <Select
                    showSearch
                    style={{ width: '70%' }}
                    placeholder="Please select a table"
                    onChange={handleSelect}
                  >
                    {tableInfo.length !== 0 &&
                      tableInfo.tables
                        .map(e => e.tableName)
                        .map(t => (
                          <Select.Option key={t} value={t}>
                            {t}
                          </Select.Option>
                        ))}
                  </Select>
                </Form.Item>
                <Button
                  className="linkbutton"
                  type="link"
                  onClick={handleCreateNew}
                >
                  Create New
                </Button>
                <Button
                  className="linkbutton"
                  disabled={!form.getFieldValue('tableName')}
                  type="link"
                  onClick={() =>
                    historyModal.openModal(form.getFieldValue('tableName'))
                  }
                >
                  History
                </Button>
              </Form.Item>
              <Form.Item
                name="dataFile"
                label="Data File"
                rules={[
                  {
                    required: true,
                    message: 'Please select a file',
                  },
                ]}
                // shouldUpdate={(vrev, curr) => form.getFieldError('dataFile').length}
                {...fileExtraProps}
                shouldUpdate
              >
                <Upload
                  data-test="uploadFile"
                  beforeUpload={handleBeforeUpload}
                  onChange={handleChange}
                  multiple={false}
                  fileList={fileList}
                  showUploadList={{
                    showDownloadIcon: false,
                    showRemoveIcon: false,
                    showPreviewIcon: false,
                  }}
                  customRequest={({ onSuccess }) => {
                    setTimeout(() => {
                      onSuccess('ok');
                    }, 0);
                  }}
                  accept=".json, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                >
                  <Button
                    disabled={
                      tableLock ||
                      !form.getFieldValue('tableName') ||
                      previewLoading
                    }
                  >
                    <UploadOutlined /> Click to Upload
                  </Button>
                </Upload>
              </Form.Item>
              <Form.Item
                name="action"
                label="Action"
                rules={[
                  {
                    required: true,
                    message: 'Please select a action',
                  },
                ]}
                initialValue={ACTION_TYPE.append.value}
              >
                <Radio.Group>
                  {Object.values(ACTION_TYPE).map(type => (
                    <Radio
                      disabled={
                        tableLock ||
                        !form.getFieldValue('tableName') ||
                        previewLoading
                      }
                      key={type.value}
                      value={type.value}
                    >
                      {type.name}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
              {updateAction === true ? (
                <Form.Item
                  name="primaryKey"
                  label="Primary Key"
                  rules={[
                    {
                      required: updateAction,
                      message: 'Please select a Table Primary Key',
                    },
                  ]}
                >
                  <Select
                    disabled={columns.length === 0}
                    placeholder="Primary key"
                    options={columns.map(e => ({ value: e.dataIndex }))}
                    mode="multiple"
                    onChange={handleSelectKey}
                  />
                </Form.Item>
              ) : null}
              <Form.Item name="userUploadUrl" label="Url">
                <Input.TextArea
                  style={{ cursor: 'default', color: '#000000bf' }}
                  disabled
                  defaultValue={AppConfig.serverUrl + UserApi.userUpload.url}
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
              <Form.Item name="tableSchema" label="Table Preview">
                {selectValue !== '' && previewData !== '' ? (
                  <Table
                    columns={columns}
                    dataSource={previewData}
                    scroll={{ x: 'max-content' }}
                    pagination={false}
                    size="small"
                    loading={previewLoading}
                  />
                ) : null}
              </Form.Item>
            </>
          )}
        </Form>
      </Spin>
      <HistoryModal modal={historyModal} />
    </Modal>
  );
};

UploadModal.propTypes = {
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

UploadModal.defaultProps = {
  onUploadExist: () => null,
};

export default UploadModal;
