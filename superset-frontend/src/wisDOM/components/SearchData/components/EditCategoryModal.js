/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Space, Select, message, Spin } from 'antd';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { TableApi } from '~~apis/';
import { useQuery } from '~~hooks/';
import '../../../MainStyle.less';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

const EditCategoryModal = ({ modal, sourceData, categoryList, refresh }) => {
  const [form] = Form.useForm();
  const [select, setSelect] = useState(''); // category
  const saveChangeCategory = useQuery(TableApi.changeCategory);
  const { trackEvent } = useMatomo();

  const handleBeforeLeave = () => {
    refresh(sourceData.table.guid);
    form.resetFields();
    modal.closeModal();
  };

  const handleSelect = value => {
    setSelect(value);
  };

  const handleFinish = async () => {
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
        category: select,
        tableName: sourceData.table.name,
      };
      await saveChangeCategory.exec(req);
      message.success('Data Domain change successfully.');
      modal.closeModal();
    } catch (e) {
      console.log(e);
    }
    handleBeforeLeave();
  };

  useEffect(() => {
    if (sourceData.length !== 0) {
      form.setFieldsValue({
        categories: sourceData.table.categories,
      });
    }
  }, [modal.visible, sourceData]);

  return (
    <div>
      {sourceData.table && sourceData.table.name && categoryList.length > 0 ? (
        <Modal
          className="EditCategoryModal"
          width={400}
          title="Edit Data Domain"
          visible={modal.visible}
          onCancel={modal.closeModal}
          bodyStyle={{
            maxHeight: '70vh',
            overflow: 'auto',
          }} // 高度自動,超過螢幕的70％就scroll
          footer={
            <Space align="end">
              <Button
                disabled={saveChangeCategory.isLoading}
                onClick={modal.closeModal}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={form.submit}
                loading={saveChangeCategory.isLoading}
                disabled={select === ''}
              >
                Save
              </Button>
            </Space>
          }
          maskClosable={!saveChangeCategory.isLoading}
          closable={!saveChangeCategory.isLoading}
        >
          <Spin spinning={saveChangeCategory.isLoading}>
            <Form
              {...formItemLayout}
              form={form}
              name="Edit"
              scrollToFirstError
              destroyOnClose
              onFinish={handleFinish}
            >
              <Form.Item
                label="Data Domain"
                name="categories"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select
                  showSearch
                  style={{ width: 150 }}
                  placeholder="Select a Data Domain"
                  onChange={handleSelect}
                  allowClear
                >
                  {categoryList.map(e => (
                    <Select.Option value={e}>{e}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Spin>
        </Modal>
      ) : null}
    </div>
  );
};

EditCategoryModal.propTypes = {
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

EditCategoryModal.defaultProps = {
  refresh: () => null,
};

export default EditCategoryModal;
