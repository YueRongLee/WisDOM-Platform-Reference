/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
/* eslint-disable import/extensions */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Form, Input, Button, Select, Tooltip, Modal } from 'antd';
import ReactQuill from 'react-quill';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useModal } from '~~hooks/';
import { FUNCTIONS } from '~~constants/index';
import 'react-quill/dist/quill.snow.css';
import './Poperties.less';
import * as Style from './style';

const infoUrl =
  'https://wisdomdataplatformprd.blob.core.windows.net/public/user_guide/getTeamsUrl.mp4';

const styles = {
  editor: {
    border: '1px solid gray',
    minHeight: '6em',
  },
};

const PostTeamsPoperties = ({ nodeData, data, setTeamsData }) => {
  // const [teamsId, setTeamsId] = useState([]);
  const [channelUrl, setChannelUrl] = useState('');
  const [message, setMessage] = useState('');
  const [form] = Form.useForm();

  const infoModal = useModal();

  const validateEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleValueChange = changedValues => {
    switch (Object.keys(changedValues)[0]) {
      case 'channelUrl':
        setChannelUrl(Object.values(changedValues)[0]);
        break;
      case 'message':
        setMessage(Object.values(changedValues)[0]);
        break;
      default:
        break;
    }
  };

  const onBlurChannelUrl = () => {
    const findNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    const newArgs = findNode[0].args;
    const tempArgs = {
      classification: newArgs.classification,
      name: newArgs.name,
      type: newArgs.type,
      channelUrl,
      message: newArgs.message,
    };
    setTeamsData(tempArgs);
  };

  const onBlurMessage = () => {
    const findNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    const newArgs = findNode[0].args;
    const tempArgs = {
      classification: newArgs.classification,
      name: newArgs.name,
      type: newArgs.type,
      channelUrl: newArgs.channelUrl,
      message,
    };
    setTeamsData(tempArgs);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  useEffect(() => {
    const temp = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (temp[0].args) {
      form.setFieldsValue({
        channelUrl: temp[0].args.channelUrl || '',
        message: temp[0].args.message || '',
      });
    }
  }, []);

  return (
    <Style.EmailScroll>
      <Form
        form={form}
        className="formListBlock"
        name="teams"
        scrollToFirstError
        initialValues={{
          channelUrl,
          message,
        }}
        onValuesChange={handleValueChange}
      >
        <div style={{ paddingLeft: '15px', marginTop: 20 }}>
          <span style={{ color: 'red' }}> * </span> <span>Channel URL </span>
          <Tooltip placement="top" title="How to get Channel URL">
            <InfoCircleOutlined
              data-test="InfoCircleOutlined"
              style={{
                fontSize: 18,
                marginLeft: 10,
                color: '#faad14',
              }}
              onClick={() => infoModal.openModal()}
            />
          </Tooltip>
        </div>
        <Form.Item
          name="channelUrl"
          rules={[
            {
              required: true,
              message: 'Please input Channel url',
            },
          ]}
        >
          <Input
            data-test="channelUrl"
            onBlur={() => onBlurChannelUrl()}
            disabled={!nodeData.edit}
          />
        </Form.Item>
        <div style={{ paddingLeft: '15px' }}>
          <span style={{ color: 'red' }}> * </span>Body
        </div>
        <Form.Item
          name="message"
          rules={[
            {
              required: true,
              message: 'Please input message',
            },
          ]}
        >
          <Style.NewReactQuill
            data-test="message"
            value={message}
            onBlur={onBlurMessage}
            readOnly={!nodeData.edit}
          />
        </Form.Item>
      </Form>
      <Modal
        title="How to get Channel URL"
        visible={infoModal.visible}
        onCancel={infoModal.closeModal}
        footer={null}
        width={700}
      >
        <ReactPlayer controls url={infoUrl} />
      </Modal>
    </Style.EmailScroll>
  );
};

export default PostTeamsPoperties;
