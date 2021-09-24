/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useEffect } from 'react';
import { Modal, Button, Form, Space, Input, message, Spin } from 'antd';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { TableApi } from '~~apis/';
import { useQuery } from '~~hooks/';
import { INPUT_RULES } from '~~constants/index';
import './MainStyle.less';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

const EditDescriptModal = ({ modal, sourceData, refresh }) => {
  const [form] = Form.useForm();
  const editDescriptQuery = useQuery(TableApi.editDescription);
  const { trackEvent } = useMatomo();

  const handleBeforeLeave = () => {
    refresh();
    form.resetFields();
    modal.closeModal();
  };

  const handleFinish = async data => {
    ReactGA.event({
      category: 'Edit',
      action: 'Edit table description',
    });
    trackEvent({
      category: 'Edit',
      action: 'Edit table description',
    });
    try {
      const req = {
        guid: sourceData.table.guid,
        columns: form.getFieldValue('columns'),
        systemType: sourceData.table.systemType,
        tableDescription: data.tableDes !== undefined ? data.tableDes : null,
      };
      await editDescriptQuery.exec(req);
      message.success('All changes have been saved successfully.');
      modal.closeModal();
    } catch (e) {
      console.log(e);
    }
    handleBeforeLeave();
  };

  useEffect(() => {
    if (sourceData.length !== 0) {
      form.setFieldsValue({
        tableDes: sourceData.table.comment,
        columns: sourceData.table.columns.map(field => ({
          columnName: field.name,
          columnComment: field.comment,
        })),
      });
    }
  }, [modal.visible, sourceData]);

  return (
    <div>
      {sourceData.table && sourceData.table.name ? (
        <Modal
          className="EditDescriptModal"
          width={800}
          title="Edit Description"
          visible={modal.visible}
          onCancel={modal.closeModal}
          bodyStyle={{
            maxHeight: '70vh',
            overflow: 'auto',
          }} // 高度自動,超過螢幕的70％就scroll
          footer={
            <Space align="end">
              <Button
                disabled={editDescriptQuery.isLoading}
                onClick={modal.closeModal}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={form.submit}
                loading={editDescriptQuery.isLoading}
              >
                Save
              </Button>
            </Space>
          }
          maskClosable={!editDescriptQuery.isLoading}
          closable={!editDescriptQuery.isLoading}
        >
          <Spin spinning={editDescriptQuery.isLoading}>
            <Form
              {...formItemLayout}
              form={form}
              name="Edit"
              scrollToFirstError
              destroyOnClose
              onFinish={handleFinish}
            >
              <Form.Item
                label="Table Description"
                name="tableDes"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input
                  style={{ width: 412 }}
                  defaultValue={sourceData.table.comment}
                  disabled={editDescriptQuery.isLoading}
                  placeholder="Table Description"
                  maxLength={INPUT_RULES.TABLE_DESCRIPTION.value}
                />
              </Form.Item>
              <Form.Item label="Columns">
                <Form.List name="columns">
                  {fields => (
                    <div>
                      {fields.map(field => (
                        <Space
                          key={field.key}
                          className="columnRow"
                          align="center"
                        >
                          <Form.Item
                            {...field}
                            name={[field.name, 'columnName']}
                            fieldKey={[field.fieldKey, 'columnName']}
                          >
                            <Input
                              placeholder="Column Name"
                              disabled
                              defaultValue={field.columnName}
                            />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            name={[field.name, 'columnComment']}
                            fieldKey={[field.fieldKey, 'columnComment']}
                          >
                            <Input
                              placeholder="Column Description"
                              style={{ minWidth: 100, maxWidth: 500 }}
                              defaultValue={field.columnComment}
                              disabled={editDescriptQuery.isLoading}
                              maxLength={INPUT_RULES.COLUMN_DESCRIPTION.value}
                            />
                          </Form.Item>
                        </Space>
                      ))}
                    </div>
                  )}
                </Form.List>
              </Form.Item>
            </Form>
          </Spin>
        </Modal>
      ) : null}
    </div>
  );
};

EditDescriptModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  sourceData: PropTypes.shape({}).isRequired,
  refresh: PropTypes.func,
};

EditDescriptModal.defaultProps = {
  refresh: () => null,
};

export default EditDescriptModal;
