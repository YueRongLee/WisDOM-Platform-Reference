/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Button,
  Form,
  Input,
  Upload,
  Space,
  message,
  Radio,
  Tooltip,
} from 'antd';
import {
  UploadOutlined,
  // MinusCircleOutlined,
  // ExclamationCircleOutlined,
  // PlusOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { PowerBiTemplateApi } from '~~apis/';
import { TABLE_NAME_RULES, INPUT_RULES } from '~~constants/index';
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

// const columnTypes = [
//   {
//     seq: 0,
//     type: 'string',
//   },
//   {
//     seq: 1,
//     type: 'decimal',
//   },
//   {
//     seq: 2,
//     type: 'double',
//   },
//   {
//     seq: 3,
//     type: 'integer',
//   },
//   {
//     seq: 4,
//     type: 'boolean',
//   },

//   {
//     seq: 5,
//     type: 'dateTime',
//   },
// ];

const EditModal = ({ modal, refresh }) => {
  const [fileList, setFileList] = useState([]);
  const [uploadfileList, setUploadFileList] = useState([]);
  const [fileloading, setFileloading] = useState(false);
  const [schemaFileList, setSchemaFileList] = useState([]);
  const [uploadSchemafileList, setUploadSchemaFileList] = useState([]);
  const [schemaFileloading, setSchemaFileloading] = useState(false); // finish=>true
  const [loading, setLoading] = useState(false);
  const [DLoading, setDLoading] = useState(false);
  const [compareError, setCompareError] = useState(false);

  const [fileColumn, setFileColumn] = useState([]); // 實際顯示的欄位
  // const [dataFileColumn, setDataFileColumn] = useState([]); // datafile的欄位
  // const [schemaFileColumn, setSchemaFileColumn] = useState([]); // schema的欄位
  const [schemaFileUrl, setSchemaFileUrl] = useState('');

  const [form] = Form.useForm();

  useEffect(() => {}, [modal.visible]);

  const handleBeforeLeave = () => {
    setFileList([]);
    setSchemaFileList([]);
    setSchemaFileloading(false);
    setFileloading(false);
    setCompareError(false);
    setFileColumn([]);
    // setDataFileColumn([]);
    setSchemaFileUrl('');
    form.resetFields();
    modal.closeModal();
  };

  // useEffect(() => {
  //   if (dataFileColumn.length !== 0 && schemaFileColumn.length !== 0) {
  //     const data = dataFileColumn.map(e => e.name);
  //     const schema = schemaFileColumn.map(e => e.name);
  //     data.sort();
  //     schema.sort();
  //     const bolCompare =
  //       data.length === schema.length &&
  //       data.every((value, index) => value === schema[index]); // true=the same
  //     setCompareError(!bolCompare);
  //   } else {
  //     setCompareError(false);
  //   }
  // }, [dataFileColumn, schemaFileColumn]);

  const handleChange = info => {
    let flist = [...info.fileList];
    let nextList = [];
    // 1. Limit the number of uploaded files
    // Only to show two recent uploaded files, and old ones will be replaced by the new
    flist = flist.slice(-1);
    if (flist.every(f => f.isLimit)) {
      nextList = [].concat(flist);
    }
    setDLoading(true);
    setFileList(nextList);
    setFileloading([]);

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

  const handleSchemaChange = info => {
    let flist = [...info.fileList];
    let nextList = [];
    // 1. Limit the number of uploaded files
    // Only to show two recent uploaded files, and old ones will be replaced by the new
    flist = flist.slice(-1);
    if (flist.every(f => f.isLimit)) {
      nextList = [].concat(flist);
    }
    setSchemaFileloading(true);
    setSchemaFileList(nextList);
    setFileloading([]);

    if (info.file.status !== 'uploading') {
      setFileloading(false);
    }
    if (info.file.status === 'done') {
      setFileloading(true);
      setSchemaFileloading(false);
    } else if (info.file.status === 'error') {
      setFileloading(false);
    }
  };

  const handleFinish = async data => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('isPublic', data.isPublic);
      fd.append('pbixFile', uploadfileList[0].file);
      if (schemaFileList.length > 0) {
        fd.append('schemaFile', uploadSchemafileList[0].file);
      }
      fd.append('templateDescription', data.comment);
      fd.append('templateName', data.name);
      fd.append('columns', JSON.stringify(data.columns));
      const result = await PowerBiTemplateApi.createPowerBiTemplate(fd);
      if (result.code === 1) message.success(result.msg);
      handleBeforeLeave();
      refresh();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const fileExtraProps = {};
  if (!form.getFieldError('dataFile').length) {
    fileExtraProps.help = 'File types supported: .pbix';
  }

  const handleBeforeUpload = file => {
    // 限制大小為10MB
    const isLimit = file.size / 1024 / 1024 < FILE_SIZE;
    if (!isLimit) {
      message.error(`The file size upload limit is ${FILE_SIZE} MB`);
    }
    // eslint-disable-next-line no-param-reassign
    file.isLimit = isLimit;
    // return isLimit;

    const fileObj = {
      name: file.name,
      file,
    };

    setUploadFileList([fileObj]);
  };

  const handleBeforeSchemaUpload = file => {
    // 限制大小為10MB
    const isLimit = file.size / 1024 / 1024 < FILE_SIZE;
    if (!isLimit) {
      message.error(`The file size upload limit is ${FILE_SIZE} MB`);
    }
    // eslint-disable-next-line no-param-reassign
    file.isLimit = isLimit;
    // return isLimit;

    const fileObj = {
      name: file.name,
      file,
    };

    setUploadSchemaFileList([fileObj]);
  };

  // const ColumnRemove = () => {
  //   if (fileColumn !== '' && fileloading === true) {
  //     const values = form.getFieldsValue();
  //     form.setFieldsValue({ ...values, columns: [] });
  //   }
  // };

  return (
    <Modal
      className="importModal"
      title="Update Power BI File"
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '75vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的75％就scroll
      onCancel={handleBeforeLeave}
      footer={
        <Space align="end">
          <Button
            disabled={loading || DLoading || schemaFileloading}
            onClick={handleBeforeLeave}
          >
            Cancel
          </Button>
          <Button
            loading={loading}
            type="primary"
            onClick={form.submit}
            disabled={DLoading || schemaFileloading}
          >
            Apply
          </Button>
        </Space>
      }
      width={1000}
      destroyOnClose
      closable={!loading}
      maskClosable={!loading}
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
            <Form.Item
              name="dataFile"
              label="BI File"
              rules={[
                {
                  required: true,
                  message: 'Please select a file',
                },
              ]}
              {...fileExtraProps}
              shouldUpdate
            >
              <div style={{ display: 'flex' }}>
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
                    PowerBiTemplateApi.getPowerBIColumnInfo(file, config).then(
                      result => {
                        const list = result.column.map(item => ({
                          dataset: item.dataset,
                          name: item.column,
                          dataType: item.type || 'string',
                        }));
                        setSchemaFileUrl(result.downloadLink);
                        // setDataFileColumn(list);
                        form.setFieldsValue({ columns: list });
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
                      },
                    );
                  }}
                  accept=".pbix"
                >
                  <span>
                    <Button className="upload-button">
                      <UploadOutlined /> Click to Upload
                    </Button>
                  </span>
                </Upload>
                {schemaFileUrl && (
                  <Tooltip placement="top" title="Download schema file">
                    <a href={schemaFileUrl} className="download-schema-link">
                      <FileTextOutlined
                        style={{
                          fontSize: '20px',
                          marginLeft: '10px',
                          lineHeight: '40px',
                          cursor: 'pointer',
                        }}
                      />
                    </a>
                  </Tooltip>
                )}
              </div>
            </Form.Item>
            {fileList.length > 0 && (
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
                  name="schemafile"
                  beforeUpload={handleBeforeSchemaUpload}
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
                    const columnInfo = fileColumn.map(item => ({
                      dataset: item.dataset,
                      column: item.name,
                      type: item.dataType,
                    }));
                    PowerBiTemplateApi.getPowerBISchemaInfo(
                      file,
                      columnInfo,
                      config,
                    ).then(
                      result => {
                        const list = result.map(item => ({
                          dataset: item.dataset,
                          name: item.column,
                          dataType: item.type || 'string',
                          comment: item.description,
                        }));
                        form.setFieldsValue({ columns: list });
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
                      },
                    );
                  }}
                  accept=".json"
                >
                  <Button disabled={DLoading}>
                    <UploadOutlined /> Click to Upload
                  </Button>
                </Upload>
              </Form.Item>
            )}

            <Form.Item
              label="Template Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Please input Template Name',
                },
                {
                  pattern: TABLE_NAME_RULES.pattern,
                  message:
                    'Start with alphabet and accept only letters(A-Za-z), numbers(0-9) and underline(_)',
                },
              ]}
              normalize={value => (value || '').toLowerCase()}
            >
              <Input
                style={{ width: '80%' }}
                maxLength={INPUT_RULES.TABLE_NAME.value}
              />
            </Form.Item>

            <Form.Item
              label="Template Description"
              name="comment"
              rules={[
                {
                  required: true,
                  message: 'Please input Template Description',
                },
              ]}
            >
              <Input
                style={{ width: '80%' }}
                maxLength={INPUT_RULES.TABLE_DESCRIPTION.value}
              />
            </Form.Item>
            <Form.Item
              name="isPublic"
              label="Availability"
              rules={[
                {
                  required: true,
                  message: 'Please select one',
                },
              ]}
            >
              <Radio.Group>
                <Radio value>Public</Radio>
                <Radio value={false}>Private</Radio>
              </Radio.Group>
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
                {fields => (
                  <>
                    <div>
                      {fields.map(field => (
                        <>
                          <Space
                            key={field.key}
                            className="columnRow"
                            align="center"
                          >
                            {/* {showIcon(index) ? (
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
                            )} */}
                            <Form.Item
                              {...field}
                              name={[field.name, 'dataset']}
                              fieldKey={[field.fieldKey, 'dataset']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Missing dataset',
                                },
                                // {
                                //   pattern: COLUMN_RULES.pattern,
                                //   message:
                                //     'Accept letters(a-z) , numbers(0-9) and underline(_) only',
                                // },
                              ]}
                            >
                              <Style.DisableInput
                                disabled
                                placeholder="dataset"
                                maxLength={INPUT_RULES.COLUMN_NAME.value}
                              />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              name={[field.name, 'name']}
                              fieldKey={[field.fieldKey, 'name']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Missing column name',
                                },
                                // {
                                //   pattern: COLUMN_RULES.pattern,
                                //   message:
                                //     'Accept letters(a-z) , numbers(0-9) and underline(_) only',
                                // },
                              ]}
                            >
                              <Style.DisableInput
                                disabled
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
                              {/* <Select>
                                {columnTypes.map(c => (
                                  <Select.Option key={c.seq} value={c.type}>
                                    {c.type}
                                  </Select.Option>
                                ))}
                              </Select> */}
                              <Style.DisableInput
                                disabled
                                placeholder="Column type"
                              />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              name={[field.name, 'comment']}
                              fieldKey={[field.fieldKey, 'comment']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Missing column description',
                                },
                              ]}
                            >
                              <Input
                                placeholder="Column Description"
                                // style={{ minWidth: 100, maxWidth: 500 }}
                                maxLength={INPUT_RULES.POWERBI_COMMENT.value}
                              />
                            </Form.Item>
                            {/* <Form.Item {...field}>
                              <MinusCircleOutlined
                                onClick={() => {
                                  remove(field.name);
                                }}
                              />
                            </Form.Item> */}
                          </Space>
                          {/* <div
                            style={{
                              marginLeft: '30px',
                              color: '#e04355',
                              minWidth: '100px',
                            }}
                          >
                            {handleErrorMsg(index)}
                          </div> */}
                        </>
                      ))}
                      {/* <Button
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
                      </Button> */}
                      {/* {ColumnRemove()} */}
                      {/* {fileColumn !== '' && fileloading === true
                        ? fileColumn.forEach(item => {
                            setFileloading(false);
                            add(item);
                          })
                        : null} */}
                    </div>
                  </>
                )}
              </Form.List>
            </Style.FormItemBottom>
          </>
        )}
      </Form>
    </Modal>
  );
};

EditModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
};

EditModal.defaultProps = {};

export default EditModal;
