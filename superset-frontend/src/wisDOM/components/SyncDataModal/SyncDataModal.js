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
  Select,
  Space,
  message,
  Table,
} from 'antd';
import ReactGA from 'react-ga';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useQuery } from '~~hooks/';
import { UserApi, FlowApi } from '~~apis/';
import { INPUT_RULES } from '~~constants/index';

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

const SyncDataModal = ({ modal, onCreateNew }) => {
  const [tableList, setTableList] = useState([]);
  const [selectValue, setSelectValue] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [form] = Form.useForm();
  const userUploadQuery = useQuery(UserApi.userUpload);
  //   const syncRecordQuery = useQuery(FlowApi.getSyncRecord); // get info
  const listSyncRecordQuery = useQuery(FlowApi.getListSyncRecord); // get list
  const { trackEvent } = useMatomo();
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '33%',
    },
    {
      title: 'DataType',
      dataIndex: 'dataType',
      key: 'dataType',
      width: '33%',
    },
    {
      title: 'Description',
      dataIndex: 'comment',
      key: 'comment',
      width: '33%',
    },
  ];

  const getTableList = async () => {
    try {
      const result = await listSyncRecordQuery.exec();
      setTableList(result.histories);
    } catch (e) {
      console.log(e);
      message.error('Get Table List Fail');
    }
  };

  const handleBeforeLeave = () => {
    setPreviewLoading(false);
    setPreviewData([]);
    form.resetFields();
    modal.closeModal();
  };

  const handleFinish = () => {
    // async data
    ReactGA.event({
      category: 'SyncData',
      action: 'Update a SyncTable',
    });
    trackEvent({
      category: 'SyncData',
      action: 'Update a SyncTable',
    });

    handleBeforeLeave();
  };

  useEffect(() => {
    if (modal.visible) {
      getTableList();
    }
  }, [modal.visible]);

  const fileExtraProps = {};
  if (!form.getFieldError('dataFile').length) {
    fileExtraProps.help = 'File types supported: json, csv, xls, xlsx';
  }

  const handleCreateNew = () => {
    handleBeforeLeave();
    onCreateNew();
  };

  const handleShowConnInfo = value => {
    const tableInfo = tableList.filter(data => data.tableName === value);
    if (tableInfo.length !== 0) {
      form.setFieldsValue({
        host: tableInfo[0].host,
        port: tableInfo[0].port,
        type: tableInfo[0].type,
        database: tableInfo[0].database,
        userName: tableInfo[0].name,
        password: tableInfo[0].password,
      });

      setPreviewData(tableInfo[0].table.columns);
    }
  };

  const handleSelect = value => {
    setPreviewLoading(true);
    setSelectValue(value);
    // getPreviewTable(value, null); // Type可不填
    handleShowConnInfo(value);
    setPreviewLoading(false);
  };

  return (
    <Modal
      title="Sync Data"
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的70％就scroll
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
            data-test="submit"
            loading={userUploadQuery.isLoading}
            type="primary"
            onClick={form.submit}
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
      <Form
        {...formItemLayout}
        form={form}
        name="import"
        onFinish={handleFinish}
        scrollToFirstError
      >
        {() => (
          <>
            <Form.Item label="Table Name">
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
                  data-test="table"
                  style={{ width: '70%' }}
                  placeholder="Please select a table"
                  onChange={handleSelect}
                >
                  {tableList.map(t => (
                    <Select.Option key={t.tableName} value={t.tableName}>
                      {t.tableName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Button
                className="linkbutton"
                data-test="createNew"
                type="link"
                onClick={handleCreateNew}
              >
                Create New
              </Button>
            </Form.Item>
            <Form.Item name="host" label="Host">
              <Input disabled style={{ width: '55%' }} />
            </Form.Item>
            <Form.Item name="port" label="Port">
              <Input disabled style={{ width: '55%' }} />
            </Form.Item>
            <Form.Item name="type" label="DB Type">
              <Input disabled style={{ width: '55%' }} />
            </Form.Item>
            <Form.Item name="database" label="DB Source">
              <Input disabled style={{ width: '55%' }} />
            </Form.Item>
            <Form.Item
              name="userName"
              label="User Name"
              rules={[
                { required: true, message: 'Please input your username!' },
              ]}
            >
              <Input
                disabled
                prefix={<UserOutlined style={{ float: 'right' }} />}
                placeholder="Username"
                style={{ width: '35%' }}
              />
            </Form.Item>
            <Form.Item label="Password">
              <Form.Item name="password" noStyle>
                <Input.Password
                  readonly
                  style={{ width: '35%' }}
                  prefix={<LockOutlined style={{ float: 'right' }} />}
                  maxLength={INPUT_RULES.USER_PW.value}
                />
              </Form.Item>
            </Form.Item>
            <hr />
            <Form.Item name="tableSchema" label="Table Schema">
              {selectValue !== '' && previewData !== '' ? (
                <Table
                  columns={columns}
                  dataSource={previewData}
                  scroll={{ x: 'max-content' }}
                  pagination={false}
                  size="middle"
                  loading={previewLoading}
                />
              ) : null}
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

SyncDataModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  onCreateNew: PropTypes.func,
};

SyncDataModal.defaultProps = {
  onCreateNew: () => null,
};

export default SyncDataModal;
