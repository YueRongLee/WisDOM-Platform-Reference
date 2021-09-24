/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import {
  Modal,
  Button,
  Form,
  Space,
  Input,
  Alert,
  message,
  Select,
  Spin,
} from 'antd';
import ReactGA from 'react-ga';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { ROLE_TYPE, INPUT_RULES } from '~~constants/index';
import { UserApi } from '~~apis/';
import { useQuery } from '~~hooks/';
import './GroupModalStyle.less';

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

const GroupModal = ({ modal, refresh, userInfo, disabled }) => {
  let timeout;
  let currentValue;
  const [isloading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchResultMember, setSearchResultMember] = useState([]);
  const [form] = Form.useForm();

  const searchMemberQuery = useQuery(UserApi.searchMember);
  const createGroupQuery = useQuery(UserApi.createGroup);
  const getMemberQuery = useQuery(UserApi.getGroupMember);
  const updateMemberQuery = useQuery(UserApi.updateMember);
  const { trackEvent } = useMatomo();
  const getMember = async () => {
    setIsLoading(true);
    try {
      const result = await getMemberQuery.exec({
        groupId: modal.modalData.groupId,
      });
      setSearchResultMember(
        result.members.filter(
          mem => mem.userId.toLowerCase() !== userInfo.emplId.toLowerCase(),
        ),
      );
      form.setFieldsValue({
        // ...form.getFieldsValue,
        groupName: modal.modalData.groupName,
        reason: modal.modalData.reason,
        userIds: result.members.map(m => m.userId.toLowerCase()),
      });
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (modal.visible) {
      form.resetFields();
      if (modal.modalData) {
        getMember();
      } else {
        form.setFieldsValue({
          ...form.getFieldsValue,
          userIds: [userInfo.emplId.toLowerCase()],
        });
      }
    }
  }, [modal.visible]);

  const handleBeforeLeave = () => {
    setError(false);
    setSearchResultMember([]);
    form.resetFields();
    modal.closeModal();
  };

  const handleApply = async formData => {
    let recordAction = '';
    if (modal.modalData) recordAction = 'Edit group';
    else if (localStorage.getItem('role').includes(ROLE_TYPE.SYSTEM_MASTER)) {
      recordAction = 'Create group';
    } else recordAction = 'Apply group';

    ReactGA.event({
      category: 'Group',
      action: recordAction,
    });
    trackEvent({
      category: 'Group',
      action: recordAction,
    });

    setIsLoading(true);
    try {
      const data = {
        ...formData,
        userIds: formData.userIds.filter(
          user => user.toLowerCase() !== userInfo.emplId.toLowerCase(),
        ),
      };
      if (!modal.modalData) {
        await createGroupQuery.exec(data);
        message.success(
          'Your application form has been submitted successfully.',
        );
      } else {
        await updateMemberQuery.exec({
          groupId: modal.modalData.groupId,
          userId: data.userIds,
        });
        message.success('Your group has been saved successfully.');
      }
      handleBeforeLeave();
      refresh();
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTitle = () => {
    let title = 'Group';
    if (modal.modalData) {
      title = `Edit ${title}`;
    } else if (localStorage.getItem('role').includes(ROLE_TYPE.SYSTEM_MASTER)) {
      title = `Create ${title}`;
    } else {
      title = `Apply ${title}`;
    }
    return title;
  };

  const fetch = (value, callback) => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    currentValue = value;

    timeout = setTimeout(async () => {
      if (currentValue === value) {
        const result = await searchMemberQuery.exec({ keywords: value });
        callback(result);
      }
    }, 300);
  };

  const handleSearch = value => {
    // 三個字才搜尋
    if (value && value.length > 2) {
      fetch(value, data =>
        setSearchResultMember(
          data.filter(
            user => user.userId.toLowerCase() !== userInfo.emplId.toLowerCase(),
          ),
        ),
      );
    } else {
      setSearchResultMember([]);
    }
  };

  return (
    <Modal
      title={renderTitle()}
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的70％就scroll
      onCancel={handleBeforeLeave}
      width={600}
      footer={
        <Space align="end">
          <Button disabled={isloading} onClick={handleBeforeLeave}>
            Cancel
          </Button>
          <Button
            disabled={getMemberQuery.error || disabled}
            loading={isloading}
            type="primary"
            onClick={form.submit}
          >
            Confirm
          </Button>
        </Space>
      }
      destroyOnClose
      closable={!isloading}
      maskClosable={!isloading}
    >
      {error ? (
        <div style={{ marginBottom: 24 }}>
          <Alert message={error} type="Error" showIcon />
        </div>
      ) : null}
      <Spin spinning={isloading}>
        <Form
          {...formItemLayout}
          form={form}
          name="group"
          onFinish={handleApply}
          scrollToFirstError
          initialValues={modal.modalData}
        >
          <Form.Item
            label="Group Name"
            name="groupName"
            rules={[
              {
                required: !modal.modalData,
                message: 'Please input Group Name!',
              },
            ]}
          >
            <Input
              placeholder="Group Name"
              disabled={modal.modalData}
              maxLength={INPUT_RULES.GROUP_NAME.value}
            />
          </Form.Item>
          <Form.Item
            label="Apply Reason"
            name="reason"
            rules={[
              { required: !modal.modalData, message: 'Please input Reason!' },
            ]}
          >
            <Input.TextArea
              placeholder="Reason"
              disabled={modal.modalData}
              rows={4}
              maxLength={INPUT_RULES.REASON.value}
            />
          </Form.Item>
          <Form.Item
            name="userIds"
            label="Members"
            rules={[
              {
                required: true,
                message: 'Please add a Member',
              },
            ]}
          >
            <Select
              disabled={disabled}
              showSearch
              mode="multiple"
              placeholder="Member Name"
              defaultActiveFirstOption={false}
              showArrow={false}
              filterOption={(inputValue, option) =>
                option.value !== userInfo.emplId
              }
              onSearch={handleSearch}
              notFoundContent={null}
            >
              <Select.Option
                className="hide-default"
                value={userInfo.emplId.toLowerCase()}
                disabled
              >
                {userInfo.lastName}
              </Select.Option>
              {searchResultMember &&
                searchResultMember.map(d => (
                  <Select.Option
                    key={d.userId}
                    value={d.userId}
                    disabled={d.userId === userInfo.emplId}
                  >
                    {d.userNameEn}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

GroupModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,

  refresh: PropTypes.func,
  userInfo: PropTypes.shape({}),
  disabled: PropTypes.bool,
};

GroupModal.defaultProps = {
  refresh: () => null,
  userInfo: {},
  disabled: false,
};

export default GroupModal;
