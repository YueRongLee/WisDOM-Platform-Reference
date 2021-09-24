/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Button,
  Form,
  Space,
  Input,
  Alert,
  Select,
  message,
} from 'antd';
import ReactGA from 'react-ga';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { PreviewApi, NifiDeployApi, UserApi } from '~~apis/';
import { useQuery, useInterval } from '~~hooks/';
import { SYSTEM_TYPE, PREVIEW_STATUS, INPUT_RULES } from '~~constants/index';

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

const ConsumeModal = ({
  modal,
  checking,
  setChecking,
  updatePreviewName,
  refresh,
}) => {
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [form] = Form.useForm();
  const [tagList, setTagList] = useState([]);
  const [selectedTag, setSelectedTag] = useState([]);
  const consumeTableQuery = useQuery(NifiDeployApi.consumeTable);
  const getTagListQuery = useQuery(UserApi.getTags);
  const { trackEvent } = useMatomo();

  const getTagList = async () => {
    try {
      const result = await getTagListQuery.exec();
      if (result) setTagList(result);
    } catch (e) {
      console.log(e);
    }
  };

  const handleTagChange = changedTag => {
    setSelectedTag(changedTag);
  };

  useEffect(() => {
    getTagList();
  }, []);
  const handleBeforeLeave = () => {
    setError();
    setLoading(false);
    setNewName('');
    form.resetFields();
    modal.closeModal();
  };

  const getPreviewChecks = async () => {
    if (modal.modalData && modal.modalData.name && newName) {
      try {
        const result = await PreviewApi.getPreviewChecks([newName]);
        if (
          result[modal.modalData.name] === PREVIEW_STATUS.ALLOWED.value ||
          result[newName] === PREVIEW_STATUS.ALLOWED.value
        ) {
          // 拿到view後會新增一個wisdom table，外層search要重新做才會出現
          if (form.getFieldValue('scope')) {
            refresh();
          } else {
            updatePreviewName(
              modal.modalData,
              newName.replace('-', '_'),
              result[modal.modalData.name] || result[newName],
              SYSTEM_TYPE.props.WisDOM.key,
            );
          }
          handleBeforeLeave();
        }
        console.log('polling', result);
      } catch (e) {
        setError(e.message);
      }
    }
  };

  useInterval(
    () => {
      getPreviewChecks();
    },
    error || !modal.visible ? null : 2000,
  );

  const handleConsume = async data => {
    ReactGA.event({
      category: 'Consume',
      action: 'Consume table',
    });
    trackEvent({
      category: 'Consume',
      action: 'Consume table',
    });
    setError();
    const nextChecking = [].concat(checking);
    if (nextChecking.indexOf(modal.modalData.name) === -1) {
      nextChecking.push(modal.modalData.name);
      setChecking(nextChecking);
    }
    try {
      const req = {
        name: modal.modalData.name,
        sourceType: SYSTEM_TYPE.props[modal.modalData.systemType].key,
        ...data,
      };
      const result = await consumeTableQuery.exec(req);
      setLoading(true);
      setNewName(result);
      message.success('Consume successfully!');
      refresh();
    } catch (e) {
      console.log(e);
      if (JSON.parse(e.message).status === 403) {
        setError("You don't have permission to access!");
      } else setError(e.message);
    }
  };

  const renderHelpStr = () => {
    let rtn = '';
    if (modal.modalData && modal.modalData.systemType) {
      if (modal.modalData.systemType === SYSTEM_TYPE.props.ITKA.key) {
        rtn = 'Please input kafka connection information of this topic.';
      } else if (modal.modalData.systemType === SYSTEM_TYPE.props.ITPG.key) {
        rtn = 'Please input PostgreSQL connection information of this table.';
      }
    }
    return rtn ? <div style={{ paddingBottom: 20 }}>{rtn}</div> : rtn;
  };

  const getIsloading = () => loading || consumeTableQuery.isLoading;

  return (
    <Modal
      className="ConsumeModal"
      title={`Consume Data(${modal.modalData && modal.modalData.name})`}
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的70％就scroll
      onCancel={handleBeforeLeave}
      footer={
        <Space align="end">
          <Button
            data-test="cancel"
            disabled={getIsloading()}
            onClick={handleBeforeLeave}
          >
            Cancel
          </Button>
          <Button loading={getIsloading()} type="primary" onClick={form.submit}>
            Consume
          </Button>
        </Space>
      }
      destroyOnClose
      closable={!getIsloading()}
      maskClosable={!getIsloading()}
    >
      {error ? (
        <div style={{ marginBottom: 24 }}>
          <Alert message={error} type="error" showIcon />
        </div>
      ) : null}
      {renderHelpStr()}
      <Form
        {...formItemLayout}
        data-test="consume"
        form={form}
        name="consume"
        onFinish={handleConsume}
        scrollToFirstError
      >
        {modal.modalData &&
          modal.modalData.systemType === SYSTEM_TYPE.props.ITPG.key && (
            <>
              <Form.Item
                label="Scope"
                name="scope"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      // value有值則scope也要有
                      if (getFieldValue('value') && !value) {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        return Promise.reject('Scope is required');
                      }
                      return Promise.resolve();
                    },
                    validateTrigger: ['onSubmit', 'onClick'],
                  }),
                ]}
              >
                <Input maxLength={INPUT_RULES.CONSUME_SCOPE.value} />
              </Form.Item>
              <Form.Item
                label="Value"
                name="value"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      // scope有值則value也要有
                      if (getFieldValue('scope') && !value) {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        return Promise.reject('Value is required');
                      }
                      return Promise.resolve();
                    },
                    validateTrigger: ['onSubmit', 'onClick'],
                  }),
                ]}
              >
                <Input maxLength={INPUT_RULES.CONSUME_VALUE.value} />
              </Form.Item>
            </>
          )}
        <Form.Item
          label="Username"
          name="sourceUser"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input maxLength={INPUT_RULES.USER_NAME.value} />
        </Form.Item>

        <Form.Item
          label="Password"
          name="sourcePw"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password maxLength={INPUT_RULES.USER_PW.value} />
        </Form.Item>
        <Form.Item
          label="Data Domain"
          name="category"
          rules={[
            {
              required: true,
              message: 'Please select a data domain to apply!',
            },
          ]}
        >
          <Select
            disabled={!tagList}
            loading={getTagListQuery.isLoading}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            style={{ minWidth: '250px' }}
            value={selectedTag}
            onChange={handleTagChange}
          >
            {tagList.map(d => (
              <Select.Option key={d} value={d}>
                {d}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

ConsumeModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  refresh: PropTypes.func,
};

ConsumeModal.defaultProps = {
  refresh: () => null,
};

export default ConsumeModal;
