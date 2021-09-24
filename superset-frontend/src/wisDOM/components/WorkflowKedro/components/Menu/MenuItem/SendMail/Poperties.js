/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select } from 'antd';
import ReactQuill from 'react-quill';
import { FUNCTIONS } from '~~constants/index';
import 'react-quill/dist/quill.snow.css';
import './Poperties.less';
import * as Style from './style';

const styles = {
  editor: {
    border: '1px solid gray',
    minHeight: '6em',
  },
};

const SendMailPoperties = ({ nodeData, data, setMailData }) => {
  const [mailGroup, setMailGroup] = useState([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [form] = Form.useForm();

  const validateEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const onBlurMailGroup = tempMail => {
    const findNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    const newArgs = findNode[0].args;
    const tempArgs = {
      classification: newArgs.classification,
      name: newArgs.name,
      type: newArgs.type,
      to: tempMail && tempMail.length > 0 ? tempMail : mailGroup,
      subject: newArgs.subject,
      content: newArgs.content,
    };
    setMailData(tempArgs);
  };

  const handleValueChange = changedValues => {
    switch (Object.keys(changedValues)[0]) {
      case 'mailGroup':
        const tempMail = [];
        Object.values(changedValues)[0].forEach(mail => {
          if (validateEmail(mail)) {
            tempMail.push(mail);
          }
        });
        setMailGroup(tempMail);
        form.setFieldsValue({
          mailGroup: tempMail,
        });
        onBlurMailGroup(tempMail);
        break;

      case 'subject':
        setSubject(Object.values(changedValues)[0]);
        break;

      case 'content':
        setContent(Object.values(changedValues)[0]);
        break;

      default:
        break;
    }
  };

  const onBlurSubject = () => {
    const findNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    const newArgs = findNode[0].args;
    const tempArgs = {
      classification: newArgs.classification,
      name: newArgs.name,
      type: newArgs.type,
      to: newArgs.to,
      subject,
      content: newArgs.content,
    };
    setMailData(tempArgs);
  };

  const onBlurContent = () => {
    const findNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    const newArgs = findNode[0].args;
    const tempArgs = {
      classification: newArgs.classification,
      name: newArgs.name,
      type: newArgs.type,
      to: newArgs.to,
      subject: newArgs.subject,
      content,
    };
    setMailData(tempArgs);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  useEffect(() => {
    const temp = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (temp[0].args) {
      form.setFieldsValue({
        mailGroup: temp[0].args.to || [],
        subject: temp[0].args.subject || '',
        content: temp[0].args.content || '',
      });
    }
  }, []);

  return (
    <Style.EmailScroll>
      <Form
        form={form}
        className="formListBlock"
        name="mail"
        scrollToFirstError
        initialValues={{
          mailGroup,
          subject,
          content,
        }}
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        onValuesChange={handleValueChange}
      >
        <Form.Item
          label="To"
          name="mailGroup"
          rules={[
            {
              required: true,
              message: 'Please input mail',
            },
          ]}
          help="A list of valid email address separater by a comma and need email format"
        >
          <Select
            data-test="mailGroup"
            mode="tags"
            style={{ width: '100%' }}
            value={mailGroup}
            tokenSeparators={[';']}
            onBlur={() => onBlurMailGroup()}
            disabled={!nodeData.edit}
          />
        </Form.Item>
        <div style={{ paddingLeft: '15px' }}>
          <span style={{ color: 'red' }}> * </span>Subject
        </div>
        <Form.Item
          name="subject"
          rules={[
            {
              required: true,
              message: 'Please input subject',
            },
          ]}
          help="The Subject of the mail"
        >
          <Input
            data-test="subject"
            onBlur={() => onBlurSubject()}
            disabled={!nodeData.edit}
          />
        </Form.Item>
        <div style={{ paddingLeft: '15px' }}>
          <span style={{ color: 'red' }}> * </span>Body
        </div>
        <Form.Item
          name="content"
          rules={[
            {
              required: true,
              message: 'Please input content',
            },
          ]}
        >
          {/* <Input.TextArea
            rows={4}
            onBlur={() => onBlurContent()}
            disabled={!nodeData.edit}
          /> */}
          <Style.NewReactQuill
            data-test="content"
            value={content}
            onBlur={onBlurContent}
            readOnly={!nodeData.edit}
          />
        </Form.Item>
        {/* <Form.Item>
          <Button type="primary" htmlType="submit">
            Save draft
          </Button>
        </Form.Item> */}
        {/* <ReactQuill value={text} onChange={handleChange} /> */}
      </Form>
    </Style.EmailScroll>
  );
};

export default SendMailPoperties;
