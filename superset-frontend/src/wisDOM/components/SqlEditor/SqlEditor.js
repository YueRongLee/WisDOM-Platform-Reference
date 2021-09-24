/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input, Table, Button, Form } from 'antd';
import {
  FileSearchOutlined,
  FormOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useQuery, useModal } from '~~hooks/';
import { PreviewApi } from '~~apis/';
import { INPUT_RULES } from '~~constants/index';
import ColumnPopover from './ColumnPopover';
import './SqlEditorStyle.less';

const { TextArea } = Input;

const SqlEditor = ({
  source,
  onPreviewSql,
  allEntity,
  onDelete,
  oEntity,
  readOnly,
}) => {
  const [sqlCommand, setSqlCommand] = useState(source.sql);
  const [disableSqlCommand, setDisableSqlCommand] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [entityName, setEntityName] = useState(
    source.name || source.entityName,
  );
  const [entityDesc, setEntityDesc] = useState(source.entityDesc);
  const [previewInfo, setPreviewInfo] = useState();
  const [form] = Form.useForm();
  const previewSql = useQuery(PreviewApi.previewETL);
  const colModal = useModal();

  useEffect(() => {
    // setPreviewInfo(source);
    setEntityName(source.name || source.entityName);
    setEntityDesc(source.entityDesc);
    setSqlCommand(source.sql);
    setPreviewData(source.previewData ? source.previewData : []);
    const info = {
      ...previewInfo,
      guid: source.guid,
      excutable: previewData.length > 0 && source.name !== '',
      name: source.name || source.entityName,
      sql: source.sql,
      previewData: source.previewData ? source.previewData : [],
      entityDesc: source.entityDesc,
    };
    setPreviewInfo(info);
    onPreviewSql(info);
  }, [source]);

  const onColumnPropChange = colData => {
    const newPreviewInfo = { ...previewInfo };
    const colIndex = newPreviewInfo.cdmProperties.findIndex(
      p => p.columnName === colData.columnName,
    );
    if (colIndex !== -1) {
      newPreviewInfo.cdmProperties[colIndex].columnDesc = colData.columnDesc;
      newPreviewInfo.cdmProperties[colIndex].columnType = colData.columnType;
      newPreviewInfo.cdmProperties[colIndex].relationEntity =
        colData.relationEntity;
      newPreviewInfo.cdmProperties[colIndex].relationColumn =
        colData.relationColumn;
    }
    // console.log('onColumnPropChange', { ...newPreviewInfo });
    setPreviewInfo({ ...newPreviewInfo });
    onPreviewSql({
      ...newPreviewInfo,
      excutable: true && previewData.length > 0,
      sql: sqlCommand || source.sql,
    });
  };

  const tableColumns = () => {
    let columns = [];
    if (previewData) {
      if (previewData.length > 0) {
        columns = Object.keys(source.previewData[0]).map(col => {
          // const colObj = previewInfo.cdmProperties.find(p => p.columnName === col);
          const colObj = source.cdmProperties.find(p => p.columnName === col);
          return {
            title: (
              <ColumnPopover
                onSave={onColumnPropChange}
                modal={colModal}
                data={col}
                allEntity={allEntity.filter(en => en.guid !== source.guid)}
                columnDesc={source.columns.find(sc => sc.name === col).comment}
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
    return 'string';
  };

  const onPreviewClick = async () => {
    setIsPreviewLoading(true);
    try {
      setPreviewData([]);
      const response = await previewSql.exec({ sql: sqlCommand || source.sql });
      if (response === 'fetch_error') {
        setDisableSqlCommand(false);
        setIsPreviewLoading(false);
        return;
      }
      if (response.length > 0) {
        const { columns } = source;
        const cdmProperties = Object.keys(response[0]).map(data => ({
          columnId: (source.children.find(s => s.name === data) || {}).guid,
          columnName: data,
          columnDesc:
            columns.length > 0
              ? source.columns.find(sc => sc.name === data).comment
              : '',
          columnType:
            columns.length > 0
              ? checkDataType(data, columns.find(c => c.name === data).type)
              : 'string',
          relationEntity: '',
          relationColumn: '',
        }));
        // console.log('cdmProperties', cdmProperties);
        let newColumns = [];
        if (columns.length === 0) {
          newColumns = cdmProperties.map(c => ({
            name: c.columnName,
            type: c.columnType,
            comment: '',
          }));
        }
        // console.log('entityName', entityName);
        // console.log('entityName', source.name);
        const info = {
          ...previewInfo,
          guid: source.guid,
          excutable: true && entityName !== '',
          name: source.name || entityName,
          sql: sqlCommand || source.sql,
          cdmProperties,
          previewData: response,
          columns: columns.length === 0 ? newColumns : columns,
        };
        setPreviewInfo(info);
        onPreviewSql(info);
        setPreviewData(response);
        setDisableSqlCommand(true);
        setIsPreviewLoading(false);
      } else {
        setDisableSqlCommand(false);
        setIsPreviewLoading(false);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const onEditClick = () => {
    setPreviewData([]);
    setDisableSqlCommand(false);
    onPreviewSql({
      ...previewInfo,
      excutable: false,
      columns: [],
    });
  };

  const onEntityNameChange = e => {
    setEntityName(e.target.value);
    const info = {
      ...previewInfo,
      guid: source.guid,
      excutable: e.target.value !== '' && previewData.length > 0,
      name: e.target.value,
      sql: sqlCommand,
      previewData,
    };
    setPreviewInfo(info);
    onPreviewSql(info);
  };

  const onEntityDescChange = e => {
    setEntityDesc(e.target.value);
    const info = {
      ...previewInfo,
      guid: source.guid,
      excutable: true && entityName !== '' && previewData.length > 0,
      name: entityName,
      sql: sqlCommand || source.sql,
      entityDesc: e.target.value,
      previewData,
    };
    setPreviewInfo(info);
    onPreviewSql(info);
  };

  const layout = readOnly
    ? { labelCol: { span: 3 }, wrapperCol: { span: 21 } }
    : { labelCol: { span: 0 }, wrapperCol: { span: 24 } };

  return (
    <div className="sqlEditorContainer">
      <Form
        name="basic"
        // onFinishFailed={onFinishFailed}
        initialValues={{
          entityName,
        }}
        onFinish={onPreviewClick}
        {...layout}
        form={form}
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
                  pattern: new RegExp(/^[A-Za-z]+[A-Za-z0-9_]*$/i),
                  message:
                    'Start with alphabet and accept only letters(A-Za-z), numbers(0-9) and underline(_)',
                },
                () => ({
                  validator(rule, value) {
                    if (
                      oEntity.every(e => e.name !== value) &&
                      allEntity.every(
                        e =>
                          e.guid === source.guid ||
                          (e.guid !== source.guid && e.name !== value),
                      )
                    ) {
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
                disabled={disableSqlCommand || isPreviewLoading || readOnly}
                className="exploreInput"
                placeholder="Entity Name"
                value={entityName}
                onChange={onEntityNameChange}
                maxLength={INPUT_RULES.ENTITY_NAME.value}
              />
            </Form.Item>
          </div>
          {!readOnly ? (
            <>
              <Button
                className="exploreButton"
                type="primary"
                onClick={form.submit}
                disabled={isPreviewLoading || sqlCommand === ''}
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
              {!source.owner ? (
                <Button
                  className="exploreButton"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => onDelete(source.guid)}
                />
              ) : null}
            </>
          ) : null}
        </div>
        <Form.Item label={readOnly ? 'Description' : undefined}>
          <Input
            style={{ width: '100%' }}
            className="exploreInput"
            placeholder="Entity Description"
            value={entityDesc}
            onChange={onEntityDescChange}
            disabled={disableSqlCommand || isPreviewLoading || readOnly}
            maxLength={INPUT_RULES.ENTITY_DESCRIPTION.value}
          />
        </Form.Item>
        <Form.Item label={readOnly ? 'Command' : undefined}>
          <TextArea
            rows={4}
            value={sqlCommand || source.sql}
            onChange={e => setSqlCommand(e.target.value)}
            disabled={disableSqlCommand || isPreviewLoading || readOnly}
            placeholder="Select [column1, column2...] from [table]"
          />
        </Form.Item>
        {!readOnly && (
          <>
            <Table
              columns={tableColumns()}
              dataSource={previewData}
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

SqlEditor.propTypes = {
  onPreviewSql: PropTypes.func,
  readOnly: PropTypes.bool,
};

SqlEditor.defaultProps = {
  onPreviewSql: () => null,
  readOnly: false,
};

export default SqlEditor;
