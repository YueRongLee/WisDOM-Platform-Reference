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
  // Select,
  // Tooltip,
} from 'antd';
import {
  UploadOutlined,
  // MinusCircleOutlined,
  // PlusOutlined,
  // FileTextOutlined,
} from '@ant-design/icons';
import { PowerBiTemplateApi } from '~~apis/';
import { TABLE_NAME_RULES, INPUT_RULES } from '~~constants/index';
import './ImportModalStyle.less';
import * as Style from './style';

const FILE_SIZE = 10; // MB

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
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

const EditTemplateModal = ({ modal, refresh }) => {
  const [schemaFileList, setSchemaFileList] = useState([]);
  const [uploadSchemafileList, setUploadSchemaFileList] = useState([]);
  const [schemaFileloading, setSchemaFileloading] = useState(false); // finish=>true
  const [loading, setLoading] = useState(false);
  const [fileColumn, setFileColumn] = useState([]); // 實際顯示的欄位

  const [compareError, setCompareError] = useState(false);
  // const [fileColumn, setFileColumn] = useState([]); // 實際顯示的欄位
  // const [schemaFileUrl, setSchemaFileUrl] = useState('');
  const [form] = Form.useForm();

  const handleBeforeLeave = () => {
    setSchemaFileList([]);
    setSchemaFileloading(false);
    // setFileColumn([]);
    setCompareError(false);
    // setSchemaFileUrl('');
    form.resetFields();
    modal.closeModal();
  };

  const handleFinish = async data => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('isPublic', data.isPublic);

      if (schemaFileList.length > 0) {
        fd.append('schemaFile', uploadSchemafileList[0].file);
      }
      fd.append('templateDescription', data.comment);
      fd.append('templateName', data.name);
      fd.append('columns', JSON.stringify(data.columns));
      const result = await PowerBiTemplateApi.updatePowerBiTemplate(
        fd,
        modal.modalData.templateId,
      );
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
    fileExtraProps.help = 'File types supported: json';
  }

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

  const getPowerBiInfo = async templateId => {
    setLoading(true);
    try {
      const result = await PowerBiTemplateApi.getPowerBiTemplateInfo(
        templateId,
      ); // check editing
      const tempList = result.templateColumnInfo.map(item => {
        const obj = {
          ...item,
          dataset: item.dataset,
          name: item.column,
          dataType: item.type,
          comment: item.description,
        };
        return obj;
      });
      setFileColumn(tempList);
      // setSchemaFileUrl(result.templateUrl);
      form.setFieldsValue({
        ...modal.modalData,
        name: modal.modalData.templateName,
        comment: modal.modalData.templateDescription,
        isPublic: modal.modalData.public,
        columns: tempList,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  // const ColumnRemove = () => {
  //   if (fileColumn !== '' && fileColumn.length > 0) {
  //     const values = form.getFieldsValue();
  //     form.setFieldsValue({ ...values, columns: [] });
  //   }
  // };

  useEffect(() => {
    if (modal.visible) {
      getPowerBiInfo(modal.modalData.templateId);
    }
  }, [modal.visible]);

  return (
    <Modal
      className="editModal"
      title="Power BI File Properties"
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '75vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的75％就scroll
      onCancel={handleBeforeLeave}
      footer={
        <Space align="end">
          <Button disabled={loading} onClick={handleBeforeLeave}>
            Cancel
          </Button>
          <Button loading={loading} type="primary" onClick={form.submit}>
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
              <div style={{ display: 'flex' }}>
                <Upload
                  name="schemafile"
                  beforeUpload={handleBeforeSchemaUpload}
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
                  <Button style={{ width: '160px' }}>
                    <UploadOutlined /> Click to Upload
                  </Button>
                </Upload>
                {/* {schemaFileUrl && (
                  <Tooltip placement="top" title="Download schema file">
                    <div>
                      <a href={schemaFileUrl} download>
                        <FileTextOutlined
                          style={{
                            fontSize: '20px',
                            marginLeft: '10px',
                            lineHeight: '40px',
                            cursor: 'pointer',
                          }}
                        />
                      </a>
                    </div>
                  </Tooltip>
                )} */}
              </div>
            </Form.Item>
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
                              {/* <Select disabled>
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
                            >
                              <Input
                                placeholder="Column Description"
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
                      </Button>
                      {ColumnRemove()}
                      {fileColumn !== ''
                        ? fileColumn.forEach(item => {
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

EditTemplateModal.propTypes = {
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

EditTemplateModal.defaultProps = {
  onUploadExist: () => null,
};

export default EditTemplateModal;
