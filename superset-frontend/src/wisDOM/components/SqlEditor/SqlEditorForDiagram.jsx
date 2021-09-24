/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Table, Button, Form } from 'antd';
import { FileSearchOutlined, FormOutlined } from '@ant-design/icons';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useQuery, useModal } from '~~hooks/';
import { PreviewApi } from '~~apis/';
import { TABLE_NAME_RULES, INPUT_RULES } from '~~constants/index';
import ColumnPopover from './ColumnPopover';
import './SqlEditorStyle.less';

const { TextArea } = Input;

const SqlEditorForDiagram = ({
  formRef,
  oEntity,
  readOnly,
  previewInfo,
  setPreviewInfo,
  customized,
  editMode,
  groupId,
}) => {
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [form] = Form.useForm();
  const { trackEvent } = useMatomo();
  formRef(form);
  const previewSql = useQuery(PreviewApi.previewETL);
  const colModal = useModal();

  const onColumnPropChange = colData => {
    const newPreviewInfo = { ...previewInfo };
    const cdmProperties = newPreviewInfo.cdmProperties.map(cdm => ({ ...cdm }));
    const colIndex = cdmProperties.findIndex(
      p => p.columnName === colData.columnName,
    );
    if (colIndex !== -1) {
      cdmProperties[colIndex].columnDesc = colData.columnDesc;
      cdmProperties[colIndex].columnType = colData.columnType;
      cdmProperties[colIndex].relationEntity = colData.relationEntity;
      cdmProperties[colIndex].relationColumn = colData.relationColumn;
    }
    setPreviewInfo({ ...newPreviewInfo, cdmProperties });
  };

  const tableColumns = () => {
    let columns = [];
    if (previewInfo.previewData) {
      if (previewInfo.previewData.length > 0) {
        columns = Object.keys(previewInfo.previewData[0]).map(col => {
          const colObj = previewInfo.cdmProperties.find(
            p => p.columnName === col,
          );
          return {
            title: (
              <ColumnPopover
                onSave={onColumnPropChange}
                modal={colModal}
                data={col}
                allEntity={oEntity.filter(en => en.guid !== previewInfo.guid)}
                columnDesc={
                  (
                    previewInfo.columns.find(sc => sc.name === col) || {
                      comment: '',
                    }
                  ).comment
                }
              >
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() => colModal.openModal(colObj)}
                  onKeyDown={() => colModal.openModal(colObj)}
                  role="button"
                  tabIndex={-1}
                >
                  {colObj.columnDesc && '*'}
                  {col}
                </div>
              </ColumnPopover>
            ),
            dataIndex: col,
          };
        });
      }
    }
    return columns;
  };

  const checkDataType = (data, type) => {
    if (type) {
      if (type.indexOf('decimal') > -1) {
        return 'decimal';
      }
      if (type.indexOf('timestamp') > -1) {
        return 'datetime';
      }
      if (type.indexOf('int') > -1) {
        return 'int64';
      }
      if (type.indexOf('bool') > -1) {
        return 'boolean';
      }
      if (type.indexOf('float') > -1) {
        return 'decimal';
      }
      if (type.indexOf('double') > -1) {
        return 'double';
      }
    }
    return 'string';
  };

  const onPreviewClick = async formData => {
    trackEvent({
      category: 'ETL',
      action: 'Preview table in OutputSettingNode',
    });
    setIsPreviewLoading(true);
    try {
      // setPreviewData([]);
      setPreviewInfo({
        ...previewInfo,
        previewData: [],
      });

      const response = await previewSql.exec({
        sql: form.getFieldValue('sql') || previewInfo.sql,
        groupId,
      });

      if (response === 'fetch_error') {
        setIsPreviewLoading(false);
        return;
      }
      if (response.length > 0) {
        const { columns } = previewInfo;
        const cdmProperties = Object.keys(response[0]).map(data => ({
          columnId: (previewInfo.columns.find(s => s.name === data) || {}).guid,
          columnName: data,
          columnDesc:
            columns.length > 0
              ? (
                  previewInfo.columns.find(sc => sc.name === data) || {
                    comment: '',
                  }
                ).comment
              : '',
          columnType:
            columns.length > 0
              ? checkDataType(
                  data,
                  (columns.find(c => c.name === data) || {}).type,
                )
              : 'string',
          relationEntity: '',
          relationColumn: '',
        }));
        let newColumns = [];
        if (columns.length === 0) {
          newColumns = cdmProperties.map(c => ({
            name: c.columnName,
            type: c.columnType,
            comment: '',
          }));
        }
        const info = {
          ...previewInfo,
          excutable: true && formData.entityName !== '',
          cdmProperties,
          previewData: response,
          columns: columns.length === 0 ? newColumns : columns,
        };
        setPreviewInfo(info);
        setIsPreviewLoading(false);
      } else {
        setIsPreviewLoading(false);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const onEditClick = () => {
    setPreviewInfo({
      ...previewInfo,
      previewData: [],
    });
  };

  const layout = readOnly
    ? { labelCol: { span: 3 }, wrapperCol: { span: 21 } }
    : { labelCol: { span: 0 }, wrapperCol: { span: 24 } };

  const disabled = () =>
    (previewInfo.previewData && previewInfo.previewData.length) ||
    isPreviewLoading ||
    readOnly;

  return (
    <div className="sqlEditorContainer">
      <Form
        name="basic"
        initialValues={{
          ...previewInfo,
          entityName: previewInfo.entityName || previewInfo.name,
          entityDesc: previewInfo.entityDesc || previewInfo.comment,
        }}
        onFinish={onPreviewClick}
        {...layout}
        form={form}
        ini
      >
        <div className="entityContainer">
          <div style={{ flex: 1 }}>
            <Form.Item
              name="entityName"
              label={readOnly ? 'Name' : undefined}
              rules={[
                {
                  required: true,
                  message: 'Please input entity name',
                },
                {
                  pattern: TABLE_NAME_RULES.pattern,
                  message:
                    'Start with alphabet and accept only letters(A-Za-z), numbers(0-9) and underline(_)',
                },
                () => ({
                  validator(rule, value) {
                    if (editMode || oEntity.every(e => e.name !== value)) {
                      return Promise.resolve();
                    }
                    // eslint-disable-next-line prefer-promise-reject-errors
                    return Promise.reject('Table name is duplicated');
                  },
                  validateTrigger: ['onSubmit', 'onClick'],
                }),
              ]}
              normalize={value => (value || '').toLowerCase()}
            >
              <Input
                style={{ width: '100%' }}
                disabled={disabled() || editMode}
                className="exploreInput"
                placeholder="Entity Name"
                maxLength={INPUT_RULES.ENTITY_NAME.value}
              />
            </Form.Item>
          </div>
          {!readOnly ? (
            <>
              <Button
                className="exploreButton"
                type="primary"
                onClick={form && form.submit}
                disabled={isPreviewLoading}
                icon={<FileSearchOutlined />}
              >
                Preview
              </Button>
              <Button
                className="exploreButton"
                onClick={onEditClick}
                disabled={isPreviewLoading}
                icon={<FormOutlined />}
              >
                Edit
              </Button>
            </>
          ) : null}
        </div>
        <Form.Item
          name="entityDesc"
          label={readOnly ? 'Description' : undefined}
        >
          <Input
            style={{ width: '100%' }}
            className="exploreInput"
            placeholder="Entity Description"
            disabled={disabled()}
            maxLength={INPUT_RULES.ENTITY_DESCRIPTION.value}
          />
        </Form.Item>
        <Form.Item
          name="sql"
          label={readOnly ? 'Command' : undefined}
          rules={[
            {
              required: true,
              message: 'Please input sql script',
            },
          ]}
        >
          <TextArea
            rows={4}
            disabled={disabled() || !customized}
            placeholder="Select [column1, column2...] from [table]"
          />
        </Form.Item>
        {!readOnly && (
          <>
            <Table
              columns={tableColumns()}
              dataSource={previewInfo.previewData}
              size="middle"
              pagination={false}
              scroll={{ x: 500 }}
              loading={isPreviewLoading}
            />
            <br />
          </>
        )}
      </Form>
    </div>
  );
};

SqlEditorForDiagram.propTypes = {
  key: PropTypes.number,
  previewInfo: PropTypes.shape({}),
  setPreviewInfo: PropTypes.func,
  readOnly: PropTypes.bool,
  editMode: PropTypes.bool,
  groupId: PropTypes.number,
};

SqlEditorForDiagram.defaultProps = {
  key: Math.random(),
  previewInfo: {},
  setPreviewInfo: () => null,
  readOnly: false,
  editMode: false,
  groupId: 0,
};

export default SqlEditorForDiagram;
