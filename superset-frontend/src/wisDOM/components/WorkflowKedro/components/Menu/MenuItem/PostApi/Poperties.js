/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
/* eslint-disable import/extensions */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { result } from 'lodash';
import {
  Button,
  Form,
  Input,
  Upload,
  message,
  Table,
  Spin,
  Result,
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  CopyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import * as Style from './style';
import { WorkFlowApi } from '~~apis/';
import AppConfig from '~~config';

const PostApiPoperties = ({ nodeData, data, workflowSeqId }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const getApiNodeUrl = async seqId => {
    try {
      const result = await WorkFlowApi.getApiNodeUrl(seqId);
      setApiUrl(`${AppConfig.serverUrl}/${result.path}`);
      setApiToken(result.token);
      setError(false);
    } catch (e) {
      console.log(e);
      setError(true);
    }
  };
  const copyUrl = () => {
    const el = document.createElement('textarea');
    el.value = apiUrl;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    message.success('Copy successfully!');
  };

  const copyToken = () => {
    const el = document.createElement('textarea');
    el.value = apiToken;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    message.success('Copy successfully!');
  };

  useEffect(() => {
    if (workflowSeqId) {
      getApiNodeUrl(workflowSeqId);
    }
  }, []);

  return (
    <div className="postAPI">
      <Spin spinning={isLoading}>
        <Style.Title>Manually trigger a flow </Style.Title>
        {}
        {workflowSeqId && !error ? null : (
          <div style={{ margin: '10px 25px' }}>
            <WarningOutlined
              style={{
                margin: '0px 15px 0px 0px',
                color: 'goldenrod',
                fontSize: '20px',
              }}
            />
            Please save the workflow first, then we will generate api url and
            token for you
          </div>
        )}
        <Form>
          <Form.Item
            label="Post API:"
            style={{ width: '100%', padding: '28px 24px 0 24px' }}
          >
            <Input.TextArea
              style={{ cursor: 'default', color: '#000000bf' }}
              disabled
              placeholder={apiUrl}
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>
          <Style.CopyButton
            className="copyBtn"
            data-test="copyBtnPostAPI"
            onClick={copyUrl}
            disabled={!workflowSeqId}
            style={{ marginTop: '10px' }}
          >
            <CopyOutlined /> Copy
          </Style.CopyButton>

          <Form.Item
            name="tableAndFile"
            label="Token:"
            style={{ width: '100%', padding: '28px 24px 0 24px' }}
          >
            <Input.TextArea
              style={{ cursor: 'default', color: '#000000bf' }}
              disabled
              placeholder={apiToken}
              autoSize={{ minRows: 1, maxRows: 4 }}
            />
          </Form.Item>
          <Style.CopyButton
            className="copyBtn"
            data-test="copyBtnUrl"
            onClick={copyToken}
            disabled={!workflowSeqId}
            style={{ marginTop: '5px' }}
          >
            <CopyOutlined /> Copy
          </Style.CopyButton>
        </Form>
      </Spin>
    </div>
  );
};

export default PostApiPoperties;
